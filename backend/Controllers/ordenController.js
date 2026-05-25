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
      estado: estado || 'INGRESADO'
    });

    const ordenGuardada = await nuevaOrden.save();

    try {
      const primerHistorial = new EstadoHistorial({
        id_orden: ordenGuardada._id,
        estado: ordenGuardada.estado,
        id_usuario: id_usuario_recepcionista
      });
      await primerHistorial.save();
    } catch (errorHistorial) {
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
        path: 'id_equipo', // 1. Campo real en tu OrdenReparacionSchema
        model: 'Equipo',   // 2. Nombre exacto con el que registraste el modelo en Equipo.js (singular)
        populate: { 
          path: 'cliente', // 3. Campo real que vimos en tu equipoSchema (en minúscula y singular)
          model: 'Client'  // 4. Nombre exacto con el que registraste el modelo en Client.js
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