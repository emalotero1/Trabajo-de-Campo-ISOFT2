// src/services/equipoService.js
import api from './api';

export const obtenerEquiposDisponibles = async () => {
  const res = await api.get('/equipos/list');
  return res.data;
};

export const guardarEquipo = async (payload, equipoId) => {
  if (equipoId) {
    const res = await api.put(`/equipos/update/${equipoId}`, payload);
    return res.data;
  }
  const res = await api.post('/equipos/register', payload);
  return res.data;
};

export const obtenerClientes = async () => {
  const res = await api.get('/clients/list');
  return res.data;
};