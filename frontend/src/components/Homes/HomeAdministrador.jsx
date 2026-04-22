import React from 'react';
import { useNavigate } from 'react-router-dom';

// Iconos Corporativos
import { 
  FaUserTie, FaUsers, FaChartLine, FaBriefcase 
} from 'react-icons/fa6';
import { IoCalendarNumberSharp } from "react-icons/io5";

// Hooks y Contexto
import { useAuth } from '../../../context/authProvider';

// Componentes
import Navbar from '../../components/Layout/Navbar';
import { Typography } from '@mui/material';

// Estilos
import '../../styles/HomeRoles.css';

const HomeAdministrador = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || 'Admin_User';

  // Opciones actualizadas: EMPLEADOS, CLIENTES, REPORTES, TRABAJOS, CALENDARIO
  const options = [
    { icon: <FaUserTie />, title: 'EMPLEADOS', path: '/usuarios', desc: 'Gestión de Staff y Permisos' },
    { icon: <FaUsers />, title: 'CLIENTES', path: '/clientes', desc: 'Base de Datos de Clientes' },
    { icon: <FaChartLine />, title: 'REPORTES', path: '/reportes', desc: 'Estadísticas y Balances' },
    { icon: <FaBriefcase />, title: 'TRABAJOS', path: '/trabajos', desc: 'Gestión de Órdenes y Tareas' },
    { icon: <IoCalendarNumberSharp />, title: 'CALENDARIO', path: '/calendario', desc: 'Planificación y Fechas' },
  ];

  return (
    <div className="home-dashboard-wrapper corporate-dark">
      <Navbar /> 
      <div className="home-glow-bg corporate-glow"></div>

      <div className="container home-content-z">
        {/* El margen superior aquí es clave para que el Navbar no tape el contenido */}
        <div className="home-welcome-header">
          <div className="welcome-text-box">
          
            <h1 className="welcome-title-corp">HOLA, {userName.toUpperCase()}</h1>
          </div>
        </div>

        <div className="row g-4 mt-2 mb-5">
          {options.map((option, index) => (
            <div 
              key={index} 
              className="col-xl-4 col-lg-4 col-md-6 col-sm-12"
              onClick={() => navigate(option.path)}
            >
              <div className="corporate-option-card">
                <div className="corp-card-accent"></div>
                <div className="icon-wrapper-corp">{option.icon}</div>
                <div className="card-info-corp">
                  <h3>{option.title}</h3>
                  <p className='desc'>{option.desc}</p>
                </div>
                <div className="card-corner-fx-corp"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeAdministrador;