import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/SplashScreen';
import MainLayout from './components/Layout/MainLayout';
import HomeScreen from './pages/Home/HomeScreen';
import CommunityScreen from './pages/Community/CommunityScreen';
import PostDetailScreen from './pages/Community/PostDetailScreen';
import CalculatorScreen from './pages/Calculator/CalculatorScreen';
import MenuScreen from './pages/Menu/MenuScreen';
import AIChatScreen from './pages/AIChat/AIChatScreen';
import LoginScreen from './pages/Auth/LoginScreen';
import NoticeScreen from './pages/Menu/NoticeScreen';
import InquiryCategoryScreen from './pages/Menu/InquiryCategoryScreen';
import InquiryFormScreen from './pages/Menu/InquiryFormScreen';
import RecordScreen from './pages/Record/RecordScreen';
import CommunityWriteScreen from './pages/Community/CommunityWriteScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        
        {/* Routes wrapped with MainLayout and BottomNavBar */}
        <Route path="/home" element={<MainLayout><HomeScreen /></MainLayout>} />
        <Route path="/community" element={<MainLayout><CommunityScreen /></MainLayout>} />
        <Route path="/community/:id" element={<MainLayout><PostDetailScreen /></MainLayout>} />
        <Route path="/community/write" element={<MainLayout><CommunityWriteScreen /></MainLayout>} />
        <Route path="/calculator" element={<MainLayout><CalculatorScreen /></MainLayout>} />
        <Route path="/record" element={<MainLayout><RecordScreen /></MainLayout>} />
        <Route path="/menu" element={<MainLayout><MenuScreen /></MainLayout>} />
        <Route path="/chat" element={<MainLayout><AIChatScreen /></MainLayout>} />
        
        {/* New Revamped Menu routes */}
        <Route path="/notice" element={<MainLayout><NoticeScreen /></MainLayout>} />
        <Route path="/inquiry" element={<MainLayout><InquiryCategoryScreen /></MainLayout>} />
        <Route path="/inquiry/form" element={<MainLayout><InquiryFormScreen /></MainLayout>} />
      </Routes>
    </Router>
  );
}

export default App;


