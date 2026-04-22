import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authProvider';
import Index from '../components/Index';
import Login from '../components/Login';
import MisDatos from '../components/MisDatos';
import PrivateRoute from '../routes/PrivateRoutes';
import RoleRoute from '../routes/RoleRoutes'; // Asegúrate de importar tu RoleRoute


// Importamos los nuevos Homes
import HomeAdministrador from '../components/Homes/HomeAdministrador';

import HomeRecepcionista from '../components/Homes/HomeRecepcionista';

import HomeTecnico from '../components/Homes/HomeTecnico';

import StaffManagement from '../components/Staff/StaffManagment';



// Componente Selector de Home según Rol
const HomeRouter = () => {
  const { user } = useAuth();
  const role = user?.rol?.toLowerCase()?.trim();

  if (role === 'administrador') return <HomeAdministrador />;

  if (role === 'recepcionista') return <HomeRecepcionista />;

  if (role === 'tecnico') return <HomeTecnico />;
  return <HomeConsumidor />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      {/* NIVEL 1: PROTECCIÓN DE AUTENTICACIÓN (LOGUEADO) */}
      <Route element={<PrivateRoute />}>
        <Route path="/home" element={<HomeRouter />} />
        <Route path="/mis-datos" element={<MisDatos />} />
      

        {/* NIVEL 2: PROTECCIÓN DE ROL (SÓLO ADMINISTRADOR) */}
        <Route element={<RoleRoute allowedRoles={['administrador']} />}>
       <Route path="/usuarios" element={<StaffManagement />} />
          </Route>
      </Route>

      {/* REDIRECCIÓN GLOBAL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;