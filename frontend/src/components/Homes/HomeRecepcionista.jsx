import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, LinearProgress } from '@mui/material';
import { 
  FaUsers, FaFilePdf, FaComputer, FaArrowRight, FaBolt, FaBarsProgress 
} from 'react-icons/fa6';
import { useAuth } from '../../../context/authProvider';
import Navbar from '../Layout/Navbar';
import '../../styles/HomeRoles.css'; // Mismo CSS del Administrador

const HomeRecepcionista = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || 'Staff_User';


  const actions = [
    { title: "GESTIÓN DE CLIENTES", desc: "Registro de nuevos clientes", icon: <FaUsers />, path: "/ventas" },
    { title: "CONSULTAR ESTADO EQUIPOS", desc: "Ver estado de los equipos", icon: <FaBarsProgress />, path: "/escaner" },
    { title: "COMPROBANTE DE REGISTRO", desc: "Emitir comprobante de registro del equipo", icon: <FaFilePdf />, path: "/trabajos" },
    { title: "REGISTRAR EQUIPOS", desc: "Registro de nuevos equipos", icon: <FaComputer />, path: "/mis-reportes" },
  ];

  return (
    <div className="home-dashboard-wrapper corporate-dark">
      <Navbar /> 
      <div className="corporate-glow"></div>
      
      <div className="container home-content-z">
        
        {/* HEADER BIENVENIDA */}
        <header className="home-welcome-header">
         
          <h1 className="welcome-title-corp">
            HOLA, <span className="text-highlight">{userName.toUpperCase()}</span>
          </h1>
        </header>

        
        {/* GRID DE ACCIONES (2x2 para Vendedor) */}
        <Grid container spacing={3}>
          {actions.map((action, index) => (
            <Grid item xs={12} md={6} key={index}>
              <div className="corporate-option-card" onClick={() => navigate(action.path)}>
                <div className="corp-card-accent"></div>
                <div className="icon-wrapper-corp">{action.icon}</div>
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

export default HomeRecepcionista;