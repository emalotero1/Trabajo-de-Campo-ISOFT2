import { useState } from 'react';
import axios from 'axios';

export const useUsers = () => {
  const [users, setUsers] = useState([]); // Estado para guardar la lista
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const getHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  // --- NUEVA PETICIÓN: OBTENER TODOS ---
  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/users/list`, getHeaders());
      // Ajusta 'response.data' según cómo devuelva tu backend la lista (ej: response.data.users)
      setUsers(Array.isArray(response.data) ? response.data : response.data.users || []);
    } catch (err) {
      const msg = err.response?.data?.message || "ERROR_AL_OBTENER_USUARIOS";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}/users/register`, userData, getHeaders());
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "ERROR_AL_CREAR_USUARIO";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BASE_URL}/users/update/${id}`, userData, getHeaders());
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "ERROR_AL_ACTUALIZAR";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${BASE_URL}/users/delete/${id}`, getHeaders());
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "ERROR_AL_ELIMINAR";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Importante: Agregamos users y getUsers al return
  return { users, getUsers, createUser, updateUser, deleteUser, loading, error, setError };
};