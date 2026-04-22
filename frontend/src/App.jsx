import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/authProvider';
import AppRoutes from './routes/AppRoutes'; // Importamos tu archivo de rutas


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}


export default App;