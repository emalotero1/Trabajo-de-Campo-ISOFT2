import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, FaEdit, FaTrashAlt, FaSearch, FaFilter, FaEnvelope 
} from 'react-icons/fa';
// Importamos los mismos iconos que usas en el Modal para mantener la estética
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { 
  Typography, IconButton, TextField, MenuItem, 
  InputAdornment, CircularProgress, Box, Fade 
} from '@mui/material';

import Navbar from '../../components/Layout/Navbar';
import StaffFormModal from './StaffFormModal';
import { useUsers } from '../../hooks/Users/useUsers';

import '../../styles/HomeRoles.css'; 
import '../../styles/Staff.css';

const StaffManagement = () => {
  const navigate = useNavigate();
  // Extraemos también error y setError del hook para sincronizar con el backend
  const { users, getUsers, deleteUser, loading, error, setError } = useUsers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("todos");
  
  // Estado local para mensajes de éxito (igual que en el modal)
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    getUsers();
  }, []);

  // Limpiar mensajes después de unos segundos (opcional, mejora la UX)
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        if (setError) setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, setError]);

  const filteredStaff = useMemo(() => {
    if (!users) return [];
    return users.filter(staff => {
      const fullName = `${staff.name} ${staff.lastname}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) || 
        staff.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRole = filterRole === "todos" || staff.rol === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, filterRole, users]);

  const handleEdit = (staff) => {
    setSelectedStaff(staff);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    // 1. Limpiar estados previos
    if (setError) setError(null);
    setSuccess(null);
    
    // 2. Confirmación simple (puedes usar el confirm nativo para no instalar librerías extra)
    if (window.confirm("¿ESTÁ SEGURO DE DESACTIVAR ESTE ACCESO?")) {
        try {
            await deleteUser(id);
            setSuccess('USUARIO_DESACTIVADO_CON_ÉXITO');
            getUsers(); // Recargar la lista
        } catch (err) {
            // El error ya se setea automáticamente si el hook useUsers maneja el setError
            // Pero lo aseguramos aquí por si acaso:
            const msg = err.response?.data?.message || 'ERROR_AL_ELIMINAR, NO PUEDES ELIMINARTE A TI MISMO';
            if (setError) setError(msg);
        }
    }
  };

  const handleOpenCreate = () => {
    setSelectedStaff(null);
    setIsModalOpen(true);
  };

  return (
    <div className="home-dashboard-wrapper corporate-dark staff-container">
      <Navbar />
      <div className="corporate-glow"></div>

      <div className="container home-content-z">
        <div className="home-welcome-header">
          <div className="welcome-text-box">
            <h1 className="welcome-title-corp">GESTIÓN DE PERSONAL</h1>
          </div>
          <button className="btn-corp-add" onClick={handleOpenCreate}>
              <FaUserPlus /> <span>NUEVO_USUARIO</span>
          </button>
        </div>

        {/* --- NUEVA ÁREA DE FEEDBACK (IGUAL AL MODAL) --- */}
        <Box className="feedback-container-management" sx={{ mb: 2, minHeight: '50px' }}>
            {success && (
                <Fade in={!!success}>
                    <Box className="feedback-success-corp">
                        <FiCheckCircle /> {success}
                    </Box>
                </Fade>
            )}
            {error && (
                <Fade in={!!error}>
                    <Box className="feedback-error-corp">
                        <FiAlertTriangle /> ERROR: {error.toUpperCase()}
                    </Box>
                </Fade>
            )}
        </Box>

        <div className="staff-filter-bar-corp">
          <TextField
            placeholder="BUSCAR POR NOMBRE, EMAIL O USUARIO..."
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="industrial-input-corp"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch style={{ color: '#00a8e8' }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="industrial-input-corp select-corp"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaFilter style={{ color: '#8a8f98', fontSize: '12px' }} />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="todos">TODOS LOS ROLES</MenuItem>
            <MenuItem value="administrador">ADMINISTRADORES</MenuItem>
            <MenuItem value="recepcionista">RECEPCIONISTAS</MenuItem>
            <MenuItem value="tecnico">TÉCNICOS</MenuItem>
          </TextField>
        </div>

        <div className="staff-table-wrapper-corp mb-5">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
              <CircularProgress sx={{ color: '#00a8e8' }} />
            </Box>
          ) : (
            <Fade in={!loading}>
              <table className="staff-table-corp">
                <thead>
                  <tr>
                    <th>NOMBRE Y APELLIDO</th>
                    <th>USUARIO / CONTACTO</th>
                    <th>CELULAR</th>
                    <th>TIPO</th>
                    <th style={{ textAlign: 'right' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length > 0 ? (
                    filteredStaff.map((staff) => (
                      <tr key={staff._id} className="staff-row-corp">
                        <td>
                          <div className="staff-name-cell-corp">
                            {staff.name?.toUpperCase()} {staff.lastname?.toUpperCase()}
                          </div>
                          <div className="staff-id-tag-corp">UID_{staff._id?.slice(-6).toUpperCase()}</div>
                        </td>
                        <td>
                          <div className="staff-user-tag-corp">@{staff.username}</div>
                          <div className="staff-email-sub-corp"><FaEnvelope /> {staff.email}</div>
                        </td>
                        <td><span className="staff-phone-tag-corp">{staff.cel || '---'}</span></td>
                        <td>
                          <span className={`role-badge-corp ${staff.rol?.toLowerCase()}`}>
                            {staff.rol?.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="staff-actions-corp">
                            <IconButton className="btn-staff-edit" sx={{ color: '#fff' }} onClick={() => handleEdit(staff)}>
                              <FaEdit />
                            </IconButton>
                            <IconButton className="btn-staff-delete" sx={{ color: '#00a8e8' }} onClick={() => handleDelete(staff._id)}>
                              <FaTrashAlt />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data-msg-corp">
                        NO_RECORDS_FOUND
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Fade>
          )}
        </div>
      </div>

      <StaffFormModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        staffToEdit={selectedStaff}
        onSave={() => getUsers()} 
      />
    </div>
  );
};

export default StaffManagement;