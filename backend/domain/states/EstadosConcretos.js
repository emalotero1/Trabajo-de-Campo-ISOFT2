// src/domain/states/EstadosConcretos.js
const EstadoOrden = require('./EstadoOrden');

const ESTADOS = {
  PENDIENTE_REVISION: 'PENDIENTE DE REVISION',
  ASIGNADO: 'ASIGNADO',
  DIAGNOSTICADO: 'DIAGNOSTICADO',
  PRESUPUESTADO: 'PRESUPUESTADO',
  PRESUPUESTO_ACEPTADO: 'PRESUPUESTO ACEPTADO',
  PRESUPUESTO_RECHAZADO: 'PRESUPUESTO RECHAZADO',
  REPARADO: 'REPARADO',
  ENTREGADO: 'ENTREGADO',
};

class PendienteRevision extends EstadoOrden {
  getNombre() { return ESTADOS.PENDIENTE_REVISION; }
  getTransicionesValidas() { return [ESTADOS.ASIGNADO]; }
}

class Asignado extends EstadoOrden {
  getNombre() { return ESTADOS.ASIGNADO; }
  getTransicionesValidas() { return [ESTADOS.DIAGNOSTICADO]; }
}

class Diagnosticado extends EstadoOrden {
  getNombre() { return ESTADOS.DIAGNOSTICADO; }
  getTransicionesValidas() { return [ESTADOS.PRESUPUESTADO]; }
  
  // REGLA DE NEGOCIO MIGRADADA DESDE EL CONTROLADOR
  validarEntrada(datos) {
    const { diagnostico } = datos;
    if (!diagnostico?.informe || diagnostico.informe.trim().length < 15) {
      throw new Error('Para avanzar a DIAGNOSTICADO debes completar el detalle de la falla con al menos 15 caracteres.');
    }
  }
}

class Presupuestado extends EstadoOrden {
  getNombre() { return ESTADOS.PRESUPUESTADO; }
  getTransicionesValidas() { return [ESTADOS.PRESUPUESTO_ACEPTADO, ESTADOS.PRESUPUESTO_RECHAZADO]; }

  // REGLA DE NEGOCIO MIGRADADA DESDE EL CONTROLADOR
  validarEntrada(datos) {
    const { presupuesto } = datos;
    const hayRepuestos = presupuesto?.repuestos?.length > 0;
    const hayManoObra = Number(presupuesto?.manoDeObra?.precio) > 0;
    if (!hayRepuestos && !hayManoObra) {
      throw new Error('Para avanzar a PRESUPUESTADO debes cargar repuestos o mano de obra.');
    }
  }
}

class PresupuestoAceptado extends EstadoOrden {
  getNombre() { return ESTADOS.PRESUPUESTO_ACEPTADO; }
  getTransicionesValidas() { return [ESTADOS.REPARADO]; }
}

class PresupuestoRechazado extends EstadoOrden {
  getNombre() { return ESTADOS.PRESUPUESTO_RECHAZADO; }
  getTransicionesValidas() { return [ESTADOS.ENTREGADO]; }
}

class Reparado extends EstadoOrden {
  getNombre() { return ESTADOS.REPARADO; }
  getTransicionesValidas() { return [ESTADOS.ENTREGADO]; }
}

class Entregado extends EstadoOrden {
  getNombre() { return ESTADOS.ENTREGADO; }
  getTransicionesValidas() { return []; }
}

module.exports = {
  ESTADOS,
  PendienteRevision,
  Asignado,
  Diagnosticado,
  Presupuestado,
  PresupuestoAceptado,
  PresupuestoRechazado,
  Reparado,
  Entregado
};