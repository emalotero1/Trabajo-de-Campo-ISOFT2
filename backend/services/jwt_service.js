const jwt = require('jsonwebtoken');
const moment = require('moment');

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

const createToken = (user) => {
  const payload = {
    id: user._id,
    name: user.name,
    lastname: user.lastname,
    username: user.username,  // corregido
    email: user.email,
    rol: user.rol,
<<<<<<< HEAD
=======
    empresa: {
      _id: user.empresa?._id,
      nombre: user.empresa?.nombre,
    },
>>>>>>> ebe38a9ea323c718cded69ed873759fb6a62b80a
    fecha_creacion: user.created_at,
    iat: moment().unix(),
    exp: moment().add(30, "days").unix(),
  };

  return jwt.sign(payload, secret);
};

module.exports = {
  secret,
  createToken,
};
