const OrdenReparacion = require('../Models/OrdenReparacion');
const EstadoHistorial = require('../Models/EstadoHistorial');
const Equipo = require('../Models/Equipos'); 
const Client = require('../Models/Client'); 

// =========================================================================
// 1. POST - Crear Orden
// =========================================================================
exports.crearOrden = async (req, res) => {
  try {
    const { id_equipo, estado, observaciones } = req.body;

    if (!id_equipo) {
      return res.status(400).json({ ok: false, msg: 'Debe seleccionar un equipo válido.' });
    }

    const id_usuario_recepcionista = req.user.id;
    const ultimaOrden = await OrdenReparacion.findOne().sort({ nro_orden: -1 });
    const nro_orden = ultimaOrden ? ultimaOrden.nro_orden + 1 : 1000;

    const nuevaOrden = new OrdenReparacion({
      nro_orden,
      id_equipo,
      id_usuario: id_usuario_recepcionista,
      estado: estado || 'PENDIENTE DE REVISION',
      observaciones: observaciones
      
    });

    const ordenGuardada = await nuevaOrden.save();
    await Equipo.findByIdAndUpdate(id_equipo, { asignadoAOrden: true });

    try {
      const primerHistorial = new EstadoHistorial({
        id_orden: ordenGuardada._id,
        estado: ordenGuardada.estado,
        id_usuario: id_usuario_recepcionista
      });
      await primerHistorial.save();
    } catch (errorHistorial) {
      console.error("ERROR REAL DE MONGOOSE EN HISTORIAL:", errorHistorial); // <-- Agrega esta línea
      await OrdenReparacion.findByIdAndDelete(ordenGuardada._id);
      throw new Error('Error al inicializar el historial de estados.');
    }

    res.status(201).json({
      ok: true,
      msg: 'Orden de reparación generada exitosamente',
      orden: ordenGuardada
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: 'Hubo un error en el servidor.' });
  }
};

// =========================================================================
// 2. GET - Obtener Órdenes Emitidas
// =========================================================================
exports.obtenerOrdenes = async (req, res) => {
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
// 3. GET - Trabajos Pendientes (Para el Técnico)
// =========================================================================
exports.getTrabajosPendientes = async (req, res) => {
  try {
      const ordenes = await OrdenReparacion.find({
          estado: { $nin: ['ENTREGADO', 'REPARADO'] } 
      })
      .populate({
          path: 'id_equipo', 
          model: 'Equipo',
          populate: { path: 'cliente', model: 'Client' }
      })
      .sort({ nro_orden: 1 }); // Orden de llegada

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
// 4. PUT - Actualizar Diagnóstico, Presupuesto, Estado y Bitácora
// =========================================================================
exports.actualizarTrabajo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Agregamos "observaciones" para recibir la bitácora desde el ModificarEstado.jsx
    const { estado, diagnostico, presupuesto, observaciones } = req.body;

    const orden = await OrdenReparacion.findById(id);
    if (!orden) return res.status(404).json({ ok: false, msg: 'Orden no encontrada' });

    // --- REGISTRO DE HISTORIAL ---
    if (estado && orden.estado !== estado) {
      const nuevoHistorial = new EstadoHistorial({
        id_orden: orden._id,
        estado: estado, 
        id_usuario: req.user.id 
      });
      await nuevoHistorial.save();
    }

    // --- ACTUALIZACIÓN DE DATOS DINÁMICA ---
    if (estado) orden.estado = estado;
    if (diagnostico) orden.diagnostico = diagnostico;
    
    // Verificamos undefined en lugar de true/false para permitir que se guarde un string vacío (borrar bitácora)
    if (observaciones !== undefined) orden.observaciones = observaciones; 
    
    if (presupuesto) {
      let totalRepuestos = 0;
      if (presupuesto.repuestos && presupuesto.repuestos.length > 0) {
        totalRepuestos = presupuesto.repuestos.reduce(
          (sum, item) => sum + (item.cantidad * item.precioUnitario), 0
        );
      }
      const totalManoObra = Number(presupuesto.manoDeObra?.precio) || 0;
      presupuesto.total = totalRepuestos + totalManoObra;

      orden.presupuesto = presupuesto;
    }

    await orden.save();

    return res.status(200).json({ ok: true, msg: 'Trabajo actualizado correctamente', orden });
  } catch (error) {
    console.error("Error al actualizar trabajo:", error);
    return res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
  }
};

// =========================================================================
// 5. GET - Obtener Orden por ID (Para cargar la Mesa de Trabajo y Timeline)
// =========================================================================
exports.obtenerOrdenPorId = async (req, res) => {
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

    return res.status(200).json({ ok: true, status: "success", orden });
  } catch (error) {
    console.error("Error al obtener orden por ID:", error);
    return res.status(500).json({ ok: false, msg: 'Error interno del servidor' });
  }
};