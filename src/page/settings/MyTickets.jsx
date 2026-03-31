import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Chip, CircularProgress, IconButton, Divider
} from '@mui/material';
import { FiArrowLeft, FiMessageSquare, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import axios from '../../system/axios';

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await axios.get('/support/my-tickets');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock color="#f59e0b" />;
      case 'in_progress': return <FiMessageSquare color="#3b82f6" />;
      case 'resolved': return <FiCheckCircle color="#22c55e" />;
      case 'rejected': return <FiXCircle color="#ef4444" />;
      default: return <FiClock />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Ожидает ответа',
      in_progress: 'В работе',
      resolved: 'Решено',
      rejected: 'Отклонено'
    };
    return labels[status] || status;
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: 'rgb(237,93,25)' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh', 
      bgcolor: '#000', 
      color: 'white',
      pt: 2,
      px: 2
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/settings')} sx={{ color: 'white' }}>
            <FiArrowLeft size={24} />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Мои обращения
          </Typography>
        </Box>

        {tickets.length === 0 ? (
          <Paper sx={{ p: 4, bgcolor: '#121212', textAlign: 'center' }}>
            <FiMessageSquare size={48} color="#666" />
            <Typography color="gray" sx={{ mt: 2 }}>
              У вас пока нет обращений
            </Typography>
            <Typography color="gray" variant="body2" sx={{ mt: 1 }}>
              Если у вас есть вопросы, перейдите на страницу поддержки
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tickets.map((ticket) => (
              <Paper key={ticket._id} sx={{ bgcolor: '#121212', overflow: 'hidden' }}>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white' }}>
                        {ticket.type}
                      </Typography>
                      <Typography variant="caption" color="gray">
                        {new Date(ticket.createdAt).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(ticket.status)}
                      label={getStatusLabel(ticket.status)}
                      color={getStatusColor(ticket.status)}
                      size="small"
                    />
                  </Box>

                  <Paper sx={{ p: 2, bgcolor: '#1a1a1a', mb: 2 }}>
                    <Typography variant="body2" color="white">
                      {ticket.message}
                    </Typography>
                  </Paper>

                  {ticket.response && (
                    <>
                      <Divider sx={{ borderColor: '#333', my: 2 }} />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FiCheckCircle color="#22c55e" size={16} />
                        <Typography variant="caption" color="gray">
                          Ответ от поддержки ({new Date(ticket.respondedAt).toLocaleDateString('ru-RU')})
                        </Typography>
                      </Box>
                      <Paper sx={{ p: 2, bgcolor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <Typography variant="body2" color="white">
                          {ticket.response}
                        </Typography>
                      </Paper>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MyTickets;
