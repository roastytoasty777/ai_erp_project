import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WelcomePage from './pages/WelcomePage';
import SalesPage from './pages/SalesPage';
import StockPage from './pages/StockPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="dashboard-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/stock" element={<StockPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;