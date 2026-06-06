const User = require("../Models/Usuario");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

//cambiar el metodo a sincrono 
exports.login = async (req, res) => {
  const { emailOrUser, password } = req.body;

  try {
    // 1. Buscamos al usuario
    const user = await User.findOne({
      $or: [
        { email: emailOrUser ? emailOrUser.toLowerCase().trim() : "" }, 
        { username: emailOrUser ? emailOrUser.trim() : "" }
      ],
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas - Usuario no existe' });
    }

    // 2. Comparamos contraseña
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas - Password incorrecta' });
    }

    if (!user.active) {
      return res.status(403).json({ message: 'Cuenta desactivada.' });
    }

    const payload = {
      id: user._id,
      username: user.username,
      name: user.name,
      lastname: user.lastname,  
      cel: user.cel,   
      email: user.email,
      rol: user.rol,          
      created_at: user.created_at,  
      active: user.active
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.status(200).json({ 
      status: "success",
      token,
      user: { name: user.name, rol: user.rol }
    });

  } catch (error) {
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};