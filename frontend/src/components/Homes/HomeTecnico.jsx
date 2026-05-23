import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import { 
  FaReceipt, FaMicrochip, FaFilePen, FaClock, FaArrowRight, FaTemperatureHigh 
} from 'react-icons/fa6';
import { useAuth } from '../../../context/authProvider';
import Navbar from '../../components/Layout/Navbar';
import '../../styles/HomeRoles.css'; 

const HomeTecnico = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || 'Tech_User';

  // Datos operativos del laboratorio TodoPC (Telemetría en tiempo real)
  const labStats = {
    pendientes: 8,
    enProceso: 3,
    listosHoy: 5
  };

  const actions = [
    { 
      title: "TRABAJOS PENDIENTES", 
      desc: "Equipos en cola esperando revisión inicial.", 
      icon: <FaClock />, 
      path: "/trabajos-pendientes",
      count: labStats.pendientes 
    },
    { 
      title: "Cargar Presupuestos", 
      desc: "Asignar presupuestos a diagnósticos realizados.", 
      icon: <FaReceipt />, 
      path: "/reparaciones-activas" 
    },
    { 
      title: "NUEVO DIAGNÓSTICO", 
      desc: "Ingreso de fallas y presupuesto técnico.", 
      icon: <FaMicrochip />, 
      path: "/nuevo-diagnostico" 
    },
    { 
      title: "MODIFICAR ESTADO EQUIPO", 
      desc: "Actualizar estado de reparación.", 
      icon: <FaFilePen  />, 
      path: "/historial-tecnico" 
    },
  ];

  return (
    <div className="home-dashboard-wrapper corporate-dark">
      <Navbar />
      <div className="corporate-glow"></div>

      <div className="container home-content-z">
        {/* HEADER TÉCNICO: Igual al Admin y Vendedor */}
        <header className="home-welcome-header">
          
          <h1 className="welcome-title-corp">
            HOLA, <span className="text-highlight">{userName.toUpperCase()}</span>
          </h1>
          
        </header>

        {/* MONITOR DE ESTADO: Estilo Quick Stats de TodoPC */}
        
        {/* GRID DE ACCIONES: 2 Columnas para mejor visibilidad técnica */}
        <Grid container spacing={3} className="options-grid-container">
          {actions.map((action, index) => (
            <Grid item xs={12} md={6} key={index}>
              <div className="corporate-option-card" onClick={() => navigate(action.path)}>
                <div className="corp-card-accent"></div>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div className="icon-wrapper-corp">{action.icon}</div>
                  {action.count > 0 && (
                    <Box className="stat-badge-corp">
                      {action.count} PENDIENTES
                    </Box>
                  )}
                </Box>

                <div className="card-info-corp">
                  <h3>{action.title}</h3>
                  <p>{action.desc}</p>
                </div>

                <div className="card-action-arrow">
                  <FaArrowRight />
                </div>
              </div>
            </Grid>
          ))}
        </Grid>
      </div>
    </div>
  );
};

export default HomeTecnico;