import React, { useState, useEffect } from 'react';
import 'mdui/components/card.js';
import 'mdui/components/button.js';
import 'mdui/components/text-field.js';
import SuCard from './SuCard';
import 'mdui/components/tabs.js';
import 'mdui/components/tab.js';
import 'mdui/components/tab-panel.js';
import 'mdui/components/list.js';
import 'mdui/components/list-item.js';
import 'mdui/components/icon.js';
import 'mdui/components/dialog.js';
import 'mdui/components/circular-progress.js';
import { snackbar } from 'mdui/functions/snackbar.js';
import { login4399, loginSAuth, loginOfficial } from './AuthService';

const HomePage = ({ serverPort }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accounts4399, setAccounts4399] = useState([]);
  const [accountsOfficial, setAccountsOfficial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState({});
  const [activeTab, setActiveTab] = useState('4399');
  // 验证码相关状态
  const [showCaptchaDialog, setShowCaptchaDialog] = useState(false);
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [pendingLoginData, setPendingLoginData] = useState({ username: '', password: '' });
  // 登录按钮加载状态
  const [isLoginButtonLoading, setIsLoginButtonLoading] = useState(false);

  useEffect(() => {
    if (serverPort) {
      fetchAccountData();
    }
  }, [serverPort]);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      // 获取4399账户数据
      const response4399 = await fetch(`http://127.0.0.1:${serverPort}/Manager/Account/Category/4399/List`);
      const data4399 = await response4399.json();
      
      // 获取Official账户数据
      const responseOfficial = await fetch(`http://127.0.0.1:${serverPort}/Manager/Account/Category/Official/List`);
      const dataOfficial = await responseOfficial.json();
      
      // 保存数据供整个页面使用
      if (data4399.code === 0) {
        setAccounts4399(data4399.data || []);
      }
      
      if (dataOfficial.code === 0) {
        setAccountsOfficial(dataOfficial.data || []);
      }
    } catch (error) {
      console.error('获取账户数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    setShowLoginCard(true);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!serverPort) {
      snackbar({
        message: '服务器未启动完成，请稍后再试',
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
      return;
    }
    
    setIsLoginButtonLoading(true);
    try {
      let result;
      
      switch (activeTab) {
        case '4399':
          // 4399登录
          result = await login4399(serverPort, username, password);
          // 检查是否需要验证码
          if (result.code !== 0 && result.msg === '需要输入验证码') {
            // 显示验证码对话框
            setCaptchaImage(result.data);
            setPendingLoginData({ username, password });
            setShowCaptchaDialog(true);
            setIsLoginButtonLoading(false);
            return;
          }
          break;
          
        case 'netease':
          // 网易官方账号登录
          result = await loginOfficial(serverPort, username, password);
          break;
          
        case 'cookies':
          // SAuth登录 (使用username作为sauth参数)
          result = await loginSAuth(serverPort, username);
          break;
          
        default:
          snackbar({
            message: '未知的登录类型',
            placement: 'bottom-end',
            closeable: true,
            variant: 'error'
          });
          setIsLoginButtonLoading(false);
          return;
      }
      
      handleLoginResult(result);
    } catch (error) {
      console.error('登录请求失败:', error);
      snackbar({
        message: `登录请求失败: ${error.message}`,
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
    } finally {
      setIsLoginButtonLoading(false);
    }
  };

  const handleLoginResult = (result) => {
    if (result.code === 0) {
      // 登录成功
      setIsLoggedIn(true);
      setShowLoginCard(false);
      setUsername('');
      setPassword('');
      setCaptchaValue('');
      snackbar({
        message: '登录成功',
        placement: 'bottom-end',
        closeable: true,
        variant: 'success'
      });
      // 重新获取账户数据
      fetchAccountData();
    } else {
      // 登录失败
      snackbar({
        message: `登录失败: ${result.msg}`,
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleTabChange = (e) => {
    setActiveTab(e.target.value);
  };

  const handleCaptchaSubmit = async () => {
    setIsLoginButtonLoading(true);
    try {
      // 使用存储的用户名和密码以及用户输入的验证码进行登录
      const result = await login4399(
        serverPort, 
        pendingLoginData.username, 
        pendingLoginData.password, 
        captchaValue
      );
      
      setShowCaptchaDialog(false);
      handleLoginResult(result);
    } catch (error) {
      console.error('验证码登录失败:', error);
      snackbar({
        message: `验证码登录失败: ${error.message}`,
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
    } finally {
      setIsLoginButtonLoading(false);
    }
  };

  const handleCaptchaValueChange = (e) => {
    setCaptchaValue(e.target.value);
  };

  const handleCaptchaClose = () => {
    setShowCaptchaDialog(false);
    setCaptchaValue('');
  };

  const handleAccountLogin = async (account) => {
    if (!serverPort) {
      snackbar({
        message: '服务器未启动完成，请稍后再试',
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
      return;
    }

    // 设置账户加载状态
    const accountKey = `account-${account.id}`;
    setLoadingAccounts(prev => ({ ...prev, [accountKey]: true }));
    
    try {
      let result;
      if (account.account.includes('@')) {
        result = await loginOfficial(serverPort, account.account, account.password);
      } else {
        result = await login4399(serverPort, account.account, account.password);
      }
      if (!account.account.includes('@') && result.code !== 0 && result.msg === '需要输入验证码') {
        setCaptchaImage(result.data);
        setPendingLoginData({ username: account.account, password: account.password });
        setShowCaptchaDialog(true);
        setLoadingAccounts(prev => {
          const newState = { ...prev };
          delete newState[accountKey];
          return newState;
        });
        return;
      }

      if (result.code === 0) {
        setIsLoggedIn(true);
        snackbar({
          message: '登录成功',
          placement: 'bottom-end',
          closeable: true,
          variant: 'success'
        });
        fetchAccountData();
      } else {
        snackbar({
          message: `登录失败: ${result.msg}`,
          placement: 'bottom-end',
          closeable: true,
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('登录请求失败:', error);
      snackbar({
        message: `登录请求失败: ${error.message}`,
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
    } finally {
      setLoadingAccounts(prev => {
        const newState = { ...prev };
        delete newState[accountKey];
        return newState;
      });
    }
  };

  const handleRandom4399Login = async () => {
    if (!serverPort) {
      snackbar({
        message: '服务器未启动完成，请稍后再试',
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
      return;
    }

    setIsLoginButtonLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:${serverPort}/Func/CloudAlt/Get`);
      const result = await response.json();

      if (result.code === 0 && result.data) {
        const { username, password } = result.data;
        const loginResult = await login4399(serverPort, username, password);
        
        if (loginResult.code !== 0 && loginResult.msg === '需要输入验证码') {
          setCaptchaImage(loginResult.data);
          setPendingLoginData({ username, password });
          setShowCaptchaDialog(true);
          setIsLoginButtonLoading(false);
          return;
        }
        
        handleLoginResult(loginResult);
      } else {
        snackbar({
          message: result.msg || '获取随机账户失败',
          placement: 'bottom-end',
          closeable: true,
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('获取随机4399账户失败:', error);
      snackbar({
        message: `获取随机账户失败: ${error.message}`,
        placement: 'bottom-end',
        closeable: true,
        variant: 'error'
      });
    } finally {
      setIsLoginButtonLoading(false);
    }
  };

  // 合并两个账户列表用于显示
  const allAccounts = [...accounts4399, ...accountsOfficial];
  
  return (
    <div style={{ padding: '24px', width: '100%', height: '100%' }}>
      <h1>主页</h1>
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
        <SuCard
          title="公告"
          subtitle="Topic"
          clickable
          body={
            <>
              <p>愿我终生写诗</p>
              <p>也终生不明白什么是诗</p>
              <p>只让写作这件事自然而然发生</p>
              <p>这意味这一切</p>
            </>
          }
          // actions={<mdui-button variant="text">管理</mdui-button>}
        />
        
        {!showLoginCard ? (
          <mdui-card style={{ minWidth: '280px' }}>
            <div style={{ padding: '16px 16px 0 16px' }}>
              <h2 style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '24px',
                color: 'var(--mdui-color-on-surface, #000)'
              }}>
                已保存的账号
              </h2>
              <div style={{
                margin: '4px 0 0 0',
                fontSize: '14px',
                fontWeight: 400,
                lineHeight: '20px',
                color: 'var(--mdui-color-on-surface-variant, rgba(0, 0, 0, 0.7))'
              }}>
                点击登录
              </div>
            </div>
            <div style={{ padding: '16px', paddingBottom: '56px' }}>
              {loading ? (
                <p>加载中...</p>
              ) : allAccounts.length > 0 ? (
                <mdui-list style={{ width: '100%', maxHeight: '200px', overflowY: 'auto' }}>
                  {allAccounts.map((account, index) => (
                    <mdui-list-item 
                      key={account.id} 
                      alignment={index === 0 ? "start" : index === allAccounts.length - 1 ? "end" : "center"} 
                      description="点我登录该账号"
                      onClick={() => handleAccountLogin(account)}
                      style={{ cursor: 'pointer' }}
                      disabled={loadingAccounts[`account-${account.id}`]}
                    >
                      {loadingAccounts[`account-${account.id}`] ? (
                        <mdui-circular-progress slot="icon"></mdui-circular-progress>
                      ) : (
                        <mdui-icon slot="icon" name="people"></mdui-icon>
                      )}
                      {account.account}
                    </mdui-list-item>
                  ))}
                </mdui-list>

              ) : (
                <p>当前暂无保存数据，请先登录一个账号</p>
              )}
            </div>
            <div style={{
              padding: '8px 16px 16px 16px',
              display: 'flex',
              justifyContent: 'flex-end',
              position: 'absolute',
              right: 0,
              bottom: 0,
              left: 0
            }}>
              <mdui-button variant="text" onClick={handleLoginClick}>添加账号</mdui-button>
            </div>
          </mdui-card>
        ) : (
          <SuCard
            title="用户登录"
            subtitle="User Login"
            body={
              
                <mdui-tabs value={activeTab} placement="top" style={{ minHeight: '300px' }} onTabChange={handleTabChange}>
                  <mdui-tab value="4399" style={{ minWidth: '100px', textAlign: 'center', backgroundColor: 'var(--mdui-color-surface-container-low)' }}>4399</mdui-tab>
                  <mdui-tab value="netease" style={{ minWidth: '100px', textAlign: 'center', backgroundColor: 'var(--mdui-color-surface-container-low)' }}>163邮箱</mdui-tab>
                  <mdui-tab value="cookies" style={{ minWidth: '100px', textAlign: 'center', backgroundColor: 'var(--mdui-color-surface-container-low)' }}>cookies</mdui-tab>
                  <mdui-tab value="range" style={{ minWidth: '100px', textAlign: 'center', backgroundColor: 'var(--mdui-color-surface-container-low)' }}>随机4399</mdui-tab>

                  <mdui-tab-panel slot="panel" value="4399">
                    <form onSubmit={handleLoginSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                      <mdui-text-field
                        label="账号"
                        value={username}
                        onInput={handleUsernameChange}
                        icon="person"
                        variant="outlined"
                        style={{ width: '100%' }}
                      ></mdui-text-field>
                      <mdui-text-field
                        label="密码"
                        type="password"
                        value={password}
                        onInput={handlePasswordChange}
                        icon="lock"
                        variant="outlined"
                        style={{ width: '100%' }}
                      ></mdui-text-field>
                      
                      <mdui-button 
                        type="submit" 
                        variant="filled" 
                        style={{ marginTop: '8px', width: '100%' }}
                        disabled={isLoginButtonLoading}
                      >
                        {isLoginButtonLoading ? '登录中...' : '登录'}
                      </mdui-button>

                    </div>
                    </form>
                  </mdui-tab-panel>
                  <mdui-tab-panel slot="panel" value="netease">
                    <form onSubmit={handleLoginSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                      <mdui-text-field
                        label="账号"
                        value={username}
                        onInput={handleUsernameChange}
                        icon="person"
                        variant="outlined"
                        style={{ width: '100%' }}
                      ></mdui-text-field>
                      <mdui-text-field
                        label="密码"
                        type="password"
                        value={password}
                        onInput={handlePasswordChange}
                        icon="lock"
                        variant="outlined"
                        style={{ width: '100%' }}
                      ></mdui-text-field>
                      
                      <mdui-button type="submit" variant="filled" style={{ marginTop: '8px', width: '100%' }}>登录</mdui-button>
                    </div>
                    </form>
                  </mdui-tab-panel>
                  <mdui-tab-panel slot="panel" value="cookies">
                    <form onSubmit={handleLoginSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                      <mdui-text-field
                        label="SAuth"
                        value={username}
                        onInput={handleUsernameChange}
                        icon="person"
                        variant="outlined"
                        style={{ width: '100%' }}
                      ></mdui-text-field>
                      
                      <mdui-button type="submit" variant="filled" style={{ marginTop: '8px', width: '100%' }}>登录</mdui-button>
                    </div>
                    </form>
                  </mdui-tab-panel>
                  <mdui-tab-panel slot="panel" value="range">
                    <form onSubmit={(e) => { e.preventDefault(); handleRandom4399Login(); }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
                      <mdui-button 
                        type="submit" 
                        variant="filled" 
                        style={{ marginTop: '8px', width: '100%' }}
                        disabled={isLoginButtonLoading}
                      >
                        {isLoginButtonLoading ? '登录中...' : '登录随机4399'}
                      </mdui-button>
                    </div>

                    </form>
                  </mdui-tab-panel>

                </mdui-tabs>
            }
            actions={
              <mdui-button variant="text" onClick={() => setShowLoginCard(false)}>取消</mdui-button>
            }
          />
        )}
      </div>
      
      {/* 验证码对话框 */}
      <mdui-dialog 
        open={showCaptchaDialog} 
        onClose={handleCaptchaClose}
        headline="验证码"
      >
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '16px',
          padding: '20px'
        }}>
          <p style={{ 
            margin: '0', 
            fontSize: '16px', 
            color: 'var(--mdui-color-on-surface)' 
          }}>
            请输入验证码:
          </p>
          {captchaImage && (
            <img 
              src={captchaImage} 
              alt="验证码" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                width: '200px',
                border: '1px solid var(--mdui-color-outline)',
                borderRadius: '4px'
              }}
            />
          )}
          <mdui-text-field
            label="验证码"
            value={captchaValue}
            onInput={handleCaptchaValueChange}
            variant="outlined"
            style={{ width: '100%' }}
          ></mdui-text-field>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '8px',
          padding: '16px'
        }}>
          <mdui-button 
            variant="text" 
            onClick={handleCaptchaClose}
          >
            取消
          </mdui-button>
          <mdui-button 
            variant="filled" 
            onClick={handleCaptchaSubmit}
          >
            登录
          </mdui-button>
        </div>
      </mdui-dialog>
    </div>
  );
};

export default HomePage;