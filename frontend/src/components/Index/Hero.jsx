import React, { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import '../../styles/Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const [currentPhrase, setCurrentPhrase] = useState(0);
  const phrases = ["¿TE LO VAS A PERDER?", "VIVÍ LA EXPERIENCIA", "MÁS QUE UNA FIESTA"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhrase((prev) => (prev + 1) % phrases.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box className="hero-main-container">
      {/* CAPAS DE AMBIENTE (Background) */}
      <div className="hero-noise-overlay"></div>
      <div className="hero-scanner-line"></div>
      <div className="screen-frame"></div>
      
      {/* PARTÍCULAS DE ENERGÍA */}
      <div className="energy-particles">
        {[...Array(5)].map((_, i) => <div key={i} className={`particle p${i}`}></div>)}
      </div>

      {/* CONTENIDO PRINCIPAL: Centrado Absoluto */}
      <Box className="hero-content">
        {/* LOGO COMPACTO CON EFECTOS */}
        <Box className="logo-container">
          <div className="logo-glow-core"></div>
          <img 
            src="/img/mangocompleto.png" 
            alt="Logo Mango" 
            className="hero-logo-main" 
          />
          <div className="logo-scan-fx"></div>
        </Box>

        {/* TEXTO DINÁMICO CON ALTURA CONTROLADA */}
        <Box className="text-wrapper">
          <Typography key={currentPhrase} className="hero-subtitle-modern">
            {phrases[currentPhrase]}
          </Typography>
        </Box>

        {/* BOTÓN DE ACCIÓN */}
        <Button className="btn-mango-main" onClick={() => navigate('/login')}>
          <span className="btn-label">OBTENER ENTRADAS</span>
          <span className="btn-glitch-text">MNG-TKT-2026</span>
        </Button>
      </Box>

      {/* TAGS DE ESQUINA (Opcional, estilo Cyberpunk) */}
      <div className="corner-tag top-l">SYS_ACTIVE</div>
      <div className="corner-tag bottom-r">V_0.3.1</div>
    </Box>
  );
};

export default Hero;