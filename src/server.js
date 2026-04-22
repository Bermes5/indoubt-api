require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

// 🔥 CONEXÃO POSTGRES
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ================= MIDDLEWARE AUTH =================
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).json({ erro: "Token não enviado" });
  }

  const token = auth.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido" });
  }
}

// ================= LOGIN =================
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("BODY:", req.body);

    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const user = result.rows[0];

    console.log("USER:", user);

    // 🔥 CORREÇÃO AQUI
    if (String(user.senha) !== String(password)) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

   const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  SECRET,
  { expiresIn: "1d" }
);

    res.json({
      token,
      role: user.role
    });

  } catch (err) {
    console.error("ERRO REAL LOGIN:", err);
    res.status(500).json({ erro: err.message });
  }
});

// ================= ROTAS PROTEGIDAS =================
app.get("/clientes", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clientes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

// ================= TESTE =================
app.get("/", (req, res) => {
  res.send("API rodando 🚀");
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});