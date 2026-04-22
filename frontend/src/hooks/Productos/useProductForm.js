// hooks/useProductForm.js
import { useState, useEffect } from 'react';
import ValidacionesForm from '../../components/Productos/ValidacionesForm';

const apiUrl = import.meta.env.VITE_API_URL;

export const useProductForm = (producto, onSave, onClose, handleDelete) => {
  const initialFormState = {
    name: '', description: '', por_descuento: 0, por_marginal: 0,
    category: '', quantity: 0, medida: '', provider: '',
    price_siva: 0, price_usd: 0,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [precioFinal, setPrecioFinal] = useState(0);
  const [errores, setErrores] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sincronizar con producto para edición
  useEffect(() => {
    if (producto) {
      setFormData({ ...producto, 
        price_siva: Number(producto.price_siva),
        por_marginal: Number(producto.por_marginal),
        por_descuento: Number(producto.por_descuento) 
      });
    } else {
      setFormData(initialFormState);
    }
    setErrores({});
  }, [producto]);

  // Cálculo automático de precio final
  useEffect(() => {
    const { price_siva, por_marginal, por_descuento } = formData;
    const final = Number(price_siva) * (1 + Number(por_marginal) / 100) * (1 - Number(por_descuento) / 100);
    setPrecioFinal(final.toFixed(2));
  }, [formData.price_siva, formData.por_marginal, formData.por_descuento]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const campos = ['name', 'description', 'category', 'provider', 'medida', 'quantity', 'price_siva'];
    const { errors, hayErrores } = ValidacionesForm({ formData, requiredFields: campos });

    if (hayErrores) return setErrores(errors);

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const url = producto ? `${apiUrl}/products/${producto._id}` : `${apiUrl}/products`;
      const method = producto ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...formData, price_final: Number(precioFinal) }),
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data);
        onClose();
      }
    } catch (error) {
      console.error("Error en submit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { formData, precioFinal, errores, isSubmitting, handleChange, handleSubmit };
};