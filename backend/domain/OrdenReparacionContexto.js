// src/domain/OrdenReparacionContexto.js
const { 
  ESTADOS, PendienteRevision, Asignado, Diagnosticado, 
  Presupuestado, PresupuestoAceptado, PresupuestoRechazado, 
  Reparado, Entregado 
} = require('./states/EstadosConcretos');

class OrdenReparacionContexto {
  constructor(ordenMongoose) {
    this.orden = ordenMongoose; // El documento Mongoose
    this.estadoActual = this._instanciarEstado(this.orden.estado);
  }

  obtenerClaseEstado(nombreEstado) {
    switch (nombreEstado) {
      case ESTADOS.PENDIENTE_REVISION: return PendienteRevision;
      case ESTADOS.ASIGNADO: return Asignado;
      case ESTADOS.DIAGNOSTICADO: return Diagnosticado;
      case ESTADOS.PRESUPUESTADO: return Presupuestado;
      case ESTADOS.PRESUPUESTO_ACEPTADO: return PresupuestoAceptado;
      case ESTADOS.PRESUPUESTO_RECHAZADO: return PresupuestoRechazado;
      case ESTADOS.REPARADO: return Reparado;
      case ESTADOS.ENTREGADO: return Entregado;
      default: return PendienteRevision;
    }
  }

  _instanciarEstado(nombreEstado) {
    const ClaseEstado = this.obtenerClaseEstado(nombreEstado);
    return new ClaseEstado(this);
  }

  setEstadoActual(nuevoNombreEstado) {
    this.orden.estado = nuevoNombreEstado;
    this.estadoActual = this._instanciarEstado(nuevoNombreEstado);
  }

  // Avanza de estado validando reglas y datos
  avanzarA(nuevoNombreEstado, datosPeticion) {
    this.estadoActual.transicionarA(nuevoNombreEstado, datosPeticion);
  }
}

module.exports = OrdenReparacionContexto;