import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserPlus, FaEdit, FaTrashAlt, FaSearch, FaEnvelope, FaMapMarkerAlt
} from 'react-icons/fa';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { 
  Typography, IconButton, Button, TextField, 
  InputAdornment, CircularProgress, Box, Fade 
} from '@mui/material';

import Navbar from '../../components/Layout/Navbar';
import ClientFormModal from './ClientFormModal';
import { useClients } from '../../hooks/useCliente'; 
import { useAuth } from '../../../context/authProvider';


const ClientManagement = () => {
  const navigate = useNavigate();
  const { clients, getClients, deleteClient, loading, error, setError } = useClients();
  
  const { user, token } = useAuth();
  const authToken = token || user?.token || localStorage.getItem('token');
  
  const isRecepcionista = user?.rol?.toLowerCase()?.trim() === 'recepcionista';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (authToken) {
      getClients(authToken);
    }
  }, [authToken, getClients]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        if (setError) setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error, setError]);

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
        setSuccess('CLIENTE DESACTIVADO CON ÉXITO');
        getClients(authToken);
      } catch (err) {
        const msg = err.response?.data?.message || 'NO SE PUDO ELIMINAR EL CLIENTE';
        if (setError) setError(msg);
      }
    }
  };

  const handleOpenCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  const handleModalSave = async () => {
    handleCloseModal();
    getClients(authToken);
  };

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


  return (
    <Box className="corp-wrapper" style={{ paddingTop: '140px' }}>
      <Navbar />
      <div className="corporate-glow"></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }} className="home-content-z">
        
        {/* CABECERA PRINCIPAL */}
        <header className="corp-header" style={{ paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <Box>
            <h1 className="corp-title" style={{ margin: 0 }}>GESTIÓN DE CLIENTES</h1>
          </Box>
          {isRecepcionista && (
            <Button
              className="btn-corp-submit"
              onClick={handleOpenCreate}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              <FaUserPlus /> <span style={{ fontWeight: 700 }}>NUEVO CLIENTE</span>
            </Button>
          )}
        </header>

        {/* ÁREA DE FEEDBACK ALERTAS */}
        <Box sx={{ mb: 1, minHeight: success || error ? '50px' : '0px' }}>
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

        {/* BARRA DE BÚSQUEDA */}
        <Box sx={{ mb: 2 }}>
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
        </Box>

        {/* TABLA PRINCIPAL RESPONSIVE */}
        <Box className="corp-panel" sx={{ p: { xs: 1.5, sm: 2.5 }, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
              <CircularProgress sx={{ color: '#00a8e8' }} />
            </Box>
          ) : (
            <Fade in={!loading}>
              <Box className="corp-table-container" sx={{ width: '100%', overflowX: 'auto' }}>
                <table className="corp-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '1rem' }}>NOMBRE Y APELLIDO</th>
                      <th style={{ padding: '1rem' }}>CONTACTO</th>
                      <th style={{ padding: '1rem' }}>DOMICILIO</th>
                      {isRecepcionista && <th style={{ padding: '1rem', textAlign: 'right' }}>ACCIONES</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.length > 0 ? (
                      filteredClients.map((client) => (
                        <tr key={client._id}>
                          <td style={{ padding: '1.2rem 1rem' }}>
                            <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.95rem' }}>
                              {client.name?.toUpperCase()} {client.lastname?.toUpperCase()}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontFamily: 'JetBrains Mono', letterSpacing: '1px' }}>
                              CID_{client._id?.slice(-6).toUpperCase()}
                            </div>
                          </td>
                          <td style={{ padding: '1.2rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                              <FaEnvelope style={{ color: '#64748b' }} /> {client.email}
                            </div>
                            <div className="corp-status-badge active" style={{ marginTop: '8px', fontSize: '0.75rem', padding: '3px 8px' }}>
                              {client.cel || '---'}
                            </div>
                          </td>
                          <td style={{ padding: '1.2rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                              <FaMapMarkerAlt style={{ color: '#64748b' }} /> {client.domicilio?.toUpperCase()}
                            </div>
                          </td>
                          {isRecepcionista && (
                            <td style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                <IconButton sx={{ color: '#ffffff', '&:hover': { color: '#f59e0b' } }} onClick={() => handleEdit(client)}>
                                  <FaEdit size={16} />
                                </IconButton>
                                <IconButton sx={{ color: '#ef4444', '&:hover': { color: '#ff6b6b' } }} onClick={() => handleDelete(client._id)}>
                                  <FaTrashAlt size={14} />
                                </IconButton>
                              </Box>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isRecepcionista ? 4 : 3} style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>
                          NO SE ENCONTRARON CLIENTES
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Box>
            </Fade>
          )}
        </Box>
        <ClientFormModal 
          open={isModalOpen} 
          onClose={handleCloseModal}
          clientToEdit={selectedClient}
          onSave={handleModalSave} 
        />
      </div>

    </Box>
  );
};

export default ClientManagement;