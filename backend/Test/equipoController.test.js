const { register } = require('../Controllers/equipoController');
const Equipo = require('../Models/Equipos');
const Client = require('../models/Client');

// Mockeamos los modelos de Mongoose
jest.mock('../Models/Equipos');
jest.mock('../models/Client');

describe('Pruebas Unitarias - equipoController.register', () => {
  let req, res;
  
//inyectamos un objeto req.user para simular que el payload del JWT de autenticación fue decodificado y pasado al controlador
  beforeEach(() => {
    jest.clearAllMocks();
    // Simulamos req y res para cada prueba
    req = { 
        body: {},
        user: { username: 'emalotero1' } // Simulamos el usuario logueado en el token JWT
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // --- CP 2: Registro sin cliente vinculado ---
  it('Debe retornar 400 si el equipo no está asociado a un cliente', async () => {
    req.body = { 
        // clienteId está ausente o vacío
        mother: 'Asus', cpu: 'Intel', ram: '16 GB', gpu: 'NVIDIA', 
        fuente: 'Corsair 850', gabinete: 'Deepcool', discos: 'SSD 1 TB',
        fallaReportada: 'Enciende pero no da imagen, se escuchan sonidos'
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
        status: "error", 
        message: "ERROR: DEBE VINCULAR UN CLIENTE AL EQUIPO OBLIGATORIAMENTE." 
    });
  });

  // --- CP 3: Registro con componentes de hardware incompletos ---
  it('Debe retornar 400 si faltan componentes obligatorios', async () => {
    req.body = { 
        clienteId: '60d5ec49f1b2c8b1f8c8a1b1', // ID de Mongoose simulado
        mother: 'Asus', cpu: 'Intel', ram: '16 GB', gpu: 'NVIDIA', 
        discos: 'SSD 1 TB', fallaReportada: 'Enciende pero no da imagen, se escuchan sonidos',
        // Simulamos que faltan la fuente y el gabinete
        fuente: '', gabinete: '' 
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
        status: "error", 
        message: "ERROR: TODOS LOS COMPONENTES SON OBLIGATORIOS." 
    });
  });

  // --- CP 4: Registro con reporte de cliente vacío o menor a 15 caracteres ---
  it('Debe retornar 400 si el reporte de falla tiene menos de 15 caracteres', async () => {
    req.body = { 
        clienteId: '60d5ec49f1b2c8b1f8c8a1b1',
        mother: 'Asus', cpu: 'Intel', ram: '16 GB', gpu: 'NVIDIA', 
        fuente: 'Corsair 850', gabinete: 'Deepcool', discos: 'SSD 1 TB',
        fallaReportada: 'Roto' // Longitud de 4 caracteres
    };

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ 
        status: "error", 
        message: "ERROR: EL REPORTE DE SERVICIO DEBE DETALLAR AL MENOS 15 CARACTERES." 
    });
  });

  // --- CP Extra (Controlador): Cliente no encontrado o inactivo ---
  it('Debe retornar 404 si el cliente proporcionado no existe o está inactivo', async () => {
    req.body = { 
        clienteId: '60d5ec49f1b2c8b1f8c8a1b1',
        mother: 'Asus', cpu: 'Intel', ram: '16 GB', gpu: 'NVIDIA', 
        fuente: 'Corsair 850', gabinete: 'Deepcool', discos: 'SSD 1 TB',
        fallaReportada: 'Enciende pero no da imagen, se escuchan ruidos'
    };

    // Simulamos que Mongoose no encuentra al cliente (retorna null)
    Client.findById.mockResolvedValue(null);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ 
        status: "error", 
        message: "CLIENTE NO ENCONTRADO O INACTIVO" 
    });
  });

  // --- CP 5: Fallo interno del servidor ---
  it('Debe retornar 500 si ocurre un error en la base de datos (Ej: caída de MongoDB)', async () => {
    req.body = { 
        clienteId: '60d5ec49f1b2c8b1f8c8a1b1',
        mother: 'Asus', cpu: 'Intel', ram: '16 GB', gpu: 'NVIDIA', 
        fuente: 'Corsair 850', gabinete: 'Deepcool', discos: 'SSD 1 TB',
        fallaReportada: 'Enciende pero no da imagen, se escuchan sonidos'
    };

    // Cliente existe y está activo
    Client.findById.mockResolvedValue({ _id: '60d5ec49f1b2c8b1f8c8a1b1', active: true });
    
    // Forzamos un rechazo al guardar para simular el 500
    Equipo.prototype.save = jest.fn().mockRejectedValue(new Error('Fallo de conexión a la BD'));

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ 
        status: "error", 
        message: "ERROR INTERNO DEL SERVIDOR" 
    });
  });

  // --- CP 1: Registro Exitoso (Camino Feliz) ---
  it('Debe registrar el equipo exitosamente y retornar 201', async () => {
    req.body = { 
        clienteId: '60d5ec49f1b2c8b1f8c8a1b1',
        mother: 'Asus', cpu: 'Intel', ram: '16 GB', gpu: 'NVIDIA', 
        fuente: 'Corsair 850', gabinete: 'Deepcool', discos: 'SSD 1 TB',
        fallaReportada: 'Enciende pero no da imagen, se escuchan sonidos del sistema'
    };

    // Cliente existe y está activo
    Client.findById.mockResolvedValue({ _id: '60d5ec49f1b2c8b1f8c8a1b1', active: true });
    
    // El save() se resuelve correctamente
    Equipo.prototype.save = jest.fn().mockResolvedValue(true);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ 
        status: "success",
        message: "EQUIPO REGISTRADO OK"
    }));
    
    // Verificamos de forma opcional que el equipo devuelto tenga los datos mapeados
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.equipo.createdBy).toBe('emalotero1');
    expect(responseBody.equipo.cliente).toBe('60d5ec49f1b2c8b1f8c8a1b1');
  });

});