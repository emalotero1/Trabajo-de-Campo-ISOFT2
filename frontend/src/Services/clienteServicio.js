// src/services/clienteService.js
import api from './api';

export const obtenerClientes = async () => {
    const res = await api.get('/clients/list');
    return res.data;
};

export const crearCliente = async (clientData) => {
    const res = await api.post('/clients/register', clientData);
    return res.data;
};

export const actualizarCliente = async (id, clientData) => {
    const res = await api.put(`/clients/update/${id}`, clientData);
    return res.data;
};

export const eliminarCliente = async (id) => {
    const res = await api.delete(`/clients/remove/${id}`);
    return res.data;
};