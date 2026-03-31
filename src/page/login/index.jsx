import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Divider, Alert } from "@mui/material";

// В React (Vite/CRA) импортируем картинку как путь
import logo from './1.png'; 

const LoginPage = () => {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);

  // ТЕМА
  const theme = {
    bg: "#000000",
    text: "#fff",
    input: "#1e1e1e",
    border: "#333",
    accent: "#ffffff"
  };

  useEffect(() => {
    let interval;
    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false);
      setAttempts(0);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimer]);

  // Убраны типы TS (React.ChangeEvent), оставлен чистый JS
  const handleUsernameChange = (e) => {
    let val = e.target.value;
    if (val === "") { setUsername(""); return; }
    if (!val.startsWith("@")) { val = "@" + val; }
    setUsername(val);
  };

  const handleLogin = async () => {
    if (isLocked) return;
    if (!username || username === "@" || !password) {
      setError("Введите логин и пароль");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://atomglidedev.ru/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId || data.user?._id);
        window.location.href = "/";
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= 3) {
          setIsLocked(true);
          setLockTimer(30);
          setError("Доступ временно ограничен");
        } else {
          setError(data.message || `Ошибка. Осталось попыток: ${3 - newAttempts}`);
        }
      }
    } catch (err) {
      setError("Нет связи с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      height: "100vh", display: "flex", bgcolor: theme.bg, 
      overflow: "hidden", p: 2, gap: 2 
    }}>
      
      <Box sx={{ 
        width: { xs: "100%", md: "380px" }, 
        display: "flex", flexDirection: "column", justifyContent: "center", 
        px: 4, color: theme.text 
      }}>
        <Typography sx={{position:'fixed',bottom:0,left:0,color:'gray'}}>Проект компании AtomGlide 2026</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
          <img src={logo} alt="Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <Box sx={{ ml: 3 }}>
            <Typography sx={{ fontWeight: 'Bold', fontSize: "24px", letterSpacing: "-1.2px" }}>
              AtomGlide<span style={{ fontWeight: 200 }}>.com</span>
            </Typography>
            <Typography sx={{ opacity: 0.6, fontSize: "14px" }}>
              {isLocked ? `Ждите ${lockTimer}с` : "Больше, чем просто сеть."}
            </Typography>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "12px" }}>{error}</Alert>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField 
            fullWidth
            disabled={isLocked}
            placeholder="@Dmitry" 
            value={username}
            onChange={handleUsernameChange}
            InputProps={{
              sx: { 
                borderRadius: "16px", bgcolor: theme.input, 
                color: theme.text,
                "& fieldset": { border: "none" } 
              }
            }}
          />

          <TextField 
            fullWidth
            type="password"
            disabled={isLocked}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              sx: { 
                borderRadius: "16px", bgcolor: theme.input, 
                color: theme.text,
                "& fieldset": { border: "none" } 
              }
            }}
          />
          
          <Button 
            onClick={handleLogin}
            disabled={loading || isLocked}
            variant="contained" 
            sx={{ 
              bgcolor: theme.accent, color: "#000", py: 1.8, borderRadius: "16px", 
              textTransform: "none", fontWeight: 700,
              '&:hover': { opacity: 0.9, bgcolor: theme.accent },
              '&:disabled': { bgcolor: "#333", color: "#666" }
            }}
          >
            {loading ? "..." : isLocked ? lockTimer : "Войти"}
          </Button>
        </Box>

        <Divider sx={{ my: 4, bgcolor: theme.border }} />

        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography sx={{ fontSize: "14px", opacity: 0.6 }}>
            Нет аккаунта?{" "}
            <Typography component="a" href="/registration"
              sx={{ color: theme.text, fontWeight: 800, textDecoration: "underline" }}>
              Регистрация
            </Typography>
          </Typography>
        </Box>
      </Box>

      {/* КАРТИНКА */}
      <Box sx={{ flex: 1, borderRadius: "50px", overflow: "hidden", display: { xs: "none", md: "block" } }}>
        <Box component="img" src="https://atomglidedev.ru/uploads/1773696313139-13113622.png"
          sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Box>
    </Box>
  );
};

export default LoginPage;