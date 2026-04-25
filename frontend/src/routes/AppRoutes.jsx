import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authProvider';
import Index from '../components/Index';
import Login from '../components/Login';
import MisDatos from '../components/MisDatos';
import PrivateRoute from '../routes/PrivateRoutes';
import RoleRoute from '../routes/RoleRoutes'; 

// Importamos los Homes
import HomeAdministrador from '../components/Homes/HomeAdministrador';
import HomeRecepcionista from '../components/Homes/HomeRecepcionista';
import HomeTecnico from '../components/Homes/HomeTecnico';
// import HomeConsumidor from '../components/Homes/HomeConsumidor'; // <-- Asegúrate de importar esto si lo usas abajo

// Importamos los ABMs
import StaffManagement from '../components/Staff/StaffManagment';
import ClientManagement from '../components/Clients/ClientManagement';

// Componente Selector de Home según Rol
const HomeRouter = () => {
  const { user } = useAuth();
  const role = user?.rol?.toLowerCase()?.trim();

  if (role === 'administrador') return <HomeAdministrador />;
  if (role === 'recepcionista') return <HomeRecepcionista />;
  if (role === 'tecnico') return <HomeTecnico />;
  
  // Asumiendo que tienes un Home por defecto
  return <HomeConsumidor />; 
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />

      {/* NIVEL 1: PROTECCIÓN DE AUTENTICACIÓN (DEBE ESTAR LOGUEADO) */}
      <Route element={<PrivateRoute />}>
        
        {/* Rutas generales para cualquier logueado */}
        <Route path="/home" element={<HomeRouter />} />
        <Route path="/mis-datos" element={<MisDatos />} />

        {/* NIVEL 2: PROTECCIÓN DE ROL (SÓLO ADMINISTRADOR) */}
        <Route element={<RoleRoute allowedRoles={['administrador']} />}>
          <Route path="/usuarios" element={<StaffManagement />} />
        </Route>

        {/* NIVEL 2: PROTECCIÓN DE ROL (ADMIN Y RECEPCIONISTA) */}
        {/* Un administrador usualmente también debería poder gestionar clientes */}
        <Route element={<RoleRoute allowedRoles={['administrador', 'recepcionista']} />}>
          <Route path="/clients" element={<ClientManagement />} />
        </Route>

      </Route> {/* <-- AQUÍ CIERRA EL PrivateRoute CORRECTAMENTE */}

      {/* REDIRECCIÓN GLOBAL (Cualquier ruta no definida va al index) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;