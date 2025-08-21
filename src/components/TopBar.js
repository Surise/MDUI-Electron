import React, { useState, useEffect } from 'react';
import 'mdui/components/top-app-bar.js';
import 'mdui/components/top-app-bar-title.js';
import 'mdui/components/button-icon.js';

const TopBar = ({ onLogout }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.body.setAttribute('class', savedTheme === 'dark' ? 'mdui-theme-dark' : '');
    } else {
      document.body.setAttribute('class', 'mdui-theme-dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.body.setAttribute('class', newTheme ? 'mdui-theme-dark' : '');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const minimizeWindow = () => {
    window.electron.ipcRenderer.send('minimize-window');
  };

  const maximizeWindow = () => {
    window.electron.ipcRenderer.send('maximize-window');
  };

  const closeWindow = () => {
    window.electron.ipcRenderer.send('close-window');
  };

  return (
    <mdui-top-app-bar style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, WebkitAppRegion: 'drag', height: '64px', display: 'flex', alignItems: 'center' }}>
      <mdui-button-icon icon="blur_on"></mdui-button-icon>
      <mdui-top-app-bar-title>Anre</mdui-top-app-bar-title> 
      <div style={{ flex: '1' }}></div>
      {/* 主题切换按钮 */}
      <mdui-button-icon 
        icon={isDarkMode ? "light_mode" : "dark_mode"} 
        onClick={toggleTheme}
        style={{ WebkitAppRegion: 'no-drag' }}
        ></mdui-button-icon>
      {/* 退出登录按钮 */}
      <mdui-button-icon 
        icon="exit_to_app" 
        onClick={onLogout}
        style={{ WebkitAppRegion: 'no-drag' }}
        ></mdui-button-icon>
      {/* 窗口控制按钮 */}
      <mdui-button-icon icon="remove" onClick={minimizeWindow} style={{ WebkitAppRegion: 'no-drag' }}></mdui-button-icon>
      <mdui-button-icon icon="crop_square" onClick={maximizeWindow} style={{ WebkitAppRegion: 'no-drag' }}></mdui-button-icon>
      <mdui-button-icon icon="close" onClick={closeWindow} style={{ WebkitAppRegion: 'no-drag' }}></mdui-button-icon>
    </mdui-top-app-bar>
  );
};

export default TopBar;