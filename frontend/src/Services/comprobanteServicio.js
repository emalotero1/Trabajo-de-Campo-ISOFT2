// Importa tu instancia configurada de Axios (ajusta la ruta según tu estructura de carpetas)
import api from './api'; 

export const getOrdenes = async () => {
    // Ya no necesitas preocuparte por la URL base ni por el token
    const response = await api.get('/ordenes');
    
    // Axios guarda la respuesta JSON del servidor directamente en la propiedad 'data'
    return response.data; 
};

export const updateEstadoOrden = async (id, estado) => {
    const response = await api.put(`/ordenes/${id}/trabajo`, { estado });
    
    return response.data;
};