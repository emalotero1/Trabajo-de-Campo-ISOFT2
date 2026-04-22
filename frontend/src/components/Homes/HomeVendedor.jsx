import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, LinearProgress } from '@mui/material';
import { 
  FaCartPlus, FaBarcode, FaClipboardList, FaChartPie, FaArrowRight, FaBolt 
} from 'react-icons/fa6';
import { useAuth } from '../../../context/authProvider';
import Navbar from '../../components/Layout/Navbar';
import '../../styles/HomeRoles.css'; // Mismo CSS del Administrador

const HomeVendedor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || 'Staff_User';

  // Datos de rendimiento simulados para TodoPC
  const statsVendedor = {
    objetivo: 50,
    vendidosHoy: 32,
    eficiencia: 64
  };

  const actions = [
    { title: "NUEVA VENTA", desc: "Facturación rápida de productos", icon: <FaCartPlus />, path: "/ventas" },
    { title: "ESCANEAR PRODUCTO", desc: "Consulta de stock y precios", icon: <FaBarcode />, path: "/escaner" },
    { title: "ORDENES PENDIENTES", desc: "Gestión de pedidos actuales", icon: <FaClipboardList />, path: "/trabajos" },
    { title: "MIS RENDIMIENTOS", desc: "Estadísticas personales", icon: <FaChartPie />, path: "/mis-reportes" },
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

export default HomeVendedor;