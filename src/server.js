require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

// ================= BANCO =================
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ================= AUTH =================
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
    return res.status(401).json({ erro: "Token inválido" });
  }
}

// ================= LOGIN =================
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      "SELECT * FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const user = result.rows[0];

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
    console.error("ERRO LOGIN:", err);
    res.status(500).json({ erro: err.message });
  }
});

// ================= CLIENTES =================

// 🔥 LISTAR
app.get("/clientes", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM clientes ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("ERRO GET CLIENTES:", err);
    res.status(500).json({ erro: "Erro ao buscar clientes" });
  }
});

// 🔥 CRIAR
app.post("/clientes", authMiddleware, async (req, res) => {
  try {
    const {
      nome,
      email,
      telefone,
      endereco,
      nomeSocial,
      documento
    } = req.body;

    if (!nome || !email) {
      return res.status(400).json({ erro: "Nome e email são obrigatórios" });
    }

    const result = await db.query(
      `INSERT INTO clientes 
      (nome, email, telefone, endereco, nome_social, documento) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *`,
      [nome, email, telefone, endereco, nomeSocial, documento]
    );

    console.log("CLIENTE CRIADO:", result.rows[0]);

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error("ERRO POST CLIENTE:", err);
    res.status(500).json({ erro: "Erro ao salvar cliente" });
  }
});

// 🔥 ATUALIZAR (APENAS UMA VEZ)
app.put("/clientes/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      email,
      telefone,
      endereco,
      nomeSocial,
      documento
    } = req.body;

    const result = await db.query(
      `UPDATE clientes SET
        nome = $1,
        email = $2,
        telefone = $3,
        endereco = $4,
        nome_social = $5,
        documento = $6
      WHERE id = $7
      RETURNING *`,
      [nome, email, telefone, endereco, nomeSocial, documento, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    console.log("CLIENTE ATUALIZADO:", result.rows[0]);

    res.json(result.rows[0]);

  } catch (err) {
    console.error("ERRO PUT CLIENTE:", err);
    res.status(500).json({ erro: "Erro ao atualizar cliente" });
  }
});

// 🔥 DELETAR
app.delete("/clientes/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      "DELETE FROM clientes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: "Cliente não encontrado" });
    }

    res.json({ mensagem: "Cliente deletado com sucesso" });

  } catch (err) {
    console.error("ERRO DELETE CLIENTE:", err);
    res.status(500).json({ erro: "Erro ao deletar cliente" });
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