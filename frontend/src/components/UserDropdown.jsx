// src/components/UserDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Avatar, Button, Divider, Box } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import '../styles/UserDropdown.css';

const UserDropdown = ({ user, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDropdown = () => setOpen(!open);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMisDatos = () => {
    navigate('/mis-datos');
    setOpen(false);
  };

  return (
    <div className="user-container">
      <div className="user-toggle" onClick={toggleDropdown}>
        <AccountCircleIcon fontSize="large" />
      </div>

      {open && (
        <div className="user-dropdown" ref={dropdownRef}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ bgcolor: '#555', width: 64, height: 64, mb: 1 }}>
              <PersonIcon fontSize="large" />
            </Avatar>
          </Box>
          <div className="user-name">{user.name} {user.lastname}</div>
          <div className="user-username">{user.username}</div>
          <div className="user-rol">{user.rol}</div>      
          <Divider className="divider" />

          <Button
            variant="outlined"
            startIcon={<InfoIcon />}
            onClick={handleMisDatos}
            fullWidth
            sx={{
              borderColor: 'black',
              color: 'black',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: '#e0e0e0',
                borderColor: 'black',
                color: 'black',
              },
              '& .MuiButton-startIcon > *:nth-of-type(1)': {
                color: 'black',
              },
            }}
          >
            Mis Datos
          </Button>

          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
            sx={{
              mt: 1,
              borderColor: 'black',
              color: 'black',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: '#ffcdd2',
                borderColor: 'black',
                color: 'black',
              },
              '& .MuiButton-startIcon > *:nth-of-type(1)': {
                color: 'black',
              },
            }}
          >
            Cerrar Sesión
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
