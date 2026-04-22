import { createContext, useContext, useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializamos el estado directamente desde localStorage para evitar flashes de "no logueado"
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        // Validar si el token expiró (opcional pero recomendado)
        if (decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          return { isAuth: false, user: null };
        }
        return { isAuth: true, user: decoded };
      } catch {
        return { isAuth: false, user: null };
      }
    }
    return { isAuth: false, user: null };
  });

  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const login = async (emailOrUser, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUser, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = new Error(data.message || 'Error en el login');
        error.status = res.status;
        throw error;
      }

      localStorage.setItem('token', data.token);
      const decoded = jwt_decode(data.token);
      setAuth({ isAuth: true, user: decoded });
      
      return decoded; // Retornamos para poder usarlo en el componente si hace falta
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ isAuth: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ ...auth, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);