// src/hooks/useUsuarios.js
import { useState } from 'react';
import * as userService from '../Services/userServicio';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.obtenerUsuarios();
      setUsuarios(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || "ERROR_AL_OBTENER_USUARIOS");
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      return await userService.crearUsuario(userData);
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
      return await userService.actualizarUsuario(id, userData);
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
      return await userService.eliminarUsuario(id);
    } catch (err) {
      const msg = err.response?.data?.message || "ERROR_AL_ELIMINAR";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { usuarios, getUsers, createUser, updateUser, deleteUser, loading, error, setError };
};