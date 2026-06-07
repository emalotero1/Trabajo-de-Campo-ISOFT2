import { 
  ESTADOS, 
  PendienteRevision, 
  EnDiagnostico, 
  Presupuestado, 
  PresupuestoAceptado, 
  PresupuestoRechazado, 
  Reparado, 
  Entregado 
} from './Estados';

export default class OrdenReparacionContexto {
  constructor(ordenDatos) {
    this.datos = ordenDatos;// Guarda los datos de la base de datos (cliente, equipo, etc.)
    this.estadoActual = this._instanciarEstado(ordenDatos.estado);
  }

  _instanciarEstado(nombreEstado) {
    switch (nombreEstado) {
      case ESTADOS.PENDIENTE_REVISION:    return new PendienteRevision(this);
      case ESTADOS.EN_DIAGNOSTICO:        return new EnDiagnostico(this);
      case ESTADOS.PRESUPUESTADO:         return new Presupuestado(this);
      case ESTADOS.PRESUPUESTO_ACEPTADO:  return new PresupuestoAceptado(this);
      case ESTADOS.PRESUPUESTO_RECHAZADO: return new PresupuestoRechazado(this);
      case ESTADOS.REPARADO:              return new Reparado(this);
      case ESTADOS.ENTREGADO:             return new Entregado(this);
      default:                            return new PendienteRevision(this); 
    }
  }

  getEstadoNombre() { return this.estadoActual.getNombre(); }
  getTransicionesValidas() { return this.estadoActual.getTransicionesValidas(); }
  puedeEditarDiagnostico() { return this.estadoActual.puedeEditarDiagnostico(); }
  puedeEditarPresupuesto() { return this.estadoActual.puedeEditarPresupuesto(); }
  getMetadatosUI() { return this.estadoActual.getMetadatosUI(); }

  setEstado(nuevoNombreEstado) {
    this.datos.estado = nuevoNombreEstado;
    this.estadoActual = this._instanciarEstado(nuevoNombreEstado);
  }

  avanzarA(nuevoNombreEstado) {
    this.estadoActual.transicionarA(nuevoNombreEstado);
  }
}