const { register, removeLogical, update } = require('../Controllers/userController');
const User = require('../Models/Usuario');
const bcrypt = require('bcryptjs'); // Necesario importar para mockearlo

jest.mock('../Models/Usuario');
jest.mock('bcryptjs'); // <--- ¡Esto es lo que faltaba para evitar el timeout!

describe('Pruebas de userController', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { 
        body: {}, 
        params: {}, 
        user: { id: 'admin123', username: 'admin' } 
    };
    res = { 
        status: jest.fn().mockReturnThis(), 
        json: jest.fn() 
    };
  });

  describe('Método register', () => {
    it('Debe retornar 409 si el usuario ya existe', async () => {
      req.body = { email: 'a@a.com', username: 'test', password: '123', nombre: 'N', apellido: 'L', rol: 'admin' };
      
      // 1. Mockeamos User.findOne
      User.findOne.mockResolvedValue({ _id: '1' });

      // 2. Ejecutamos (esto ahora será instantáneo porque bcrypt está mockeado)
      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  describe('Método removeLogical', () => {
    it('Debe retornar 403 si el admin intenta borrarse a sí mismo', async () => {
      req.params.id = 'admin123';
      
      await removeLogical(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    describe('Método update', () => {
    
    // 1. Caso: El usuario no existe en la base de datos
    it('Debe retornar 404 si el usuario a editar no existe', async () => {
      req.params.id = '999';
      
      // Simulamos que la primera búsqueda no encuentra nada
      User.findById.mockResolvedValue(null);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "USUARIO NO ENCONTRADO" }));
    });

    // 2. Caso: Seguridad contra "suicidio de rol"
    it('Debe retornar 403 si un admin intenta quitarse su propio rol', async () => {
      req.params.id = 'admin123'; // Mismo ID que req.user.id (definido en el beforeEach)
      req.body = { rol: 'tecnico' }; // Intenta bajar de categoría
      
      // Simulamos que encuentra al admin
      User.findById.mockResolvedValue({ _id: 'admin123', rol: 'administrador' });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "NO PUEDES QUITARTE EL ROL ADMIN" }));
    });

    // 3. Caso: Éxito (Acá usamos la técnica del "túnel de juguete" para el .select)
    it('Debe actualizar el usuario correctamente (sin tocar la contraseña)', async () => {
      req.params.id = 'user1';
      req.body = { nombre: 'Emanuel' }; // Dato a modificar

      const mockUpdatedUser = { _id: 'user1', nombre: 'Emanuel ', rol: 'tecnico' };

      // Pasamos el chequeo de existencia
      User.findById.mockResolvedValue({ _id: 'user1' });

      // Mockeamos el findByIdAndUpdate encadenado con .select()
      User.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUpdatedUser)
      });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        status: "success", 
        user: mockUpdatedUser 
      }));
    });

  });
  });
});