const { create } = require('../Controllers/ordenController'); // Ajustá la ruta real según tu estructura de carpetas
const OrdenReparacion = require('../Models/OrdenReparacion');
const Equipo = require('../Models/Equipos');
const EstadoHistorial = require('../Models/EstadoHistorial');

// Mockeamos por completo los modelos de Mongoose
jest.mock('../Models/OrdenReparacion');
jest.mock('../Models/Equipos');
jest.mock('../Models/EstadoHistorial');

describe('Pruebas Unitarias - ordenController.create', () => {
  let req, res, mockSort;

  beforeEach(() => {
    jest.clearAllMocks();

    // Simulamos el encadenamiento de métodos de Mongoose: OrdenReparacion.findOne().sort()
    // findOne() devuelve un objeto con la propiedad sort, que es a su vez un mock resoluble
    mockSort = jest.fn();
    OrdenReparacion.findOne.mockReturnValue({ sort: mockSort });

    // Preparamos los objetos req y res base
    req = {
      body: {},
      user: { id: '60e9bc49f1b2c8b1f8c8a999' } // ID del recepcionista logueado (inyectado desde el JWT)
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // =========================================================================
  // 1. CAMINOS ALTERNATIVOS / CASOS DE ERROR (Sad Paths)
  // =========================================================================

  // --- CP 1: Validación de Datos de Entrada (Falta ID de Equipo) ---
  it('Debe retornar 400 si id_equipo está ausente en la petición', async () => {
    req.body = { observaciones: 'Limpieza general y cambio de pasta térmica.' };

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'EL EQUIPO ES OBLIGATORIO' });
  });

  // --- CP 2: Validación de Existencia de Entidades (Equipo Inexistente) ---
  it('Debe retornar 404 si el equipo proporcionado no existe en la base de datos', async () => {
    req.body = { id_equipo: '60d5ec49f1b2c8b1f8c8a1b1', observaciones: 'Revisar cortos en placa' };
    
    // El método findById no encuentra nada y devuelve null
    Equipo.findById.mockResolvedValue(null);

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'EQUIPO NO ENCONTRADO' });
  });

  // --- CP 3: Excepción de Caída de Infraestructura / Base de Datos ---
  it('Debe retornar 500 si ocurre un error inesperado al conectar con MongoDB', async () => {
    req.body = { id_equipo: '60d5ec49f1b2c8b1f8c8a1b1' };
    
    // Forzamos un rechazo de promesa en la primera consulta para simular la desconexión
    Equipo.findById.mockRejectedValue(new Error('Error crítico de conexión a MongoDB'));

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'ERROR INTERNO DEL SERVIDOR' });
  });


  // =========================================================================
  // 2. CAMINOS FELICES / FLUJOS IDEALES (Happy Paths)
  // =========================================================================

  // --- CP 4: Registro Exitoso - Caso Base del Autoincremental (Primera Orden) ---
  it('Debe generar la orden con el número base 1000 si es la primera orden del sistema', async () => {
    req.body = { 
      id_equipo: '60d5ec49f1b2c8b1f8c8a1b1', 
      observaciones: 'El equipo enciende pero se apaga a los pocos segundos' 
    };

    // El equipo existe
    Equipo.findById.mockResolvedValue({ _id: '60d5ec49f1b2c8b1f8c8a1b1', asignadoAOrden: false });
    
    // findOne().sort() devuelve null (lo que significa que la colección está vacía)
    mockSort.mockResolvedValue(null);

    // Mockeamos la instanciación de OrdenReparacion (new OrdenReparacion)
    OrdenReparacion.mockImplementation(function(datos) {
      Object.assign(this, datos);
      this._id = '60f7ad49f1b2c8b1f8c8b222'; // Simulamos el _id que le asigna MongoDB
      this.save = jest.fn().mockResolvedValue(this);
    });

    // Mockeamos la instanciación de EstadoHistorial (new EstadoHistorial)
    EstadoHistorial.mockImplementation(function(datos) {
      Object.assign(this, datos);
      this.save = jest.fn().mockResolvedValue(true);
    });

    await create(req, res);

    // Verificaciones del protocolo HTTP
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      ok: true,
      msg: 'EQUIPO REGISTRADO OK'
    }));

    // Verificamos que la Lógica de Negocio aplicó el número de orden inicial (1000)
    expect(OrdenReparacion).toHaveBeenCalledWith(expect.objectContaining({
      nro_orden: 1000,
      estado: 'PENDIENTE DE REVISION',
      id_usuario: '60e9bc49f1b2c8b1f8c8a999'
    }));

    // Verificamos que se actualizó la bandera del equipo
    expect(Equipo.findByIdAndUpdate).toHaveBeenCalledWith('60d5ec49f1b2c8b1f8c8a1b1', { asignadoAOrden: true });

    // Verificamos que el historial inicial fue registrado con el ID de la orden vinculada
    expect(EstadoHistorial).toHaveBeenCalledWith(expect.objectContaining({
      id_orden: '60f7ad49f1b2c8b1f8c8b222',
      estado: 'PENDIENTE DE REVISION',
      id_usuario: '60e9bc49f1b2c8b1f8c8a999'
    }));
  });

  // --- CP 5: Registro Exitoso - Caso General Correlativo (Órdenes Sucesivas) ---
  it('Debe autoincrementar correlativamente el nro_orden basándose en el último registro', async () => {
    req.body = { id_equipo: '60d5ec49f1b2c8b1f8c8a1b1', observaciones: 'Limpieza' };

    Equipo.findById.mockResolvedValue({ _id: '60d5ec49f1b2c8b1f8c8a1b1' });
    
    // Simulamos que la última orden en la base de datos tenía el número 1054
    mockSort.mockResolvedValue({ nro_orden: 1054 });

    OrdenReparacion.mockImplementation(function(datos) {
      Object.assign(this, datos);
      this.save = jest.fn().mockResolvedValue(this);
    });

    EstadoHistorial.mockImplementation(function(datos) {
      Object.assign(this, datos);
      this.save = jest.fn().mockResolvedValue(true);
    });

    await create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    
    // Verificamos la regla matemática de negocio (1054 + 1 = 1055)
    expect(OrdenReparacion).toHaveBeenCalledWith(expect.objectContaining({
      nro_orden: 1055
    }));
  });

});