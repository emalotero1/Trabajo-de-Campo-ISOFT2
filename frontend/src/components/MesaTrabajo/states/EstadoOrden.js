/**
 * PATRÓN ESTADO - Clase Base (Interfaz Abstracta)
 * Define el contrato que TODOS los estados deben cumplir.
 */
class EstadoOrden {
  /**
   * @param {OrdenReparacionContexto} contexto - La orden que contiene este estado
   */
  constructor(contexto) {
    // Evita que alguien intente crear un "EstadoOrden" genérico directo
    if (new.target === EstadoOrden) {
      throw new Error('EstadoOrden es una clase abstracta y no puede instanciarse directamente.');
    }
    this.contexto = contexto;
  }

  // --- MÉTODOS OBLIGATORIOS (Si un estado no lo tiene, tira error) ---
  getNombre() {
    throw new Error(`[EstadoOrden] getNombre() no implementado en ${this.constructor.name}`);
  }

  // --- MÉTODOS POR DEFECTO (Comportamiento base) ---
  getTransicionesValidas() {
    return []; // Por defecto, no se puede ir a ningún lado
  }

  puedeTransicionarA(estadoDestino) {
    return this.getTransicionesValidas().includes(estadoDestino);
  }

  transicionarA(estadoDestino) {
    if (!this.puedeTransicionarA(estadoDestino)) {
      throw new Error(
        `Transición inválida: No se puede pasar de "${this.getNombre()}" a "${estadoDestino}". ` +
        `Transiciones válidas permitidas: [${this.getTransicionesValidas().join(', ')}]`
      );
    }
    // Si es válido, le dice a la orden (contexto) que cambie su estado
    this.contexto.setEstado(estadoDestino);
  }

  // Por defecto, nadie puede editar nada a menos que el estado específico (ej: EnDiagnostico) diga que sí (return true)
  puedeEditarDiagnostico() { return false; }
  puedeEditarPresupuesto() { return false; }
  puedeSerDecididoPorCliente() { return false; }

  getMetadatosUI() {
    return {
      color: '#64748b',
      label: this.getNombre(),
      descripcion: ''
    };
  }
}

export default EstadoOrden;