const express = require("express");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const clientesRoutes = require("./routes/clientesRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(express.json());

// arquivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// rotas
app.use("/auth", authRoutes);
app.use("/clientes", clientesRoutes);
app.use("/upload", uploadRoutes);

module.exports = app;
