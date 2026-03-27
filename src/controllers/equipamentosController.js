const pool = require("../config/db");

exports.listar = async (req, res) => {
  const [rows] = await pool.query("SELECT * FROM equipamentos");
  res.json(rows);
};

exports.criar = async (req, res) => {
  const { nome, fabricante, modelo, descricao } = req.body;

  const [result] = await pool.query(
    `INSERT INTO equipamentos (nome, fabricante, modelo, descricao)
     VALUES (?, ?, ?, ?)`,
    [nome, fabricante, modelo, descricao]
  );

  res.status(201).json({ id: result.insertId });
};

exports.atualizar = async (req, res) => {
  const { nome, fabricante, modelo, descricao } = req.body;

  await pool.query(
    `UPDATE equipamentos
     SET nome=?, fabricante=?, modelo=?, descricao=?
     WHERE id=?`,
    [nome, fabricante, modelo, descricao, req.params.id]
  );

  res.json({ message: "Equipamento atualizado" });
};

exports.excluir = async (req, res) => {
  await pool.query("DELETE FROM equipamentos WHERE id=?", [req.params.id]);
  res.json({ message: "Equipamento excluído" });
};
