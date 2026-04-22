import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, FaEdit, FaTrashAlt, FaArrowLeft, FaSearch, FaFilter, FaEnvelope 
} from 'react-icons/fa';
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
  const { users, getUsers, deleteUser, loading } = useUsers();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("todos");

  useEffect(() => {
    getUsers();
  }, []);

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
    if (window.confirm("¿ESTÁ SEGURO DE ELIMINAR ESTE ACCESO? ESTA ACCIÓN ES IRREVERSIBLE.")) {
      try {
        await deleteUser(id);
        getUsers(); 
      } catch (err) {
        console.error("Error:", err);
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
            <MenuItem value="vendedor">VENDEDORES</MenuItem>
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
                            <IconButton className="btn-staff-edit" onClick={() => handleEdit(staff)}>
                              <FaEdit />
                            </IconButton>
                            <IconButton className="btn-staff-delete" onClick={() => handleDelete(staff._id)}>
                              <FaTrashAlt />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data-msg-corp">
                        NO_RECORDS_FOUND // SIN RESULTADOS EN LA BASE DE DATOS
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