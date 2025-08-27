import React, { useState, useEffect } from 'react';
import 'mdui/components/text-field.js';
import 'mdui/components/button.js';
import 'mdui/components/icon.js';
import 'mdui/components/top-app-bar.js';
import 'mdui/components/top-app-bar-title.js';
import 'mdui/components/button-icon.js';
import { snackbar } from 'mdui/functions/snackbar.js';

const LoginPage = ({ onLogin, setServerPort: setAppServerPort }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hitokoto, setHitokoto] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');
  const [serverPort, setServerPort] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    document.body.setAttribute('class', 'mdui-theme-dark');
    fetchHitokoto();
    checkAndStartServer();
  }, []);

  const checkAndStartServer = async () => {
    try {
      setServerStatus('checking');
      const checkResult = await window.electron.ipcRenderer.invoke('check-local-server');
      if (!checkResult.exists) {
        setServerStatus('not-found');
        showSnackbar(`本地服务器文件不存在: ${checkResult.error}`, 'error');
        return;
      }
      
      setServerStatus('starting');
      showSnackbar('正在启动本地服务器...', 'info');
      window.electron.ipcRenderer.send('start-local-server');
      const handleServerResult = (result) => {
        if (result.success) {
        } else {
          setServerStatus('error');
          showSnackbar(`本地服务器启动失败: ${result.error}`, 'error');
        }
        window.electron.ipcRenderer.removeAllListeners('local-server-result');
      };
      
      // 添加对服务器输出的监听
      const handleServerOutput = (output) => {
        console.log('服务器输出:', output);
        // 检查是否包含端口信息，使用更宽松的正则表达式
        const portMatch = output.match(/Running on port\s*=>\s*(\d+)/);
        if (portMatch && portMatch[1]) {
          const port = portMatch[1];
          setServerPort(port);
          setAppServerPort(port);
          // 启动定期检查服务器状态
          startServerHealthCheck(port);
          showSnackbar(`本地服务器启动成功 | 端口:${port}`, 'success');
          console.log(`本地服务器运行在端口: ${port}`);
        }
      };
      
      window.electron.ipcRenderer.on('local-server-result', handleServerResult);
      window.electron.ipcRenderer.on('local-server-output', handleServerOutput);
    } catch (error) {
      setServerStatus('error');
      showSnackbar(`检查本地服务器时出错: ${error.message}`, 'error');
    }
  };

  const startServerHealthCheck = (port) => {
    // 每3秒检查一次服务器状态
    const healthCheckInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/Base/Ping`);
        const data = await response.json();
        
        if (data.msg === 'Pong') {
          setServerStatus('running');
          clearInterval(healthCheckInterval); // 一旦确认运行，停止检查
        }
      } catch (error) {
        console.log('服务器健康检查失败:', error);
        // 继续检查，不改变状态
      }
    }, 3000);
  };

  const showSnackbar = (message, type) => {
    snackbar({
      message: message,
      placement: 'bottom-end',
      closeable: true,
      variant: type === 'error' ? 'error' : type === 'success' ? 'success' : undefined
    });
  };

  const fetchHitokoto = () => {
    fetch('https://v1.hitokoto.cn')
      .then(response => response.json())
      .then(data => {
        setHitokoto(data.hitokoto);
      })
      .catch(error => {
        console.error('获取一言失败:', error);
        setHitokoto('今日事，今日毕。');
      });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!serverPort) {
      showSnackbar('服务器尚未启动完成，请稍后再试', 'error');
      return;
    }
    
    setIsAuthenticating(true);
    try {
      const response = await fetch(`http://127.0.0.1:${serverPort}/Auth/Status`);
      const data = await response.json();
      
      if (data.data === true) {
        // 登录成功
        onLogin();
      } else {
        // 需要在浏览器中打开登录页面
        showSnackbar('请先在网页中登录账号，然后重试', 'info');
        // 在默认浏览器中打开登录页面
        window.electron.ipcRenderer.send('open-external-url', `http://127.0.0.1:${serverPort}/Auth/Login`);
      }
    } catch (error) {
      showSnackbar(`登录检查失败: ${error.message}`, 'error');
    } finally {
      setIsAuthenticating(false);
    }
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

  const renderHitokoto = () => {
    if (!hitokoto) return '';
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < hitokoto.length; i++) {
      currentLine += hitokoto[i];
      
      if (hitokoto[i] == ','&& hitokoto[i] == '。') {
        lines.push(currentLine);
        currentLine = '';
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="login-container-centered">
      {/* 顶部栏 */}
      <mdui-top-app-bar style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000, 
        WebkitAppRegion: 'drag', 
        height: '64px', 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: 'var(--mdui-color-surface-container)'
      }}>
        <mdui-button-icon icon="blur_on"></mdui-button-icon>
        <mdui-top-app-bar-title>KryptonNEL</mdui-top-app-bar-title> 
        <div style={{ flex: '1' }}></div>
        {/* 窗口控制按钮 */}
        <mdui-button-icon icon="remove" onClick={minimizeWindow} style={{ WebkitAppRegion: 'no-drag' }}></mdui-button-icon>
        <mdui-button-icon icon="crop_square" onClick={maximizeWindow} style={{ WebkitAppRegion: 'no-drag' }}></mdui-button-icon>
        <mdui-button-icon icon="close" onClick={closeWindow} style={{ WebkitAppRegion: 'no-drag' }}></mdui-button-icon>
      </mdui-top-app-bar>

      {/* 主内容区域 */}
      <div className="login-main-centered">
        <div 
          className="login-left-background"
          onClick={fetchHitokoto}
        >
          <div className="hitokoto-left">
            <div className="hitokoto-container">
              <p className="hitokoto-text">{renderHitokoto()}</p>
              <div className="hitokoto-decoration"></div>
            </div>
          </div>
        </div>
        <div className="login-form-overlay">
          <div className="login-form-card">
            <h1 style={{ 
              textAlign: 'center', 
              marginBottom: '24px',
              color: 'var(--mdui-color-on-surface)'
            }}>用户登录</h1>
            
            {/* 服务器状态显示 */}
            <div style={{ 
              padding: '10px', 
              marginBottom: '16px', 
              borderRadius: '4px',
              backgroundColor: 
                serverStatus === 'running' ? 'var(--mdui-color-success-container)' : 
                serverStatus === 'error' || serverStatus === 'not-found' ? 'var(--mdui-color-error-container)' : 
                'var(--mdui-color-surface-variant)',
              color: 
                serverStatus === 'running' ? 'var(--mdui-color-on-success-container)' : 
                serverStatus === 'error' || serverStatus === 'not-found' ? 'var(--mdui-color-on-error-container)' : 
                'var(--mdui-color-on-surface-variant)',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center' // 添加居中对齐
            }}>
              <span style={{ marginRight: '8px' }}>
                {serverStatus === 'checking' && '🔍'}
                {serverStatus === 'starting' && '⏳'}
                {serverStatus === 'running' && '✅'}
                {(serverStatus === 'error' || serverStatus === 'not-found') && '❌'}
              </span>
              <span>
                {serverStatus === 'checking' && '正在检查本地服务器...'}
                {serverStatus === 'not-found' && '本地服务器文件未找到'}
                {serverStatus === 'starting' && '正在启动本地服务器...'}
                {serverStatus === 'running' && '本地服务器运行中'}
                {serverStatus === 'error' && '本地服务器启动失败'}
              </span>
            </div>
            
            <form onSubmit={handleLogin}>
              {/* <mdui-text-field
                label="用户名"
                value={username}
                onInput={(e) => setUsername(e.target.value)}
                fullWidth
                style={{ marginBottom: '16px' }}
                icon="person"
                variant="outlined"
              ></mdui-text-field>
              
              <mdui-text-field
                label="密码"
                type="password"
                value={password}
                onInput={(e) => setPassword(e.target.value)}
                fullWidth
                style={{ marginBottom: '16px' }}
                icon="lock"
                variant="outlined"
              ></mdui-text-field> */}
              
              {error && (
                <div style={{ 
                  color: 'var(--mdui-color-error)',
                  marginBottom: '16px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}
              
              <div style={{ textAlign: 'center' }}>
                <mdui-button 
                  type="submit"
                  variant="filled"
                  style={{ width: '100%' }}
                  disabled={serverStatus !== 'running' || isAuthenticating}
                >
                  {isAuthenticating ? '验证中...' : (serverStatus !== 'running' ? '请稍候...' : '登录')}
                </mdui-button>
              </div>
              
              <div style={{ 
                marginTop: '16px',
                fontSize: '12px',
                color: 'var(--mdui-color-on-surface-variant)',
                textAlign: 'center'
              }}>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;