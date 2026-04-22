const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const db = require("../config/db") // ajuste conforme seu projeto

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    console.log("LOGIN REQUEST:", email)

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    )

    const user = rows[0]

    // 🔴 CORREÇÃO CRÍTICA
    if (!user) {
      return res.status(401).json({ erro: "Usuário não encontrado" })
    }

    const senhaValida = await bcrypt.compare(password, user.password)

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" })
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "segredo",
      { expiresIn: "1d" }
    )

    return res.json({
      token,
      role: user.role
    })

  } catch (err) {
    console.error("ERRO LOGIN:", err)
    return res.status(500).json({ erro: err.message })
  }
}