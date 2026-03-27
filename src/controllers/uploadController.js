const pool = require("../config/db");

exports.uploadArquivo = async (req, res) => {
  try {
    const { cliente_id, equipamento_id, tipo } = req.body;

    if (!cliente_id || !tipo) {
      return res.status(400).json({
        error: "cliente_id e tipo são obrigatórios"
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const caminho = req.file.path
      .replace(/\\/g, "/")
      .replace("uploads/", "");

    const url = `${req.protocol}://${req.get("host")}/uploads/${caminho}`;

    const [result] = await pool.query(
      `
      INSERT INTO arquivos
      (cliente_id, equipamento_id, usuario_id, tipo, nome_arquivo, mime_type, tamanho, url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cliente_id,
        equipamento_id || null,
        req.usuario.id,
        tipo,
        req.file.filename,
        req.file.mimetype,
        req.file.size,
        url
      ]
    );

    res.json({
      id: result.insertId,
      cliente_id,
      equipamento_id,
      tipo,
      url
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao salvar arquivo" });
  }
};
