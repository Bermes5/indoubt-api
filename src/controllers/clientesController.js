const pool = require("../config/db");

/**
 * LISTAR CLIENTES
 */
exports.listar = async (req, res) => {
  const [rows] = await pool.query(
    "SELECT * FROM clientes ORDER BY criado_em DESC"
  );
  res.json(rows);
};

/**
 * CRIAR CLIENTE
 */
exports.criar = async (req, res) => {
  const { nome, telefone } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
  }

  const [result] = await pool.query(
    "INSERT INTO clientes (nome, telefone) VALUES (?, ?)",
    [nome, telefone]
  );

  res.status(201).json({
    id: result.insertId,
    nome,
    telefone
  });
};

/**
 * ATUALIZAR CLIENTE
 */
exports.atualizar = async (req, res) => {
  const { id } = req.params;
  const { nome, telefone } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ error: "Nome e telefone são obrigatórios" });
  }

  const [result] = await pool.query(
    "UPDATE clientes SET nome = ?, telefone = ? WHERE id = ?",
    [nome, telefone, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  res.json({ message: "Cliente atualizado com sucesso" });
};

/**
 * EXCLUIR CLIENTE
 */
exports.excluir = async (req, res) => {
  const { id } = req.params;

  const [result] = await pool.query(
    "DELETE FROM clientes WHERE id = ?",
    [id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  res.json({ message: "Cliente removido com sucesso" });
};
exports.uploadFoto = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ error: "Arquivo não enviado" });
  }

  const caminho = `/uploads/clientes/${req.file.filename}`;

  const [result] = await pool.query(
    "UPDATE clientes SET foto = ? WHERE id = ?",
    [caminho, id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: "Cliente não encontrado" });
  }

  res.json({
    message: "Foto enviada com sucesso",
    foto: caminho
  });
};
