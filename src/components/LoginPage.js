import React, { useState, useEffect } from 'react';
import 'mdui/components/text-field.js';
import 'mdui/components/button.js';
import 'mdui/components/icon.js';
import 'mdui/components/top-app-bar.js';
import 'mdui/components/top-app-bar-title.js';
import 'mdui/components/button-icon.js';
import { snackbar } from 'mdui/functions/snackbar.js';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hitokoto, setHitokoto] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    // 设置黑夜模式主题
    document.body.setAttribute('class', 'mdui-theme-dark');
    
    // 获取一言
    fetchHitokoto();
    
    // 检查并启动本地服务器
    checkAndStartServer();
  }, []);

  const checkAndStartServer = async () => {
    try {
      setServerStatus('checking');
      
      // 检查本地服务器DLL是否存在
      const checkResult = await window.electron.ipcRenderer.invoke('check-local-server');
      
      if (!checkResult.exists) {
        setServerStatus('not-found');
        showSnackbar(`本地服务器文件不存在: ${checkResult.error}`, 'error');
        return;
      }
      
      setServerStatus('starting');
      showSnackbar('正在启动本地服务器...', 'info');
      
      // 发送启动服务器的请求到主进程
      window.electron.ipcRenderer.send('start-local-server');
      
      // 监听启动结果
      const handleServerResult = (result) => {
        if (result.success) {
          setServerStatus('running');
          showSnackbar('本地服务器启动成功', 'success');
        } else {
          setServerStatus('error');
          showSnackbar(`本地服务器启动失败: ${result.error}`, 'error');
        }
        
        // 清理监听器
        window.electron.ipcRenderer.removeAllListeners('local-server-result');
      };
      
      window.electron.ipcRenderer.on('local-server-result', handleServerResult);
    } catch (error) {
      setServerStatus('error');
      showSnackbar(`检查本地服务器时出错: ${error.message}`, 'error');
    }
  };

  const showSnackbar = (message, type) => {
    // 使用 MDUI 的 snackbar 函数显示消息
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

  const handleLogin = (e) => {
    e.preventDefault();
    
    // 简单验证 - 用户名和密码都为 admin
    if (username === 'admin' && password === 'admin') {
      onLogin();
    } else {
      setError('用户名或密码错误');
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

  // 渲染带换行的一言文本，并用『』框起来
  const renderHitokoto = () => {
    if (!hitokoto) return '';
    
    // 按要求处理换行：每8个字符且剩余长度大于3个字符时换行
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < hitokoto.length; i++) {
      currentLine += hitokoto[i];
      
      if (hitokoto[i] == ','&& hitokoto[i] == '。') {
        lines.push(currentLine);
        currentLine = '';
      }
    }
    
    // 添加最后一行（如果有内容）
    if (currentLine) {
      lines.push(currentLine);
    }
    
    // 用『』框起每一行
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
              <mdui-text-field
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
              ></mdui-text-field>
              
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
                  disabled={serverStatus === 'checking' || serverStatus === 'starting'}
                >
                  {(serverStatus === 'checking' || serverStatus === 'starting') ? '请稍候...' : '登录'}
                </mdui-button>
              </div>
              
              <div style={{ 
                marginTop: '16px',
                fontSize: '12px',
                color: 'var(--mdui-color-on-surface-variant)',
                textAlign: 'center'
              }}>
                <p>默认账号密码: admin / admin</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;