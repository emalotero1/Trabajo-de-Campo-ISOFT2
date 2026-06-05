// src/hooks/useMesaTrabajo.js
import { useState, useEffect } from 'react';
import { obtenerOrdenesPendientes, actualizarOrdenCompleta } from '../Services/ordenServicio';

export const useMesaTrabajo = () => {
  const [listaPendientes, setListaPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        setLoading(true);
        const data = await obtenerOrdenesPendientes();
        
        if (data.ok || data.status === 'success') {
          setListaPendientes(data.ordenes);
        } else {
          throw new Error(data.msg || 'Error al obtener órdenes');
        }
      } catch (err) {
        setError(err.message || 'Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchPendientes();
  }, []);

  const actualizarOrden = async (ordenId, datosActualizados) => {
    try {
      await actualizarOrdenCompleta(ordenId, datosActualizados);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al actualizar');
      return false;
    }
  };

  return { listaPendientes, loading, error, actualizarOrden };
};