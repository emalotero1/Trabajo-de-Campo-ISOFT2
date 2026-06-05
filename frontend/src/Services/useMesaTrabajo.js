import { useState, useEffect } from 'react';

export const useMesaTrabajo = () => {
  const [listaPendientes, setListaPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Cargar TODOS los trabajos pendientes al abrir la vista
  useEffect(() => {
    const fetchPendientes = async () => {
      try {
        setLoading(true);
        
        // Buscamos el token en el almacenamiento del navegador
        // NOTA: Si tu token se guarda con otro nombre, cambialo acá (ej: 'jwt', 'authToken')
        const token = localStorage.getItem('token'); 

        const response = await fetch(`http://localhost:5000/api/ordenes/pendientes`, {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Ahora sí tiene de dónde leerlo
          }
        });
        const data = await response.json();
        
        if (data.ok) {
          setListaPendientes(data.ordenes);
        } else {
          throw new Error(data.msg || 'Error al obtener órdenes');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPendientes();
  }, []);

  // 2. Función para guardar los cambios de una orden específica
  const actualizarOrden = async (ordenId, datosActualizados) => {
    try {
      const token = localStorage.getItem('token'); // Lo buscamos de nuevo para esta petición

      const response = await fetch(`http://localhost:5000/api/ordenes/${ordenId}/trabajo`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Descomentado y funcionando
        },
        body: JSON.stringify(datosActualizados)
      });
      
      if (!response.ok) throw new Error('Error al actualizar');
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return { listaPendientes, loading, error, actualizarOrden };
};