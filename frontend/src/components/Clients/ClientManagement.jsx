import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, FaEdit, FaTrashAlt, FaSearch, FaEnvelope, FaMapMarkerAlt
} from 'react-icons/fa';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { 
  Typography, IconButton, TextField, 
  InputAdornment, CircularProgress, Box, Fade 
} from '@mui/material';

import Navbar from '../../components/Layout/Navbar';
import ClientFormModal from './ClientFormModal';
import { useClients } from '../../hooks/useClients'; 
import { useAuth } from '../../../context/authProvider';

import '../../styles/HomeRoles.css'; 
import '../../styles/Staff.css'; 

const ClientManagement = () => {
  const navigate = useNavigate();
  const { clients, getClients, deleteClient, loading, error, setError } = useClients();
  
  // SOLUCIÓN DEFINITIVA: Token desde el contexto o el almacenamiento local
  const { user, token } = useAuth();
  const authToken = token || user?.token || localStorage.getItem('token');
  
  // CORRECCIÓN: Ahora validamos que el usuario sea exclusivamente "recepcionista"
  const isRecepcionista = user?.rol?.toLowerCase()?.trim() === 'recepcionista';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState(null);

  // PASAMOS EL TOKEN AL CARGAR LOS DATOS
  useEffect(() => {
    if (authToken) {
      getClients(authToken);
    }
  }, [authToken, getClients]);

  // Limpiar mensajes después de unos segundos
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        if (setError) setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, setError]);

  // Filtro
  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client => {
      const fullName = `${client.name} ${client.lastname}`.toLowerCase();
      const term = searchTerm.toLowerCase();
      return (
        fullName.includes(term) || 
        (client.email && client.email.toLowerCase().includes(term)) ||
        (client.domicilio && client.domicilio.toLowerCase().includes(term))
      );
    });
  }, [searchTerm, clients]);

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (setError) setError(null);
    setSuccess(null);
    
    if (window.confirm("¿ESTÁ SEGURO DE DESACTIVAR A ESTE CLIENTE?")) {
        try {
            await deleteClient(id, authToken);
            setSuccess('CLIENTE_DESACTIVADO_CON_ÉXITO');
            getClients(authToken); // Recargar la lista
        } catch (err) {
            const msg = err.response?.data?.message || 'ERROR_AL_ELIMINAR_CLIENTE';
            if (setError) setError(msg);
        }
    }
  };

  const handleOpenCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  return (
    <div className="home-dashboard-wrapper corporate-dark staff-container">
      <Navbar />
      <div className="corporate-glow"></div>

      <div className="container home-content-z">
        <div className="home-welcome-header">
          <div className="welcome-text-box">
            <h1 className="welcome-title-corp">PORTAFOLIO DE CLIENTES</h1>
            <span style={{ color: '#00a8e8', fontSize: '0.8rem', letterSpacing: '1px' }}>
              OPERADOR ACTIVO: {user?.username?.toUpperCase() || 'SISTEMA'}
            </span>
          </div>
          <button className="btn-corp-add" onClick={handleOpenCreate}>
              <FaUserPlus /> <span>NUEVO_CLIENTE</span>
          </button>
        </div>

        {/* ÁREA DE FEEDBACK */}
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
            placeholder="BUSCAR POR NOMBRE, EMAIL O DOMICILIO..."
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
                    <th>CONTACTO</th>
                    <th>DOMICILIO</th>
                    <th style={{ textAlign: 'right' }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <tr key={client._id} className="staff-row-corp">
                        <td>
                          <div className="staff-name-cell-corp">
                            {client.name?.toUpperCase()} {client.lastname?.toUpperCase()}
                          </div>
                          <div className="staff-id-tag-corp">CID_{client._id?.slice(-6).toUpperCase()}</div>
                        </td>
                        <td>
                          <div className="staff-email-sub-corp"><FaEnvelope /> {client.email}</div>
                          <div className="staff-phone-tag-corp" style={{ display: 'inline-block', marginTop: '4px' }}>
                            {client.cel || '---'}
                          </div>
                        </td>
                        <td>
                          <div className="staff-email-sub-corp">
                            <FaMapMarkerAlt style={{ color: '#8a8f98' }}/> {client.domicilio?.toUpperCase()}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="staff-actions-corp">
                            <IconButton className="btn-staff-edit" sx={{ color: '#fff' }} onClick={() => handleEdit(client)}>
                              <FaEdit />
                            </IconButton>
                            
                            {/* SOLO EL RECEPCIONISTA PUEDE ELIMINAR */}
                            {isRecepcionista && (
                              <IconButton className="btn-staff-delete" sx={{ color: '#00a8e8' }} onClick={() => handleDelete(client._id)}>
                                <FaTrashAlt />
                              </IconButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="no-data-msg-corp">
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

      <ClientFormModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        clientToEdit={selectedClient}
        onSave={() => getClients(authToken)} 
      />
    </div>
  );
};

export default ClientManagement;