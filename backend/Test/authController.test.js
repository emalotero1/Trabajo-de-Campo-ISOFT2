const { login } = require('../Controllers/authController');
const User = require('../Models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Simulamos las dependencias
jest.mock('../Models/Usuario');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Pruebas Unitarias - authController.login', () => {
  let req, res;

  beforeEach(() => {
    // Simulamos el objeto request y response 
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    process.env.JWT_SECRET = 'secreto_para_test';
  });

  // 1. Caso: Usuario no existe - datos erroneos o inexistentes (Camino alternativo)
  it('Debe retornar 401 si el usuario no existe', async () => {
    req.body = { emailOrUser: 'inexistente', password: '1234' };
    User.findOne.mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas - Usuario no existe' });
  });

  // 2. Caso: Password incorrecta
  it('Debe retornar 401 si la contraseña es incorrecta', async () => {
    req.body = { emailOrUser: 'emalotero1', password: '1234' };
    User.findOne.mockResolvedValue({ password: 'hashed_password' });
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Credenciales inválidas - Password incorrecta' });
  });

  // 3. Caso: Usuario desactivado 
  it('Debe retornar 403 si el usuario existe pero está desactivado', async () => {
    req.body = { emailOrUser: 'emalotero1', password: '1234' };
    User.findOne.mockResolvedValue({ password: 'hash', active: false });
    bcrypt.compare.mockResolvedValue(true);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cuenta desactivada.' });
  });

  // 4. Caso: Éxito (Camino feliz)
  it('Debe retornar 200 y un token si el login es exitoso', async () => {
    req.body = { emailOrUser: 'emalo2o1', password: '121312' };
    const mockUser = { 
        _id: '1', name: 'emalo1', rol: 'Admin', active: true, 
        password: 'hash' 
    };
    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('mocked_token');

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        status: "success",
        token: 'mocked_token' 
    }));
  });
});

// ¿Mi controlador llama a bcrypt con los parámetros correctos? es una libreria externa ya probada por otros desarrolladores, no es necesario testearla, 
// lo importante es que nuestro controlador la use correctamente.

// ¿Mi controlador genera un token solo cuando las credenciales son válidas? 