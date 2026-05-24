import { createContext, useContext, useState } from 'react';
import jwt_decode from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Inicializamos el estado directamente desde localStorage
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
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
     const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUser, password }),
      });

      // 1. Leemos la respuesta como texto puro primero
      const textResponse = await res.text();

      // 2. Intentamos convertir ese texto a JSON
      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (err) {
        // 🚨 SI CAE AQUÍ: El servidor mandó HTML o texto en lugar de JSON.
        console.error("Respuesta del servidor que rompió el JSON:", textResponse);
        throw new Error("Error de conexión: El servidor respondió con un formato incorrecto. Revisa la consola.");
      }

      // 3. Flujo normal (ahora es seguro)
      if (!res.ok) {
        const error = new Error(data.message || 'Error en el login');
        error.status = res.status;
        throw error;
      }

      localStorage.setItem('token', data.token);
      const decoded = jwt_decode(data.token);
      setAuth({ isAuth: true, user: decoded });
      
      return decoded;
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

// ¡ESTA ES LA LÍNEA QUE FALTABA!
export const useAuth = () => useContext(AuthContext);