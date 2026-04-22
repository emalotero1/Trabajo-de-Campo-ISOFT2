import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authProvider';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi';
import { FaLaptopCode } from "react-icons/fa6"; 
import Navbar from '../components/Layout/Navbar'; // Importamos el Navbar
import ErrorAlert from '../components/Alerts/ErrorAlert';
import '../styles/Login.css';

const Login = () => {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ emailOrUser: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [openError, setOpenError] = useState(false);

  useEffect(() => {
    if (user) navigate('/home');
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.emailOrUser, form.password);
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Credenciales inválidas');
      setOpenError(true);
    }
  };

  return (
    <Box className="login-night-wrapper">
      {/* 1. NAVBAR INTEGRADO: Permite volver al inicio haciendo clic en el logo */}
      <Navbar />

      <div className="bg-glow-blue"></div>

      <Box className="glass-login-card-corp">
        {/* LOGO TODO PC */}
        <Box className="login-logo-wrapper-corp">
          <Box className="logo-square-corp">
            <FaLaptopCode size={40} color="#0d0f11" />
          </Box>
          <Typography variant="h4" className="login-brand-name">
            TODO<span className="accent-blue">PC</span>
          </Typography>
          <Typography className="login-subtitle">INGRESO PERSONAL 

          </Typography>
        </Box>

        <form onSubmit={handleSubmit} className="corp-form">
          <div className="custom-input-group-corp">
            <FiUser className="input-icon-corp" />
            <input
              type="text"
              name="emailOrUser"
              placeholder="USUARIO O EMAIL"
              value={form.emailOrUser}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="custom-input-group-corp">
            <FiLock className="input-icon-corp" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="CONTRASEÑA"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
            <button 
              type="button" 
              className="password-toggle-corp"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          <Button 
            type="submit" 
            className="btn-corp-login"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#0d0f11' }} />
            ) : (
              "ACCEDER AL SISTEMA"
            )}
          </Button>

          <Box className="login-footer-info">
           
          </Box>
        </form>
      </Box>

      <ErrorAlert 
        open={openError} 
        onClose={() => setOpenError(false)} 
        message={error} 
      />
    </Box>
  );
};

export default Login;