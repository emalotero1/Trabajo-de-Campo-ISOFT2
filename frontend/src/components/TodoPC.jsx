import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Container } from '@mui/material';
import { FiMonitor, FiTool, FiCpu, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { FaLaptopCode } from "react-icons/fa6";
import Navbar from '../components/Layout/Navbar'; // El Navbar que ya corregimos
import '../styles/PublicHome.css';

const TodoPc = () => {
  const navigate = useNavigate();

  const services = [
    { icon: <FiMonitor />, title: "VENTA DE EQUIPOS", desc: "Laptops, Desktops y Periféricos de última generación." },
    { icon: <FiTool />, title: "SERVICIO TÉCNICO", desc: "Reparación especializada, limpieza y mantenimiento preventivo." },
    { icon: <FiCpu />, title: "ARMADO DE PC", desc: "Configuraciones a medida para Gaming, Diseño y Oficina." }
  ];

  return (
    <div className="public-wrapper">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <Container maxWidth="lg" className="hero-content">
          <Box className="brand-intro">
            <Box className="hero-logo-box">
              <FaLaptopCode size={50} color="#0d0f11" />
            </Box>
            <Typography variant="h1" className="hero-title">
              TODO<span className="blue-text">PC</span>
            </Typography>
            <Typography variant="h2" className="hero-slogan">
              POTENCIANDO TU MUNDO DIGITAL
            </Typography>
            <Typography className="hero-description">
              Bienvenido al sistema de gestion de TodoPC
            </Typography>
            
            
          </Box>
        </Container>
      </section>

      
    </div>
  );
};

export default TodoPc;