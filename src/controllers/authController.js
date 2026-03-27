const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { secret, expiresIn } = require("../config/jwt");

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    const [rows] = await pool.query(
        "SELECT * FROM usuarios WHERE email = ? AND ativo = 1",
        [email]
    );

    if (rows.length === 0) {
        return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const usuario = rows[0];

    const senhaOk = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaOk) {
        return res.status(401).json({ error: "Senha inválida" });
    }

    const token = jwt.sign({ id: usuario.id }, secret, { expiresIn });

    res.json({
        token,
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }
    });
};
