import React, { useState } from 'react';
import 'mdui/components/card.js';
import 'mdui/components/button.js';
import 'mdui/components/text-field.js';
import SuCard from './SuCard';
import 'mdui/components/tabs.js';
import 'mdui/components/tab.js';
import 'mdui/components/tab-panel.js';

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginCard, setShowLoginCard] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = () => {
    setShowLoginCard(true);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // 简单验证 - 用户名和密码都为 admin
    if (username === 'admin' && password === 'admin') {
      setIsLoggedIn(true);
      setShowLoginCard(false);
      setUsername('');
      setPassword('');
    } else {
      alert('用户名或密码错误');
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
          <SuCard
            title={isLoggedIn ? "当前账号: admin" : "当前账号:还未登录"}
            subtitle="Online_Account"
            body={
              <>
                <p>token:</p>
                <p>entity_id:</p>
              </>
            }
            actions={
              isLoggedIn ? (
                <mdui-button variant="text" onClick={handleLogout}>登出</mdui-button>
              ) : (
                <mdui-button variant="text" onClick={handleLoginClick}>登录</mdui-button>
              )
            }
          />
        ) : (
          <SuCard
            title="用户登录"
            subtitle="User Login"
            body={
              
                <mdui-tabs value="4399" placement="top" style={{ minHeight: '300px' }}>
                  <mdui-tab value="4399" style={{ minWidth: '100px', textAlign: 'center', backgroundColor: 'var(--mdui-color-surface-container-low)' }}>4399</mdui-tab>
                  <mdui-tab value="netease" style={{ minWidth: '100px', textAlign: 'center', backgroundColor: 'var(--mdui-color-surface-container-low)' }}>163邮箱</mdui-tab>
                  <mdui-tab value="cookies" style={{ minWidth: '100px', textAlign: 'center', backgroundColor: 'var(--mdui-color-surface-container-low)' }}>cookies</mdui-tab>

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
                      
                      <mdui-button type="submit" variant="filled" style={{ marginTop: '8px', width: '100%' }}>登录</mdui-button>
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
                        label="cookies"
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
                </mdui-tabs>
            }
            actions={
              <mdui-button variant="text" onClick={() => setShowLoginCard(false)}>取消</mdui-button>
            }
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;