import React, { useState } from 'react';
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

function App() {
  const [activePage, setActivePage] = useState('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

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
        return <HomePage />;
      case 'connect':
        return <ConnectPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="app-container">
      <mdui-layout style={{ height: '100%' }}>
        {/* 顶部应用栏 */}
        <mdui-layout-item>
          <TopBar />
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
          
          {/* FAB 按钮 */}
          {activePage === 'home' && (
            <mdui-fab 
              icon="start" 
              style={{ position: 'fixed', right: '24px', bottom: '24px' }}>
            </mdui-fab>
          )}
        </mdui-layout-main>
      </mdui-layout>
    </div>
  );
}

export default App;