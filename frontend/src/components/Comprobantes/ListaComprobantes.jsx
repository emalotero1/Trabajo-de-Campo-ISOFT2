import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Snackbar, Alert, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions 
} from '@mui/material';
import { FiPrinter, FiSearch, FiRefreshCw, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../../components/Layout/Navbar';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import '../../styles/GenerarOrden.css'; 

export default function GestionOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Alertas
  const [alertConfig, setAlertConfig] = useState({ open: false, severity: 'success', msg: '' });

  // Estado para el Modal de Confirmación de Entrega
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ordenAEntregar, setOrdenAEntregar] = useState(null);

  const cargarOrdenes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/ordenes', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.ok || data.status === 'success') {
        setOrdenes(data.ordenes);
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({ open: true, severity: 'error', msg: 'Error al conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const ordenesFiltradas = ordenes.filter(o => {
    const termino = busqueda.toLowerCase();
    const nroMatch = o.nro_orden ? o.nro_orden.toString().includes(termino) : false;
    const clienteName = o.id_equipo?.cliente ? `${o.id_equipo.cliente.name} ${o.id_equipo.cliente.lastname}`.toLowerCase() : '';
    return nroMatch || clienteName.includes(termino);
  });

  // --- LÓGICA DE ENTREGA (RECEPCIONISTA) ---
  const abrirDialogoEntrega = (orden) => {
    setOrdenAEntregar(orden);
    setDialogOpen(true);
  };

  const confirmarEntrega = async () => {
    if (!ordenAEntregar) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ordenes/${ordenAEntregar._id}/trabajo`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ estado: 'ENTREGADO' })
      });
      
      const data = await response.json();
      if (data.ok || data.status === 'success') {
        setAlertConfig({ open: true, severity: 'success', msg: 'Equipo marcado como ENTREGADO exitosamente.' });
        cargarOrdenes(); // Refrescamos la tabla
      } else {
        setAlertConfig({ open: true, severity: 'error', msg: 'No se pudo actualizar el estado.' });
      }
    } catch (error) {
      console.error(error);
      setAlertConfig({ open: true, severity: 'error', msg: 'Error de conexión.' });
    } finally {
      setDialogOpen(false);
      setOrdenAEntregar(null);
    }
  };


  // --- GENERACIÓN DE PDF ---
  const descargarPDF = (orden) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const cliente = orden.id_equipo?.cliente || {};
    const equipo = orden.id_equipo || {};

    doc.setFillColor(13, 15, 17); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(0, 168, 232); 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("TODO PC", 15, 18);
    doc.setFontSize(9);
    doc.setFont("courier", "normal");
    doc.setTextColor(138, 143, 152);
    doc.text("SERVICIO TÉCNICO TODO PC", 15, 24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`COMPROBANTE DE OPERACIÓN`, 120, 16);
    doc.setFontSize(12);
    doc.setTextColor(0, 168, 232);
    doc.text(`ORDEN NRO: #${orden.nro_orden}`, 120, 23);
    doc.setFontSize(9);
    doc.setTextColor(180, 180, 180);
    doc.text(`Fecha: ${orden.fecha_alta ? new Date(orden.fecha_alta).toLocaleDateString('es-AR') : 'N/A'}`, 120, 29);
    doc.setTextColor(40, 40, 40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DATOS DEL CLIENTE", 15, 52);
    
    doc.autoTable({
      startY: 55,
      head: [['Nombre y Apellido', 'DNI / CUIL', 'Teléfono de Contacto', 'Email']],
      body: [[
        `${cliente.name || 'N/A'} ${cliente.lastname || ''}`,
        cliente.cel || 'N/A',
        cliente.email || 'N/A'
      ]],
      theme: 'grid',
      headStyles: { fillColor: [45, 50, 56], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DETALLE DEL EQUIPO REGISTRADO", 15, doc.lastAutoTable.finalY + 12);

    doc.autoTable({
        startY: doc.lastAutoTable.finalY + 15,
        head: [['Componente / CPU', 'Gabinete / Modelo', 'Falla Inicial Reportada']],
        body: [[
        equipo.cpu || 'N/A',
        equipo.gabinete || 'N/A',
        equipo.fallaReportada || 'No especifica' 
        ]],
        theme: 'grid',
        headStyles: { fillColor: [0, 168, 232], textColor: [13, 15, 17] },
        styles: { fontSize: 9 }
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("ESTADO DE RECEPCIÓN", 15, doc.lastAutoTable.finalY + 12);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Estado Actual', 'Observaciones Visuales del Recepcionista']],
      body: [[
        orden.estado,
        orden.observaciones || 'Sin observaciones adicionales registradas.'
      ]],
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    let finalY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("Nota legal: El retiro del hardware se realiza únicamente presentando este comprobante físico o digital.", 15, finalY);
    doc.text("Todo equipo guardado por más de 90 días sin reclamo pasará a disposición del taller técnico.", 15, finalY + 4);

    doc.save(`Comprobante_Orden_${orden.nro_orden}.pdf`);
  };

  return (
    <Box className="orden-wrapper" style={{ paddingTop: '120px' }}>
      <Navbar />
      <div className="orden-glow"></div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        
        {/* ENCABEZADO */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <Box>
            <Typography variant="h4" style={{ fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
              Gestión de Órdenes
            </Typography>
            <Typography style={{ marginTop: '6px', fontFamily: 'JetBrains Mono', fontSize: '0.75rem', color: '#8a8f98', letterSpacing: '1px' }}>
              IMPRESIÓN, AUDITORÍA Y ENTREGA DE EQUIPOS
            </Typography>
          </Box>
        </header>

        {/* TABLA INDUSTRIAL */}
        <div className="orden-panel">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FiRefreshCw className={loading ? "spin-animation" : ""} color="#00a8e8" size={18} onClick={cargarOrdenes} style={{ cursor: 'pointer' }} />
              <Typography style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '1px' }}>
                ÓRDENES EN EL SISTEMA ({ordenesFiltradas.length})
              </Typography>
            </Box>
            <TextField 
              placeholder="Buscar por N° Orden o Cliente..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              className="industrial-input" 
              size="small"
              InputProps={{ startAdornment: <FiSearch style={{ color: '#64748b', marginRight: '8px' }} /> }}
              sx={{ width: '280px' }}
            />
          </header>

          <div className="orden-table-container">
            <table className="orden-table">
              <thead>
                <tr>
                  <th>Nro Orden</th>
                  <th>Fecha Alta</th>
                  <th>Cliente</th>
                  <th>Hardware Seleccionado</th>
                  <th>Estado Actual</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ordenesFiltradas.map((o) => {
                  
                  // Evaluamos si la orden está lista para entregar
                  const listoParaEntregar = o.estado === 'REPARADO' || o.estado === 'PRESUPUESTO RECHAZADO';
                  const yaEntregado = o.estado === 'ENTREGADO';

                  return (
                    <tr key={o._id}>
                      <td style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, color: '#00a8e8' }}>
                          #{o.nro_orden}
                      </td>
                      <td style={{ color: '#8a8f98', fontSize: '0.85rem' }}>
                          {o.fecha_alta ? new Date(o.fecha_alta).toLocaleDateString('es-AR') : 'N/A'}
                      </td>
                      <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>
                          {o.id_equipo?.cliente ? `${o.id_equipo.cliente.name} ${o.id_equipo.cliente.lastname}` : 'Sin dueño'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Email: {o.id_equipo?.cliente?.email || 'N/A'}</div>
                      </td>
                      <td>
                          <div style={{ color: '#ffffff', fontWeight: 600 }}>{o.id_equipo?.cpu || 'N/A'}</div>
                      </td>
                      <td>
                          <span style={{ 
                            padding: '6px 10px', 
                            borderRadius: '4px', 
                            fontSize: '0.75rem', 
                            fontWeight: 700,
                            backgroundColor: yaEntregado ? 'rgba(16, 185, 129, 0.1)' : listoParaEntregar ? 'rgba(245, 158, 11, 0.1)' : 'rgba(0, 168, 232, 0.05)',
                            color: yaEntregado ? '#10b981' : listoParaEntregar ? '#f59e0b' : '#64748b',
                            border: `1px solid ${yaEntregado ? 'rgba(16, 185, 129, 0.2)' : listoParaEntregar ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.05)'}`
                          }}>
                            {o.estado}
                          </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                          <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end', alignItems: 'center' }}>
                            
                            {/* BOTÓN IMPRIMIR (Siempre visible) */}
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<FiPrinter />}
                              onClick={() => descargarPDF(o)}
                              sx={{ 
                                color: '#00a8e8', 
                                borderColor: 'rgba(0, 168, 232, 0.3)', 
                                fontWeight: 700, 
                                '&:hover': { borderColor: '#00a8e8', bgcolor: 'rgba(0, 168, 232, 0.05)' } 
                              }}
                            >
                              IMPRIMIR
                            </Button>

                            {/* BOTÓN ENTREGAR (Solo visible si cumple condiciones) */}
                            {listoParaEntregar && (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<FiCheckCircle />}
                                onClick={() => abrirDialogoEntrega(o)}
                                sx={{ 
                                  bgcolor: '#38bdf8', 
                                  color: '#0b0f19', 
                                  fontWeight: 800, 
                                  '&:hover': { bgcolor: '#0284c7', color: '#fff' } 
                                }}
                              >
                                ENTREGAR
                              </Button>
                            )}

                          </Box>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE ENTREGA */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{ style: { backgroundColor: '#1a1d24', color: '#fff', border: '1px solid #2d3238' } }}
      >
        <DialogTitle sx={{ color: '#38bdf8', fontWeight: 800 }}>Confirmar Entrega de Equipo</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#9ca3af' }}>
            ¿Estás seguro de que deseas registrar la entrega de la orden 
            <strong style={{ color: '#fff' }}> #{ordenAEntregar?.nro_orden}</strong> perteneciente a 
            <strong style={{ color: '#fff' }}> {ordenAEntregar?.id_equipo?.cliente?.name}</strong>?
            <br/><br/>
            Al confirmar, el estado cambiará a <strong>ENTREGADO</strong> y el circuito se cerrará permanentemente.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ color: '#9ca3af', fontWeight: 700 }}>
            CANCELAR
          </Button>
          <Button onClick={confirmarEntrega} variant="contained" sx={{ bgcolor: '#38bdf8', color: '#000', fontWeight: 800, '&:hover': { bgcolor: '#0284c7', color: '#fff' } }}>
            CONFIRMAR ENTREGA
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alertConfig.open} autoHideDuration={4000} onClose={() => setAlertConfig({...alertConfig, open: false})}>
        <Alert severity={alertConfig.severity} sx={{ width: '100%' }}>{alertConfig.msg}</Alert>
      </Snackbar>
    </Box>
  );
}