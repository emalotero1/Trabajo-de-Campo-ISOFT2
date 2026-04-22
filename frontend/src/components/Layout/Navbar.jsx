import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Menu, MenuItem, Avatar, Chip, Button, Divider, IconButton } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/authProvider'; 
import { FiLogOut, FiUser, FiLogIn, FiCpu, FiMonitor, FiMenu, FiTool, FiSettings } from 'react-icons/fi';
import { FaLaptopCode } from "react-icons/fa6";
import '../../styles/Navbar.css';

const Navbar = () => {
  const { user, isAuth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNav, setAnchorElNav] = useState(null);

  const handleLogout = () => {
    setAnchorElUser(null);
    navigate('/', { replace: true });
    setTimeout(() => logout(), 50);
  };

  return (
    <AppBar position="fixed" className={`nav-main-container ${isAuth ? 'nav-admin' : 'nav-public'}`}>
      <Toolbar className="nav-toolbar">
        
        {/* LOGO TODO PC */}
        <Box 
          className="nav-brand" 
          onClick={() => navigate(isAuth ? '/home' : '/')} 
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
        >
          <Box sx={{ 
            backgroundColor: '#00a8e8', 
            borderRadius: '6px', 
            p: 0.5, 
            display: 'flex', 
            alignItems: 'center',
            boxShadow: '0 0 15px rgba(0, 168, 232, 0.3)'
          }}>
            <FaLaptopCode size={24} color="#0d0f11" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
            TODO<span style={{ color: '#00a8e8' }}>PC</span>
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* SECCIÓN DERECHA */}
        <Box className="nav-user-section">
          {isAuth && user ? (
            <>
              <Box 
                className="nav-profile-wrapper-corp" 
                onClick={(e) => setAnchorElUser(e.currentTarget)}
              >
                <Box className="nav-profile-text-container d-none d-md-flex">
                  <Typography className="nav-user-name">
                    {user.name || user.username}
                  </Typography>
                  <Typography className="nav-user-role-label">
                    {user.rol?.toUpperCase()}
                  </Typography>
                </Box>

                <Avatar 
                  className="nav-avatar-glow-corp" 
                  sx={{ 
                    bgcolor: '#1a1d21', 
                    border: '2px solid #00a8e8',
                    width: 38, height: 38,
                    fontSize: '1rem', fontWeight: 800
                  }}
                >
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
              </Box>

              {/* MODAL / MENÚ DE PERFIL */}
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={() => setAnchorElUser(null)}
                PaperProps={{ className: 'nav-dropdown-paper-corp' }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box className="nav-menu-header-corp">
                  <Typography className="menu-header-name">{user.name} {user.lastname}</Typography>
                  <Typography className="menu-header-email">{user.email}</Typography>
                  <Chip 
                    label={user.rol?.toUpperCase()} 
                    size="small" 
                    className={`menu-chip-corp ${user.rol}`} 
                  />
                </Box>
                
                <Divider sx={{ my: 1, borderColor: 'rgba(0,168,232,0.1)' }} />
                
                <MenuItem className="nav-menu-item-corp" onClick={() => { setAnchorElUser(null); navigate('/mis-datos'); }}>
                  <FiUser className="menu-icon-corp" /> PERFIL_USUARIO
                </MenuItem>
                
                <MenuItem className="nav-menu-item-corp" onClick={() => { setAnchorElUser(null); navigate('/configuracion'); }}>
                  <FiSettings className="menu-icon-corp" /> AJUSTES_SISTEMA
                </MenuItem>
                
                <Divider sx={{ my: 1, borderColor: 'rgba(0,168,232,0.1)' }} />
                
                <MenuItem className="nav-menu-item-corp logout-item" onClick={handleLogout}>
                  <FiLogOut className="menu-icon-corp" /> FINALIZAR_SESIÓN
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box className="d-none d-md-flex" sx={{ gap: 2 }}>
              <Button className="btn-login-nav-corp" onClick={() => navigate('/login')} startIcon={<FiLogIn />}>Ingreso </Button>
            </Box>
          )}

          {/* MOBILE */}
          <Box className="d-flex d-md-none">
            <IconButton onClick={(e) => setAnchorElNav(e.currentTarget)} sx={{ color: '#00a8e8' }}>
              <FiMenu size={30} />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;