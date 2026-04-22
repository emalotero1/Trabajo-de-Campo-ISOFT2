import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const useProducts = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${apiUrl}/products/activos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProductos(data.productos || []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  // Métricas para el panel superior (KPIs)
  const stats = useMemo(() => {
    const total = productos.reduce((acc, p) => acc + (Number(p.price_final || 0) * Number(p.quantity || 0)), 0);
    const bajoStock = productos.filter(p => p.quantity < 5).length;
    return { total, bajoStock };
  }, [productos]);

  const filtered = useMemo(() => {
    const search = searchText.toLowerCase();
    return productos.filter(p => 
      p.name?.toLowerCase().includes(search) ||
      p.category?.toLowerCase().includes(search) ||
      p.provider?.toLowerCase().includes(search) ||
      p.code?.toLowerCase().includes(search)
    );
  }, [searchText, productos]);

  return { productos: filtered, loading, searchText, setSearchText, stats, refresh: fetchProductos };
};