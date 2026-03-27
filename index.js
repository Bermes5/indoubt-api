require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

// 🔥 CONEXÃO POSTGRES
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ================= ROTAS =================

// LISTAR TODOS
app.get("/clientes", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM clientes ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

// BUSCAR POR ID
app.get("/clientes/:id", async (req, res) => {
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
app.post("/clientes", async (req, res) => {
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
app.put("/clientes/:id", async (req, res) => {
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
app.delete("/clientes/:id", async (req, res) => {
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