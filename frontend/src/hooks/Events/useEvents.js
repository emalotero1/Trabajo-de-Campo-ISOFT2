import { useState, useCallback } from 'react';
import axios from 'axios';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const getHeaders = () => ({
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });

  // --- OBTENER TODOS ---
  const getEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/events/all`, getHeaders());
      const data = Array.isArray(response.data) ? response.data : response.data.events || [];
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || "DATABASE_SYNC_ERROR");
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  // --- ALTA (CREAR): /events/register ---
  const createEvent = async (eventData) => {
    setLoading(true);
    setError(null);
    try {
      // Limpiamos los datos antes de enviar (ej. quitar IDs temporales de lotes si el backend genera los suyos)
      const payload = {
        ...eventData,
        // Aseguramos que djs sea un array limpio sin strings vacíos
        djs: eventData.djs.filter(dj => dj.trim() !== '')
      };

      const response = await axios.post(`${BASE_URL}/events/register`, payload, getHeaders());
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.message || "FAILED_TO_INITIALIZE_UNIT";
      setError(msg);
      throw new Error(msg); // Lanzamos el error para que el modal lo capture
    } finally {
      setLoading(false);
    }
  };

  // --- ACTUALIZAR: /events/update/:id ---
  const updateEvent = async (id, eventData) => {
    setLoading(true);
    try {
      const response = await axios.put(`${BASE_URL}/events/update/${id}`, eventData, getHeaders());
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "UPDATE_WRITE_ERROR");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { events, getEvents, createEvent, updateEvent, loading, error, setError };
};