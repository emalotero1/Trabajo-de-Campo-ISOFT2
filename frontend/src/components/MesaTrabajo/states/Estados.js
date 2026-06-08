import EstadoOrden from './EstadoOrden';

// ─────────────────────────────────────────────────────────────────────────────
// Constantes exactas del enum de Mongoose
// ─────────────────────────────────────────────────────────────────────────────
export const ESTADOS = {
  PENDIENTE_REVISION:    'PENDIENTE DE REVISION',
  ASIGNADO:              'ASIGNADO',
  DIAGNOSTICADO:         'DIAGNOSTICADO',
  PRESUPUESTADO:         'PRESUPUESTADO',
  PRESUPUESTO_ACEPTADO:  'PRESUPUESTO ACEPTADO',
  PRESUPUESTO_RECHAZADO: 'PRESUPUESTO RECHAZADO',
  REPARADO:              'REPARADO',
  ENTREGADO:             'ENTREGADO',
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. PENDIENTE DE REVISION
// ─────────────────────────────────────────────────────────────────────────────
export class PendienteRevision extends EstadoOrden {
  getNombre() { return ESTADOS.PENDIENTE_REVISION; }
  getTransicionesValidas() { return [ESTADOS.ASIGNADO]; }
  puedeEditarDiagnostico() { return true; }
  getMetadatosUI() {
    return { color: '#f59e0b', label: 'Pendiente de Revisión', descripcion: 'En espera de ser tomada por un técnico.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ASIGNADO
// ─────────────────────────────────────────────────────────────────────────────
export class Asignado extends EstadoOrden {
  getNombre() { return ESTADOS.ASIGNADO; }
  getTransicionesValidas() { return [ESTADOS.DIAGNOSTICADO]; }
  puedeEditarDiagnostico() { return true; }
  puedeEditarPresupuesto() { return false; }
  getMetadatosUI() {
    return { color: '#06b6d4', label: 'Asignado', descripcion: 'Equipo asignado. Completa el diagnóstico ahora para avanzar a DIAGNOSTICADO.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. DIAGNOSTICADO
// ─────────────────────────────────────────────────────────────────────────────
export class Diagnosticado extends EstadoOrden {
  getNombre() { return ESTADOS.DIAGNOSTICADO; }
  getTransicionesValidas() { return [ESTADOS.PRESUPUESTADO]; }
  puedeEditarDiagnostico() { return false; }
  puedeEditarPresupuesto() { return true; }
  getMetadatosUI() {
    return { color: '#f59e0b', label: 'Diagnosticado', descripcion: 'Diagnóstico completado. Ahora arma el presupuesto.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRESUPUESTADO
// ─────────────────────────────────────────────────────────────────────────────
export class Presupuestado extends EstadoOrden {
  getNombre() { return ESTADOS.PRESUPUESTADO; }
  getTransicionesValidas() { return [ESTADOS.PRESUPUESTO_ACEPTADO, ESTADOS.PRESUPUESTO_RECHAZADO]; }
  puedeSerDecididoPorCliente() { return true; }
  getMetadatosUI() {
    return { color: '#8b5cf6', label: 'Presupuestado', descripcion: 'Esperando la decisión del cliente.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4A. PRESUPUESTO ACEPTADO
// ─────────────────────────────────────────────────────────────────────────────
export class PresupuestoAceptado extends EstadoOrden {
  getNombre() { return ESTADOS.PRESUPUESTO_ACEPTADO; }
  getTransicionesValidas() { return [ESTADOS.REPARADO]; } // De aceptado pasa directo a estar reparado
  getMetadatosUI() {
    return { color: '#10b981', label: 'Presupuesto Aceptado', descripcion: 'Aprobado. Se procede con la reparación.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4B. PRESUPUESTO RECHAZADO
// ─────────────────────────────────────────────────────────────────────────────
export class PresupuestoRechazado extends EstadoOrden {
  getNombre() { return ESTADOS.PRESUPUESTO_RECHAZADO; }
  getTransicionesValidas() { return [ESTADOS.ENTREGADO]; } // Si se rechaza, solo queda entregarlo de vuelta
  getMetadatosUI() {
    return { color: '#ef4444', label: 'Presupuesto Rechazado', descripcion: 'Rechazado por el cliente. Devolución pendiente.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. REPARADO
// ─────────────────────────────────────────────────────────────────────────────
export class Reparado extends EstadoOrden {
  getNombre() { return ESTADOS.REPARADO; }
  getTransicionesValidas() { return [ESTADOS.ENTREGADO]; }
  getMetadatosUI() {
    return { color: '#14b8a6', label: 'Reparado', descripcion: 'El equipo fue reparado y está listo para retiro.' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. ENTREGADO (Estado Terminal)
// ─────────────────────────────────────────────────────────────────────────────
export class Entregado extends EstadoOrden {
  getNombre() { return ESTADOS.ENTREGADO; }
  getTransicionesValidas() { return []; } // Estado final, sin salidas
  getMetadatosUI() {
    return { color: '#00a8e8', label: 'Entregado', descripcion: 'Orden cerrada. Equipo entregado al cliente.' };
  }
}