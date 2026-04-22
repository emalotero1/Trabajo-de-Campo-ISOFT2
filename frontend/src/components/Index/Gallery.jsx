import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import '../../styles/Index.css';


const albums = [
  { title: 'Opening 2026', link: 'https://drive.google.com/...' },
  { title: 'Summer Night', link: 'https://drive.google.com/...' },
  { title: 'Techno Stage', link: 'https://drive.google.com/...' },
];

const Gallery = () => (
  <Box className="section-container gallery-bg" id="fotos">
    <Grid container spacing={4} justifyContent="center" className="gallery-grid">
      {albums.map((album, idx) => (
        <Grid item xs={12} sm={4} key={idx}>
          <Box 
            className="gallery-card outlined-photo-card" 
            onClick={() => window.open(album.link, '_blank')}
          >
            <Box className="scan-line" />
            <Box className="icon-container-photo">
              <PhotoLibraryOutlinedIcon 
                sx={{ 
                  fontSize: 50, 
                  color: 'transparent', 
                  stroke: '#FF6B00', 
                  strokeWidth: 1.2,
                  filter: 'drop-shadow(0 0 5px rgba(255, 107, 0, 0.3))',
                }} 
                className="photo-icon-neon"
              />
            </Box>
            <Typography variant="h6" className="album-title">{album.title}</Typography>
            <Typography variant="caption" className="album-link">
              VER RECUERDOS ↗
            </Typography>
            <Box className="corner-accent" />
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Gallery;