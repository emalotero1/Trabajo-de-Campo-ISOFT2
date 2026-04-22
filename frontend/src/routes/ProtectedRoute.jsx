import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authProvider';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol.toLowerCase())) {
    // Si es comprador intentando entrar al admin, lo mandamos a la landing
    return <Navigate to="/" />;
  }

  return children;
};