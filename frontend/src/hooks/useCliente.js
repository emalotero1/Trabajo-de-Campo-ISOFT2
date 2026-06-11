// src/hooks/useClients.js
import { useState, useCallback } from 'react';
import * as clienteService from '../Services/clienteServicio';

export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await clienteService.obtenerClientes(); 
            setClients(data.clients || []);
        } catch (err) {
            setError(err.response?.data?.message || 'ERROR AL OBTENER CLIENTES');
        } finally {
            setLoading(false);
        }
    }, []);

    const createClient = async (clientData) => {
        setLoading(true);
        setError(null);
        try {
            return await clienteService.crearCliente(clientData);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'ERROR AL CREAR CLIENTE';
            setError(errorMsg);
            throw new Error(errorMsg); 
        } finally {
            setLoading(false);
        }
    };

    const updateClient = async (id, clientData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await clienteService.actualizarCliente(id, clientData);
            setClients(prev => prev.map(c => c._id === id ? data.client : c));
            return data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'ERROR AL ACTUALIZAR CLIENTE';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const deleteClient = async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await clienteService.eliminarCliente(id);
            setClients(prev => prev.filter(c => c._id !== id));
            return data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'ERROR AL ELIMINAR CLIENTE';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return { clients, loading, error, setError, getClients, createClient, updateClient, deleteClient };
};