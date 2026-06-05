// src/services/userService.js
import api from './api';

export const obtenerUsuarios = async () => {
  const res = await api.get('/users/list');
  return res.data;
};

export const crearUsuario = async (userData) => {
  const res = await api.post('/users/register', userData);
  return res.data;
};

export const actualizarUsuario = async (id, userData) => {
  const res = await api.put(`/users/update/${id}`, userData);
  return res.data;
};

export const eliminarUsuario = async (id) => {
  const res = await api.delete(`/users/delete/${id}`);
  return res.data;
};