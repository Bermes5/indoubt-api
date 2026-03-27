 require('dotenv').config();

const express = require("express");
const cors = require("cors");

// 🔥 IMPORTA A CONEXÃO CENTRAL
const db = require("./config/db");

const app = express();

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json());

// ================= TESTE =================
app.get("/", (req, res) => {
    res.send("API Indoubt funcionando");
});

// ================= LOGIN =================
app.post("/auth/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            error: "Email e senha obrigatórios"
        });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Erro no login:", err);
            return res.status(500).json({ error: "Erro interno" });
        }

        if (result.length === 0) {
            return res.status(401).json({ error: "Usuário não encontrado" });
        }

        const user = result[0];

        if (user.senha !== senha) {
            return res.status(401).json({ error: "Senha inválida" });
        }

        // 🔥 TOKEN SIMPLES (placeholder)
        const token = "token_fake_" + user.id;

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email
            }
        });
    });
});

// ================= CLIENTES =================

// LISTAR
app.get("/clientes", (req, res) => {
    db.query("SELECT * FROM clientes ORDER BY id DESC", (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao buscar clientes" });
        }

        res.json(results);
    });
});

// BUSCAR POR ID
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
        return res.status(400).json({
            error: "Nome e telefone obrigatórios"
        });
    }

    const sql = "INSERT INTO clientes (nome, telefone) VALUES (?, ?)";

    db.query(sql, [nome, telefone], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Erro ao criar cliente" });
        }

        res.json({
            id: result.insertId,
            nome,
            telefone
        });
    });
});

// ATUALIZAR
app.put("/clientes/:id", (req, res) => {
    const { id } = req.params;
    const { nome, telefone } = req.body;

    const sql = "UPDATE clientes SET nome = ?, telefone = ? WHERE id = ?";

    db.query(sql, [nome, telefone, id], (err) => {
        if (err) return res.status(500).json(err);

        res.json({ message: "Cliente atualizado com sucesso" });
    });
});

// DELETAR
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
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log("Servidor rodando");
});