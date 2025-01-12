const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketConfig = require('./socket/socketConfig');
const authRoutes = require('./routes/authRoutes');

require('dotenv').config(); 

const app = express();
const server = http.createServer(app);

mongoose.connect(process.env.DATABASE_URI).then(() => {
  console.log("Database connected");
});

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const io = socketConfig(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
