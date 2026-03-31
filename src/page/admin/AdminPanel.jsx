import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Select, MenuItem, Alert, CircularProgress,
  Card, CardContent, Grid, Tabs, Tab, IconButton, Pagination
} from '@mui/material';
import { FiLock, FiMessageSquare, FiUsers, FiFileText, FiSend, FiRefreshCw, FiStar, FiX, FiCheck } from 'react-icons/fi';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState('resolved');
    const [subscribers, setSubscribers] = useState([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionDialog, setSubscriptionDialog] = useState({ open: false, userId: null, username: '' });
  const [subscriptionAction, setSubscriptionAction] = useState('grant');
  const [subscriptionDuration, setSubscriptionDuration] = useState(30);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      loadData();
    }
    checkBlockStatus();
  }, []);

  const checkBlockStatus = async () => {
    try {
      const res = await fetch('https://atomglidedev.ru/support/admin/check-block');
      const data = await res.json();
      if (data.blocked) {
        setBlocked(true);
        setError(`Доступ заблокирован. Осталось ${data.remainingHours} часов`);
      } else {
        setAttemptsLeft(data.attemptsLeft);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (blocked) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:3000/support/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        loadData();
      } else {
        if (data.blocked) {
          setBlocked(true);
        }
        setError(data.error);
        if (data.attemptsLeft !== undefined) {
          setAttemptsLeft(data.attemptsLeft);
        }
      }
    } catch (err) {
      setError('Ошибка сети');
    }
    setLoading(false);
  };

  const loadData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`https://atomglidedev.ru/support/admin/tickets?page=${page}&status=${statusFilter}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('https://atomglidedev.ru/support/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      const ticketsData = await ticketsRes.json();
      const statsData = await statsRes.json();
      
      if (ticketsRes.status === 401) {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        return;
      }
      
      setTickets(ticketsData.tickets || []);
      setTotalPages(ticketsData.totalPages || 1);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      if (currentTab === 1) loadSubscribers();
    }
  }, [page, statusFilter, isAuthenticated, currentTab]);
  
  const loadSubscribers = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
      const res = await fetch('https://atomglidedev.ru/admin/subscription/subscribers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleSubscriptionAction = async () => {
    if (!subscriptionDialog.userId) return;
    
    setSubscriptionLoading(true);
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    try {
      const res = await fetch('https://atomglidedev.ru/admin/subscription/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: subscriptionDialog.userId,
          action: subscriptionAction,
          duration: subscriptionAction === 'grant' ? subscriptionDuration : undefined
        })
      });
      
      if (res.ok) {
        setSubscriptionDialog({ open: false, userId: null, username: '' });
        loadSubscribers();
      }
    } catch (err) {
      console.error(err);
    }
    setSubscriptionLoading(false);
  };

  const handleRespond = async () => {
    if (!responseText.trim()) return;
    
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    
    try {
      const res = await fetch(`https://atomglidedev.ru/support/admin/tickets/${selectedTicket._id}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ response: responseText, status: responseStatus })
      });
      
      if (res.ok) {
        setSelectedTicket(null);
        setResponseText('');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      in_progress: 'info',
      resolved: 'success',
      rejected: 'error'
    };
    return colors[status] || 'default';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      resolved: 'Решено',
      rejected: 'Отклонено'
    };
    return labels[status] || status;
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#0a0a0a'
      }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', bgcolor: '#121212', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <FiLock size={24} color="rgb(237,93,25)" />
            <Typography variant="h5">Админ-панель AtomGlide</Typography>
          </Box>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {!blocked && attemptsLeft < 5 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Осталось попыток: {attemptsLeft}
            </Alert>
          )}
          
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Никнейм аккаунта"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              disabled={blocked}
              sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: 'white' } }}
            />
            <TextField
              fullWidth
              type="password"
              label="Специальный пароль"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              disabled={blocked}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { color: 'white' } }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading || blocked}
              sx={{ bgcolor: 'rgb(237,93,25)', '&:hover': { bgcolor: 'rgb(200,80,20)' } }}
            >
              {loading ? <CircularProgress size={24} /> : 'Войти'}
            </Button>
          </form>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#0a0a0a', color: 'white', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Админ-панель</Typography>
        <Box>
          <IconButton onClick={loadData} sx={{ color: 'white', mr: 1 }}>
            <FiRefreshCw />
          </IconButton>
          <Button onClick={handleLogout} variant="outlined" color="error">
            Выйти
          </Button>
        </Box>
      </Box>

      <Paper sx={{ bgcolor: '#121212', mb: 2 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Поддержка" sx={{ color: 'white' }} />
          <Tab label="AtomPro+ Подписки" sx={{ color: 'white' }} />
        </Tabs>
      </Paper>

      {currentTab === 0 && (
        <>
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiMessageSquare color="rgb(237,93,25)" />
                  <Typography color="gray">Всего обращений</Typography>
                </Box>
                <Typography variant="h4" color="white">{stats.tickets.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiMessageSquare color="#f59e0b" />
                  <Typography color="gray">Ожидают ответа</Typography>
                </Box>
                <Typography variant="h4" color="white">{stats.tickets.pending}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiUsers color="#22c55e" />
                  <Typography color="gray">Пользователей</Typography>
                </Box>
                <Typography variant="h4" color="white">{stats.users}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: '#1a1a1a' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FiFileText color="#3b82f6" />
                  <Typography color="gray">Постов</Typography>
                </Box>
                <Typography variant="h4" color="white">{stats.posts}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <Paper sx={{ bgcolor: '#121212', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            displayEmpty
            size="small"
            sx={{ minWidth: 150, color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' } }}
          >
            <MenuItem value="">Все статусы</MenuItem>
            <MenuItem value="pending">Ожидают</MenuItem>
            <MenuItem value="in_progress">В работе</MenuItem>
            <MenuItem value="resolved">Решено</MenuItem>
            <MenuItem value="rejected">Отклонено</MenuItem>
          </Select>
        </Box>
      </Paper>

      <TableContainer component={Paper} sx={{ bgcolor: '#121212' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: 'gray' }}>Дата</TableCell>
              <TableCell sx={{ color: 'gray' }}>Имя</TableCell>
              <TableCell sx={{ color: 'gray' }}>Никнейм</TableCell>
              <TableCell sx={{ color: 'gray' }}>Тип</TableCell>
              <TableCell sx={{ color: 'gray' }}>Статус</TableCell>
              <TableCell sx={{ color: 'gray' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket._id} hover sx={{ '&:hover': { bgcolor: '#1a1a1a' } }}>
                <TableCell sx={{ color: 'white' }}>
                  {new Date(ticket.createdAt).toLocaleDateString('ru-RU')}
                </TableCell>
                <TableCell sx={{ color: 'white' }}>{ticket.name}</TableCell>
                <TableCell sx={{ color: 'white' }}>@{ticket.nickname}</TableCell>
                <TableCell sx={{ color: 'white' }}>{ticket.type}</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(ticket.status)} 
                    color={getStatusColor(ticket.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => setSelectedTicket(ticket)}
                    sx={{ color: 'rgb(237,93,25)' }}
                  >
                    Открыть
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, v) => setPage(v)}
          color="primary"
          sx={{ '& .MuiPaginationItem-root': { color: 'white' } }}
        />
      </Box>

      <Dialog 
        open={!!selectedTicket} 
        onClose={() => setSelectedTicket(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#121212', color: 'white' } }}
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              Обращение от @{selectedTicket.nickname}
              <Chip 
                label={getStatusLabel(selectedTicket.status)} 
                color={getStatusColor(selectedTicket.status)}
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography color="gray" variant="caption">Тип: {selectedTicket.type}</Typography>
                <Typography color="gray" variant="caption" sx={{ ml: 2 }}>
                  Дата: {new Date(selectedTicket.createdAt).toLocaleString('ru-RU')}
                </Typography>
              </Box>
              <Paper sx={{ p: 2, bgcolor: '#1a1a1a', mb: 3 }}>
                <Typography>{selectedTicket.message}</Typography>
              </Paper>

              {selectedTicket.response && (
                <Paper sx={{ p: 2, bgcolor: '#0d3320', mb: 3 }}>
                  <Typography color="gray" variant="caption">Ваш ответ:</Typography>
                  <Typography>{selectedTicket.response}</Typography>
                </Paper>
              )}

              {selectedTicket.status === 'pending' && (
                <>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Ваш ответ"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { color: 'white' } }}
                  />
                  <Select
                    value={responseStatus}
                    onChange={(e) => setResponseStatus(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150, color: 'white' }}
                  >
                    <MenuItem value="resolved">Решено</MenuItem>
                    <MenuItem value="in_progress">В работе</MenuItem>
                    <MenuItem value="rejected">Отклонено</MenuItem>
                  </Select>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedTicket(null)}>Закрыть</Button>
              {selectedTicket.status === 'pending' && (
                <Button 
                  onClick={handleRespond}
                  disabled={!responseText.trim() || loading}
                  variant="contained"
                  startIcon={<FiSend />}
                  sx={{ bgcolor: 'rgb(237,93,25)' }}
                >
                  Отправить ответ
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      </>
      )}

      {currentTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Управление подписками AtomPro+</Typography>
            <IconButton onClick={loadSubscribers} sx={{ color: 'white' }}>
              <FiRefreshCw />
            </IconButton>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: '#121212' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: 'gray' }}>Пользователь</TableCell>
                  <TableCell sx={{ color: 'gray' }}>Никнейм</TableCell>
                  <TableCell sx={{ color: 'gray' }}>Истекает</TableCell>
                  <TableCell sx={{ color: 'gray' }}>Тип покупки</TableCell>
                  <TableCell sx={{ color: 'gray' }}>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ color: 'gray', textAlign: 'center' }}>
                      Нет активных подписчиков
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.map((sub) => (
                    <TableRow key={sub._id} hover sx={{ '&:hover': { bgcolor: '#1a1a1a' } }}>
                      <TableCell sx={{ color: 'white' }}>{sub.fullName || 'Не указано'}</TableCell>
                      <TableCell sx={{ color: 'white' }}>@{sub.username}</TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {new Date(sub.expiresAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>
                        {sub.purchaseType === 'atm' ? 'ATM' : sub.purchaseType === 'telegram' ? 'Telegram' : 'Админ'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => {
                            setSubscriptionDialog({ open: true, userId: sub._id, username: sub.username });
                            setSubscriptionAction('revoke');
                          }}
                          sx={{ color: 'error.main' }}
                          startIcon={<FiX />}
                        >
                          Отменить
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setSubscriptionDialog({ open: true, userId: sub._id, username: sub.username });
                            setSubscriptionAction('grant');
                          }}
                          sx={{ color: 'rgb(237,93,25)', ml: 1 }}
                          startIcon={<FiCheck />}
                        >
                          Продлить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 2, bgcolor: '#121212' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Выдать подписку пользователю</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                  label="ID пользователя"
                  value={subscriptionDialog.userId || ''}
                  onChange={(e) => setSubscriptionDialog({ ...subscriptionDialog, userId: e.target.value })}
                  size="small"
                  sx={{ flex: 1, '& .MuiOutlinedInput-root': { color: 'white' } }}
                />
                <TextField
                  label="Дней"
                  type="number"
                  value={subscriptionDuration}
                  onChange={(e) => setSubscriptionDuration(Number(e.target.value))}
                  size="small"
                  sx={{ width: 100, '& .MuiOutlinedInput-root': { color: 'white' } }}
                />
                <Button
                  variant="contained"
                  onClick={() => {
                    setSubscriptionAction('grant');
                    handleSubscriptionAction();
                  }}
                  disabled={!subscriptionDialog.userId || subscriptionLoading}
                  sx={{ bgcolor: 'rgb(237,93,25)' }}
                >
                  Выдать
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      <Dialog
        open={subscriptionDialog.open}
        onClose={() => setSubscriptionDialog({ open: false, userId: null, username: '' })}
        PaperProps={{ sx: { bgcolor: '#121212', color: 'white' } }}
      >
        <DialogTitle>
          {subscriptionAction === 'grant' ? 'Выдать подписку' : 'Отменить подписку'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {subscriptionAction === 'grant' 
              ? `Выдать подписку AtomPro+ пользователю @${subscriptionDialog.username || subscriptionDialog.userId} на ${subscriptionDuration} дней?`
              : `Отменить подписку AtomPro+ у пользователя @${subscriptionDialog.username || subscriptionDialog.userId}?`}
          </Typography>
          {subscriptionAction === 'grant' && (
            <TextField
              fullWidth
              label="Дней"
              type="number"
              value={subscriptionDuration}
              onChange={(e) => setSubscriptionDuration(Number(e.target.value))}
              sx={{ mt: 2, '& .MuiOutlinedInput-root': { color: 'white' } }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionDialog({ open: false, userId: null, username: '' })}>
            Отмена
          </Button>
          <Button
            onClick={handleSubscriptionAction}
            disabled={subscriptionLoading}
            variant="contained"
            sx={{ bgcolor: subscriptionAction === 'grant' ? 'rgb(237,93,25)' : 'error.main' }}
          >
            {subscriptionAction === 'grant' ? 'Выдать' : 'Отменить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
