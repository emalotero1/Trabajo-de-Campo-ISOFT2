import React from 'react'; // Agregado por compatibilidad
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/authProvider';

const RoleRoute = ({ allowedRoles }) => {
  const { user, isAuth, loading } = useAuth();

  if (loading) return null;

  // Extraemos el rol con seguridad (Optional Chaining)
  const userRole = user?.rol?.toLowerCase()?.trim();

  // Verificamos si existe el rol y si está incluido en los permitidos
  // Si userRole es undefined, includes devolverá false
  const hasAccess = isAuth && userRole && allowedRoles.includes(userRole);

  if (!hasAccess) {
    // Si no tiene acceso, lo expulsamos al home
    return <Navigate to="/home" replace />;
  }

  // Si tiene acceso, renderizamos las rutas hijas (como /usuarios)
  return <Outlet />;d
};

export default RoleRoute;