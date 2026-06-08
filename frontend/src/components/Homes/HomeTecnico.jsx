// src/components/Homes/HomeTecnico.jsx (o tu ruta actual)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid } from '@mui/material';
import { 
  FaReceipt, FaMicrochip, FaFilePen, FaClock, FaArrowRight, FaTemperatureHigh 
} from 'react-icons/fa6';
import { useAuth } from '../../../context/authProvider';
import Navbar from '../../components/Layout/Navbar';
import '../../styles/HomeRoles.css'; 

// Importamos el servicio para traer las órdenes desde la BD
import { obtenerOrdenesPendientes } from '../../Services/ordenServicio';

const HomeTecnico = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userName = user?.name || user?.username || 'Tech_User';

  // 1. inicializamos los datos en 0
  const [cantOrdenes, setcantOrdenes] = useState({
    pendientes: 0,
    enProceso: 0
  });

  // 2. CONSUMO DE API: Cargar órdenes y agruparlas matemáticamente por estado
  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await obtenerOrdenesPendientes();
        
        if (data.status === "success" || data.ok) {
          const ordenes = data.ordenes || [];
          
          // Filtramos la cantidad de equipos que esperan ser revisados
          const esperandoRevision = ordenes.filter(
            o => o.estado === 'PENDIENTE DE REVISION'
          ).length;

          // Filtramos la cantidad de equipos que ya están en la mesa de trabajo activa
          const enMesaDeTrabajo = ordenes.filter(
            o => ['ASIGNADO', 'DIAGNOSTICADO', 'PRESUPUESTADO', 'PRESUPUESTO ACEPTADO'].includes(o.estado)
          ).length;

          // Actualizamos el estado para que React vuelva a renderizar los números
          setcantOrdenes({
            pendientes: esperandoRevision,
            enProceso: enMesaDeTrabajo
          });
        }
      } catch (error) {
        console.error("❌ ERROR AL CARGAR LAS ORDENES:", error);
      }
    };

    cargarEstadisticas();
  }, []);

  // 3. Tus acciones ahora se alimentan automáticamente del estado "labStats"
  const actions = [
    { 
      title: "TRABAJOS PENDIENTES", 
      desc: "Equipos en proceso de reparación.", 
      icon: <FaClock />, 
      path: "/trabajospendientes",
      count: cantOrdenes.pendientes 
    },
    { 
      title: "GESTION DE TRABAJOS", 
      desc: "Realizar diagnosticos y asignar presupuestos.", 
      icon: <FaReceipt />, 
      path: "/mesatrabajo",
      count: cantOrdenes.enProceso  
    },   
  ];

  return (
    <div className="home-dashboard-wrapper corporate-dark">
      <Navbar />
      <div className="corporate-glow"></div>

      <div className="container home-content-z">
        {/* HEADER TÉCNICO */}
        <header className="home-welcome-header">
          <h1 className="welcome-title-corp">
            HOLA, <span className="text-highlight">{userName.toUpperCase()}</span>
          </h1>
        </header>
        
        {/* GRID DE ACCIONES: 2 Columnas para mejor visibilidad técnica */}
        <Grid container spacing={3} className="options-grid-container">
          {actions.map((action, index) => (
            <Grid item xs={12} md={6} key={index}>
              <div className="corporate-option-card" onClick={() => navigate(action.path)}>
                <div className="corp-card-accent"></div>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div className="icon-wrapper-corp">{action.icon}</div>
                  
                  {/* Se renderiza dinámicamente si el conteo es mayor o igual a 0 */}
                  {action.count !== undefined && (
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