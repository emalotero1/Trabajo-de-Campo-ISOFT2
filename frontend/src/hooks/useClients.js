import { useState, useCallback } from 'react';
import axios from 'axios';

export const useClients = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:5000/api/clients'; 

    // Función auxiliar para configurar los headers
    const authConfig = (token) => ({
        headers: {
            Authorization: `Bearer ${token}` // Cambia a 'x-auth-token': token si tu backend usa ese formato
        }
    });

    // --- OBTENER TODOS ---
    const getClients = useCallback(async (token) => {
        if (!token) return; // Evita peticiones si aún no hay token
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/list`, authConfig(token)); 
            setClients(response.data.clients || []);
        } catch (err) {
            setError(err.response?.data?.message || 'ERROR_CONEXIÓN_SERVIDOR');
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    // --- CREAR ---
    const createClient = async (clientData, token) => {
        setLoading(true);
        setError(null);
        try {
            // Pasamos authConfig(token) como tercer parámetro en POST
            const response = await axios.post(`${API_URL}/register`, clientData, authConfig(token));
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'ERROR_AL_CREAR_CLIENTE';
            setError(errorMsg);
            throw new Error(errorMsg); 
        } finally {
            setLoading(false);
        }
    };

    // --- ACTUALIZAR ---
    const updateClient = async (id, clientData, token) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.put(`${API_URL}/update/${id}`, clientData, authConfig(token));
            setClients(prev => prev.map(client => client._id === id ? response.data.client : client));
            return response.data;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'ERROR_AL_ACTUALIZAR_CLIENTE';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // --- ELIMINAR ---
    // --- ELIMINAR (BORRADO LÓGICO) ---
    // --- ELIMINAR ---
    const deleteClient = async (id, token) => {
        setLoading(true);
        setError(null);
        try {
            // Fíjate bien en la URL: aseguramos que el ID se inyecte correctamente
            const url = `${API_URL}/remove/${id}`;
            
            // Hacemos el delete pasando la configuración correctamente
            const response = await axios.delete(url, authConfig(token));
            
            // Filtramos el cliente borrado de la lista local
            setClients(prev => prev.filter(client => client._id !== id));
            
            return response.data;
        } catch (err) {
            console.error("Error al borrar el cliente:", err); // Para ver el error exacto en consola
            const errorMsg = err.response?.data?.message || 'ERROR_AL_ELIMINAR_CLIENTE';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return { clients, loading, error, setError, getClients, createClient, updateClient, deleteClient };
};