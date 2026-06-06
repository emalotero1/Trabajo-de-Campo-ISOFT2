// src/services/ordenService.js
import api from './api';

export const crearOrden = async (id_equipo, estado, observaciones) => {
  const res = await api.post('/ordenes', { id_equipo, estado, observaciones });
  return res.data;
};

export const obtenerTodasLasOrdenes = async () => {
  const res = await api.get('/ordenes');
  return res.data;
};

export const obtenerOrdenesPendientes = async () => {
  const res = await api.get('/ordenes/pendientes');
  return res.data;
};

export const obtenerOrdenPorId = async (id) => {
  const res = await api.get(`/ordenes/${id}`);
  return res.data;
};

export const actualizarEstadoTrabajo = async (id, estado, observaciones) => {
  // Maneja tanto los cambios de bitácora en la mesa como los cambios de estado simples
  const res = await api.put(`/ordenes/${id}/trabajo`, { estado, observaciones });
  return res.data;
};

export const actualizarOrdenCompleta = async (id, datosActualizados) => {
  // Para la mesa de trabajo (presupuestos, diagnóstico, etc)
  const res = await api.put(`/ordenes/${id}/trabajo`, datosActualizados);
  return res.data;
};

export const asignarOrden = async (id) => {
  // Asegurate de que 'api' sea tu instancia de Axios
  const res = await api.put(`/ordenes/${id}/asignar`);
  return res.data;
};