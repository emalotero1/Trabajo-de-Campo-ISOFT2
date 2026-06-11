const OrdenReparacion = require('../Models/OrdenReparacion');
const EstadoHistorial = require('../Models/EstadoHistorial');
const Equipo = require('../Models/Equipos'); 
const Client = require('../Models/Client'); 
const OrdenReparacionContexto = require('../domain/OrdenReparacionContexto');

// =========================================================================
// 1. POST - CREAR ORDEN DE REPARACIÓN
// =========================================================================
const create = async (req, res) => {
  try {
    const { id_equipo, observaciones } = req.body;
    const id_usuario_recepcionista = req.user.id;

    // 1. Validación de entrada (Excepción según contrato)
    if (!id_equipo) {
      return res.status(400).json({ ok: false, msg: 'EL EQUIPO ES OBLIGATORIO' });
    }

    // 2. Validación de existencia del equipo
    const equipo = await Equipo.findById(id_equipo);
    if (!equipo) {
      return res.status(404).json({ ok: false, msg: 'EQUIPO NO ENCONTRADO' });
    }

    // 3. Generación del número de orden
    const ultimaOrden = await OrdenReparacion.findOne().sort({ nro_orden: -1 });
    const nro_orden = ultimaOrden ? ultimaOrden.nro_orden + 1 : 1000;

    // 4. Creación de la instancia
    const nuevaOrden = new OrdenReparacion({
      nro_orden,
      id_equipo,
      id_usuario: id_usuario_recepcionista,
      estado: 'PENDIENTE DE REVISION', 
      observaciones
    });

    // 5. Persistencia (Usando una estructura más robusta)
    const ordenGuardada = await nuevaOrden.save();
    
    // Actualizar estado del equipo
    await Equipo.findByIdAndUpdate(id_equipo, { asignadoAOrden: true });

    // 6. Registro de historial inicial
    const primerHistorial = new EstadoHistorial({
      id_orden: ordenGuardada._id,
      estado: 'PENDIENTE DE REVISION', 
      id_usuario: id_usuario_recepcionista
    });
    await primerHistorial.save();

    // 7. Respuesta exitosa (201 Created)
    return res.status(201).json({
      ok: true,
      msg: 'EQUIPO REGISTRADO OK', // O "ORDEN CREADA EXITOSAMENTE"
      orden: ordenGuardada
    });

  } catch (error) {
    // Excepción de fallo de conexión/base de datos según contrato
    return res.status(500).json({ ok: false, msg: 'ERROR INTERNO DEL SERVIDOR' });
  }
};

// =========================================================================
// 2. GET - LISTAR ORDENES DE REPARACIÓN
// =========================================================================
const list = async (req, res) => {
  try {
    const ordenes = await OrdenReparacion.find()
      .populate({
        path: 'id_equipo', 
        model: 'Equipo',   
        populate: { 
          path: 'cliente', 
          model: 'Client'  
        }
      })
      .sort({ nro_orden: -1 });

    // Ya no mapeamos, enviamos la data cruda y limpia
    return res.status(200).json({
      ok: true,
      status: "success", 
      ordenes
    });

  } catch (error) {
    console.error("ERROR REAL EN LA TERMINAL:", error);
    return res.status(500).json({ ok: false, status: "error", msg: 'Error al obtener las órdenes.' });
  }
};

// =========================================================================
// 3. GET - OBTENER TRABAJOS PENDIENTES (Para el Técnico)
// =========================================================================
const getPendingJobs = async (req, res) => {
  try {
      const filtro = {
          estado: 'PENDIENTE DE REVISION',
          tecnico_asignado: null
      };

      if (req.query.soloAsignadas === 'true') {
          filtro.tecnico_asignado = req.user.id;
          filtro.estado = { $nin: ['ENTREGADO', 'REPARADO'] };
      }

      const ordenes = await OrdenReparacion.find(filtro)
      .populate({
          path: 'id_equipo', 
          model: 'Equipo',
          populate: { path: 'cliente', model: 'Client' }
      })
      .sort({ nro_orden: 1 });

      return res.status(200).json({ 
          ok: true,
          status: "success", 
          ordenes 
      });
  } catch (error) {
      console.error("Error al obtener trabajos pendientes:", error);
      return res.status(500).json({ 
          ok: false,
          status: "error", 
          message: "Error interno del servidor" 
      });
  }
};

// =========================================================================
// 4. PUT - ACTUALIZAR TRABAJO (Diagnóstico, Presupuesto, Estado y Bitácora)
// =========================================================================
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, diagnostico, presupuesto, observaciones } = req.body;

    const orden = await OrdenReparacion.findById(id);
    if (!orden) return res.status(404).json({ ok: false, msg: 'Orden no encontrada' });

    // 1. EVALUAR TRANSICIÓN DE ESTADO (Patrón State)
    if (estado && orden.estado !== estado) {
      const contexto = new OrdenReparacionContexto(orden);
      
      try {
        // Esto validará si la ruta es correcta (ej: Rechazado -> Aceptado fallará) 
        // y si los datos son correctos (ej: Diagnostico < 15 chars fallará)
        contexto.avanzarA(estado, req.body); 
      } catch (stateError) {
        // Capturamos los errores de negocio del patrón state y respondemos 400
        return res.status(400).json({ ok: false, msg: stateError.message });
      }

      // Si no hubo error, registramos el historial
      const nuevoHistorial = new EstadoHistorial({
        id_orden: orden._id,
        estado: estado, 
        id_usuario: req.user.id 
      });
      await nuevoHistorial.save();
    }

    // 2. ACTUALIZACIÓN DE DATOS DINÁMICA
    if (diagnostico) orden.diagnostico = diagnostico;
    if (observaciones !== undefined) orden.observaciones = observaciones; 
    
    if (presupuesto) {
      let totalRepuestos = 0;
      if (presupuesto.repuestos?.length > 0) {
        totalRepuestos = presupuesto.repuestos.reduce(
          (sum, item) => sum + (item.cantidad * item.precioUnitario), 0
        );
      }
      const totalManoObra = Number(presupuesto.manoDeObra?.precio) || 0;
      presupuesto.total = totalRepuestos + totalManoObra;
      orden.presupuesto = presupuesto;
    }

    // 3. GUARDAR EN MONGOOSE
    await orden.save(); // 'orden.estado' ya fue actualizado por el contexto si todo salió bien

    return res.status(200).json({ ok: true, msg: 'Trabajo actualizado correctamente', orden });
  } catch (error) {
    console.error("Error al actualizar trabajo:", error);
    return res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
  }
};
// =========================================================================
// 5. GET - OBTENER ORDEN POR ID (Para cargar la Mesa de Trabajo y Timeline)
// =========================================================================
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const orden = await OrdenReparacion.findById(id)
      .populate({
        path: 'id_equipo', 
        model: 'Equipo',
        populate: { path: 'cliente', model: 'Client' }
      });

    if (!orden) {
      return res.status(404).json({ ok: false, msg: 'Orden no encontrada' });
    }

    // Eliminada la mutación de estado individual
    return res.status(200).json({ ok: true, status: "success", orden });
  } catch (error) {
    console.error("Error al obtener orden por ID:", error);
    return res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
  }
};

// =========================================================================
// 6. GET - OBTENER TRABAJOS ACTIVOS (Para el Técnico)
// =========================================================================

const getActiveJobs = async (req, res) => {
  try {
    const filtro = {
      estado: { $in: ['PRESUPUESTADO', 'PRESUPUESTO ACEPTADO', 'PRESUPUESTO RECHAZADO', 'REPARADO'] }
    };

    if (req.query.soloAsignadas === 'true') {
      filtro.tecnico_asignado = req.user.id;
    }

    const ordenes = await OrdenReparacion.find(filtro)
      .populate({ path: 'id_equipo', model: 'Equipo', populate: { path: 'cliente', model: 'Client' } })
      .sort({ nro_orden: 1 });

    return res.status(200).json({ ok: true, status: 'success', ordenes });
  } catch (error) {
    console.error('Error al obtener trabajos activos:', error);
    return res.status(500).json({ ok: false, status: 'error', message: 'Error interno del servidor' });
  }
};

// =========================================================================
// 7. GET - OBTENER HISTORIAL DE TRABAJOS (Para el Técnico)
// =========================================================================

const getHistoryJobs = async (req, res) => {
  try {
    const filtro = {
      estado: { $in: ['ENTREGADO'] }
    };

    const texto = req.query.buscar ? req.query.buscar.trim() : '';

    let ordenes = await OrdenReparacion.find(filtro)
      .populate({ path: 'id_equipo', model: 'Equipo', populate: { path: 'cliente', model: 'Client' } })
      .sort({ updatedAt: -1 });

    if (texto) {
      const query = texto.toLowerCase();
      // Filtramos directamente sobre el array original sin mapearlo antes
      ordenes = ordenes.filter((orden) => {
        const cliente = orden.id_equipo?.cliente || {};
        const nombre = `${cliente.name || ''} ${cliente.lastname || ''}`.toLowerCase();
        return nombre.includes(query) || String(orden.nro_orden).includes(query);
      });
    }

    return res.status(200).json({ ok: true, status: 'success', ordenes });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({ ok: false, status: 'error', message: 'Error interno del servidor' });
  }
};


// =========================================================================
// 8. PUT - ASIGNAR TECNICO (Caso de Uso: Asignarse Orden)
// =========================================================================
const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params; 
    const id_tecnico = req.user.id; 

    const orden = await OrdenReparacion.findById(id);
    orden.tecnico_asignado = id_tecnico;
    
    const estadosAvanzados = ['ASIGNADO', 'DIAGNOSTICADO', 'PRESUPUESTADO', 'PRESUPUESTO ACEPTADO', 'PRESUPUESTO RECHAZADO', 'REPARADO', 'ENTREGADO'];
    if (!estadosAvanzados.includes(orden.estado)) {
      orden.estado = 'ASIGNADO';
      
      const nuevoHistorial = new EstadoHistorial({
        id_orden: orden._id,
        estado: 'ASIGNADO',
        id_usuario: id_tecnico
      });
      await nuevoHistorial.save();
    }

    await orden.save();

    return res.status(200).json({ 
      ok: true, 
      msg: 'Te has asignado la orden exitosamente.', 
      orden 
    });

  } catch (error) {
    console.error("Error al asignar técnico:", error);
    return res.status(500).json({ ok: false, msg: 'Error interno del servidor.' });
  }
};

// =========================================================================
// EXPORTS
// =========================================================================
module.exports = {
  create,
  list,
  getPendingJobs,
  getActiveJobs,
  getHistoryJobs,
  update,
  getById,
  assignTechnician
};