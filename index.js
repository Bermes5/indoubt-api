require('dotenv').config()
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// BANCO
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// CONEXÃO
db.connect(err => {
    if (err) {
        console.error("Erro ao conectar no MySQL:", err);
        return;
    }
    console.log("Conectado ao MySQL");
});

// ================= ROTAS =================

// TESTE
app.get("/", (req, res) => {
    res.send("API Indoubt funcionando");
});

// LISTAR TODOS
app.get("/clientes", (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// BUSCAR POR ID 🔥
app.get("/clientes/:id", (req, res) => {
    const { id } = req.params;

    db.query("SELECT * FROM clientes WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length === 0) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }

        res.json(result[0]);
    });
});

// CRIAR
app.post("/clientes", (req, res) => {
    const { nome, telefone } = req.body;

    if (!nome || !telefone) {
        return res.status(400).json({ error: "Nome e telefone obrigatórios" });
    }

    const sql = "INSERT INTO clientes (nome, telefone) VALUES (?, ?)";

    db.query(sql, [nome, telefone], (err, result) => {
        if (err) return res.status(500).json(err);

        res.json({
            id: result.insertId,
            nome,
            telefone
        });
    });
});

app.put("/clientes/:id", (req, res) => {
    const { id } = req.params;
    const { nome, telefone } = req.body;

    const sql = "UPDATE clientes SET nome = ?, telefone = ? WHERE id = ?";

    db.query(sql, [nome, telefone, id], (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Cliente atualizado com sucesso" });
    });
});

app.delete("/clientes/:id", (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM clientes WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Cliente não encontrado" });
        }

        res.json({ message: "Cliente deletado com sucesso" });
    });
});
// ================= SERVIDOR =================

app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor rodando");
});