// src/domain/states/EstadoOrden.js

class EstadoOrden {
  constructor(contexto) {
    if (new.target === EstadoOrden) {
      throw new Error('EstadoOrden es abstracta y no puede instanciarse.');
    }
    this.contexto = contexto;
  }

  getNombre() {
    throw new Error('getNombre() no implementado');
  }

  getTransicionesValidas() {
    return [];
  }

  puedeTransicionarA(estadoDestino) {
    return this.getTransicionesValidas().includes(estadoDestino);
  }

  // NUEVO EN BACKEND: Valida los datos antes de permitir entrar a este estado
  validarEntrada(datosPeticion) {
    // Por defecto no exige nada, pero los estados hijos lo sobrescribirán
    return true; 
  }

  transicionarA(estadoDestino, datosPeticion = {}) {
    if (!this.puedeTransicionarA(estadoDestino)) {
      throw new Error(`Transición inválida: No se puede pasar de "${this.getNombre()}" a "${estadoDestino}".`);
    }

    // Instanciamos temporalmente el estado destino para validar si cumple los requisitos
    const EstadoDestinoClass = this.contexto.obtenerClaseEstado(estadoDestino);
    const estadoTemp = new EstadoDestinoClass(this.contexto);
    
    // Ejecutamos la validación de negocio (los antiguos 'if' de tu controlador)
    estadoTemp.validarEntrada(datosPeticion);

    // Si no tiró error, hacemos el cambio
    this.contexto.setEstadoActual(estadoDestino);
  }
}

module.exports = EstadoOrden;