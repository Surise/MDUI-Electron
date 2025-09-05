import React, { useState, useEffect } from 'react';
import './App.css';
import 'mdui/components/icon.js';
import 'mdui/components/layout.js';
import 'mdui/components/layout-item.js';
import 'mdui/components/layout-main.js';
import 'mdui/components/fab.js';

import HomePage from './components/HomePage';
import ConnectPage from './components/ConnectPage';
import SettingsPage from './components/SettingsPage';
import ProfilePage from './components/ProfilePage';
import TopBar from './components/TopBar';
import NavigationRail from './components/NavigationRail';
import LoginPage from './components/LoginPage';
import { ServerCacheProvider } from './components/ServerCacheContext';
import { UserProvider } from './components/UserContext';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [serverPort, setServerPort] = useState(null); // 添加服务器端口状态

  // 检查是否已经登录
  useEffect(() => {
    // 移除自动登录检查，总是显示登录页面
    // const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    // setIsLoggedIn(loggedIn);
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActivePage('home');
    localStorage.removeItem('isLoggedIn');
  };

  const handlePageChange = (page) => {
    setActivePage(page);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleLabels = () => {
    setShowLabels(!showLabels);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage serverPort={serverPort} />;
      case 'connect':
        return <ConnectPage serverPort={serverPort} />;
      case 'settings':
        return <SettingsPage serverPort={serverPort} />;
      case 'profile':
        return <ProfilePage serverPort={serverPort} />;
      default:
        return <HomePage serverPort={serverPort} />;
    }
  };

  // 如果未登录，显示登录页面
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} setServerPort={setServerPort} />;
  }

  return (
    <UserProvider>
      <ServerCacheProvider>
        <div className="app-container">
          <mdui-layout style={{ height: '100%' }}>
            {/* 顶部应用栏 */}
            <mdui-layout-item>
              <TopBar onLogout={handleLogout} />
            </mdui-layout-item>
            
            {/* 导航栏 */}
            {isDrawerOpen && (
              <mdui-layout-item placement="left" style={{ width: 'auto', height: '100%' }} className="scrollable-hidden">
                <NavigationRail 
                  key={showLabels ? 'labels-shown' : 'labels-hidden'}
                  activePage={activePage} 
                  onPageChange={handlePageChange} 
                  showLabels={showLabels}
                  onToggleLabels={toggleLabels}
                />
              </mdui-layout-item>
            )}
            
            {/* 主要内容区域 */}
            <mdui-layout-main style={{ overflow: 'hidden', height: '100%' }}>
              <div style={{ height: '100%' }}>
                {renderPage()}
              </div>
            </mdui-layout-main>
          </mdui-layout>
        </div>
      </ServerCacheProvider>
    </UserProvider>
  );
}

export default App;