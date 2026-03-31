import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
} from "@mui/material";
import axios from "../../system/axios";

const RequestsPage = ({ user }) => {  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        if (!user?._id) return; 
        const res = await axios.get(`/exchange/my?userId=${user._id}`);
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error("Ошибка загрузки заявок:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user]);

  const handleAccept = async (id) => {
    try {
      await axios.post("/exchange/respond", {
        requestId: id,
        action: "accept",
      });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "accepted" } : r))
      );
    } catch (err) {
      console.error("Ошибка принятия:", err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.post("/exchange/respond", {
        requestId: id,
        action: "reject",
      });
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: "rejected" } : r))
      );
    } catch (err) {
      console.error("Ошибка отклонения:", err);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: "700px", mx: "auto", mt: 4, px: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "white" }}>
        Заявки на обмен NFT
      </Typography>

      {requests.length === 0 && (
        <Typography sx={{ color: "gray" }}>
          У вас пока нет заявок.
        </Typography>
      )}

      {requests.map((req) => (
        <Card
          key={req._id}
          sx={{
            mb: 2,
            backgroundColor: "rgba(40,40,40,0.9)",
            color: "white",
          }}
        >
          <CardContent>
            <Typography variant="h6">
              NFT: {req.nftId?.title || "Неизвестно"}
            </Typography>
            <Typography>
              Отправитель: {req.fromUser?.username || req.fromUser}
            </Typography>
            <Typography>
              Получатель: {req.toUser?.username || req.toUser}
            </Typography>
            <Typography>Цена: {req.price} AGT</Typography>
            <Typography>Статус: {req.status}</Typography>
            <Typography>
              Действительно до:{" "}
              {new Date(req.expiresAt).toLocaleString("ru-RU")}
            </Typography>
          </CardContent>

          {req.status === "pending" && (
            <>
              <Divider />
              <CardActions>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => handleAccept(req._id)}
                >
                  Принять
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(req._id)}
                >
                  Отклонить
                </Button>
              </CardActions>
            </>
          )}
        </Card>
      ))}
    </Box>
  );
};

export default RequestsPage;

/*
 AtomGlide Front-end Client
 Author: Dmitry Khorov
 GitHub: DKhorov
 Telegram: @dkdevelop @jpegweb
 2025 Project
*/
