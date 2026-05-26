import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import MainLayout from './components/Layout/MainLayout';
import HomeScreen from './pages/Home/HomeScreen';
import CommunityScreen from './pages/Community/CommunityScreen';
import PostDetailScreen from './pages/Community/PostDetailScreen';
import CalculatorScreen from './pages/Calculator/CalculatorScreen';
import MenuScreen from './pages/Menu/MenuScreen';

// Placeholder for RecordScreen
const RecordScreen = () => <div className="p-4"><h2 className="text-2xl font-bold mb-4">기록 (준비 중)</h2></div>;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        
        {/* Routes wrapped with MainLayout and BottomNavBar */}
        <Route path="/home" element={<MainLayout><HomeScreen /></MainLayout>} />
        <Route path="/community" element={<MainLayout><CommunityScreen /></MainLayout>} />
        <Route path="/community/:id" element={<MainLayout><PostDetailScreen /></MainLayout>} />
        <Route path="/calculator" element={<MainLayout><CalculatorScreen /></MainLayout>} />
        <Route path="/record" element={<MainLayout><RecordScreen /></MainLayout>} />
        <Route path="/menu" element={<MainLayout><MenuScreen /></MainLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
