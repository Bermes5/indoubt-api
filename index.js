require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

// 🔥 CONEXÃO POSTGRES
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
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
  const { email, senha } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const user = result.rows[0];

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro no login" });
  }
});


// ================= ROTAS PROTEGIDAS =================

// LISTAR TODOS
app.get("/clientes", authMiddleware, async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clientes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

// BUSCAR POR ID
app.get("/clientes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      "SELECT * FROM clientes WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar cliente" });
  }
});

// CRIAR
app.post("/clientes", authMiddleware, async (req, res) => {
  const { nome, email } = req.body;

  try {
    await db.query(
      "INSERT INTO clientes (nome, email) VALUES ($1, $2)",
      [nome, email]
    );

    res.json({ mensagem: "Cliente criado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao inserir cliente" });
  }
});

// ATUALIZAR
app.put("/clientes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  try {
    await db.query(
      "UPDATE clientes SET nome = $1, email = $2 WHERE id = $3",
      [nome, email, id]
    );

    res.json({ mensagem: "Cliente atualizado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao atualizar" });
  }
});

// DELETAR
app.delete("/clientes/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM clientes WHERE id = $1", [id]);
    res.json({ mensagem: "Cliente deletado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao deletar" });
  }
});


// ================= SERVIDOR =================

app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor rodando 🚀");
});