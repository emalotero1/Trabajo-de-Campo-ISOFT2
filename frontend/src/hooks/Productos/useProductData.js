import { useState, useEffect } from 'react';
import axios from 'axios';

export const useProductData = (isOpen) => {
    const [categorias, setCategorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                setLoading(true);
                try {
                    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                    const [resCat, resProv, resUnits] = await Promise.all([
                        axios.get(`${API_URL}/categories`),
                        axios.get(`${API_URL}/providers`),
                        axios.get(`${API_URL}/measures`)
                    ]);
                    setCategorias(resCat.data);
                    setProveedores(resProv.data);
                    setUnidades(resUnits.data);
                } catch (error) {
                    console.error("Error en useProductData:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    return { categorias, proveedores, unidades, loading };
};