import React, { useState, useMemo, useEffect } from 'react';
import 'mdui/components/text-field.js';
import 'mdui/components/card.js';
import 'mdui/components/divider.js';
import 'mdui/components/circular-progress.js';
import { checkOnlineAccounts, fetchGameList } from './AuthService';
import { useServerCache } from './ServerCacheContext';

const ConnectPage = ({ serverPort }) => {
  const [servers, setServers] = useState([]); // 使用从API获取的真实数据
  const [searchTerm, setSearchTerm] = useState('');
  const [hasOnlineAccounts, setHasOnlineAccounts] = useState(true); // 默认假设存在在线账号
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 5 }); // 添加进度状态
  const { cachedServers, updateCachedServers } = useServerCache(); // 使用全局缓存

  // 根据搜索词筛选服务器
  const filteredServers = useMemo(() => {
    if (!searchTerm) return servers;
    return servers.filter(server => 
      server.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [servers, searchTerm]);

  // 检查在线账号并获取游戏列表
  useEffect(() => {
    const initialize = async () => {
      if (serverPort) {
        setLoading(true);
        setProgress({ current: 0, total: 5 }); // 初始化进度
        try {
          // 检查在线账号
          const onlineResult = await checkOnlineAccounts(serverPort);
          setHasOnlineAccounts(onlineResult);
          
          // 如果有在线账号，则获取游戏列表
          if (onlineResult) {
            // 如果缓存数据为空，则获取新数据
            // 如果缓存数据不为空，则使用缓存数据
            if (cachedServers.length === 0) {
              const gameList = await fetchGameList(serverPort, 250, 50, (current, total) => {
                // 更新进度
                setProgress({ current, total });
              });
              // 将获取到的数据转换为组件需要的格式
              const formattedServers = gameList.map((game) => ({
                id: game.entity_id,
                name: game.name,
                description: game.brief_summary,
                players: game.online_count
              }));
              setServers(formattedServers);
              updateCachedServers(formattedServers); // 更新全局缓存
            } else {
              setServers(cachedServers); // 使用全局缓存数据
            }
          }
        } catch (error) {
          console.error('初始化失败:', error);
          setHasOnlineAccounts(false);
        } finally {
          setLoading(false);
        }
      }
    };

    initialize();
  }, [serverPort]); // 只依赖 serverPort

  const handleServerClick = (server) => {
    console.log('点击了服务器:', server);
    // 这里可以添加点击服务器后的操作
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div style={{ padding: '24px', width: '100%', height: '100%' }}>
      <h1>服务器列表</h1>
      
      {/* 添加搜索框，宽度为页面的一半并居中 */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <mdui-text-field 
          icon="search" 
          variant="outlined" 
          label="搜索服务器"
          value={searchTerm}
          onInput={handleSearchChange}
          style={{ width: '50%', minWidth: '300px' }}
        ></mdui-text-field>
      </div>
      
      {/* 全局加载状态 */}
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <mdui-circular-progress style={{ width: '48px', height: '48px', marginBottom: '16px' }}></mdui-circular-progress>
          <div style={{ color: 'white', fontSize: '18px', fontWeight: '500' }}>
            正在加载服务器列表 ({progress.current}/{progress.total})，请耐心等待
          </div>
        </div>
      )}
      
      {/* 在线账号检查提示 */}
      {!hasOnlineAccounts && !loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: 'var(--mdui-color-on-surface-variant)',
          fontSize: '16px'
        }}>
          未检测到在线账号，请先前往主页登录一个游戏账号后刷新重试
        </div>
      )}
      
      {/* 服务器卡片区域 */}
      {hasOnlineAccounts && !loading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, 22%)',
          gridAutoRows: 'min-content',
          gap: '3%',
          height: 'calc(100vh - 180px)',
          overflowY: 'auto'
        }}>
          {filteredServers.map(server => (
            <div 
              key={server.id} 
              onClick={() => handleServerClick(server)}
              style={{ cursor: 'pointer', height: '25%' }}
            >
              <mdui-card variant="outlined" clickable style={{ 
                width: '100%',
                height: '150px',
                padding: '10%',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h3 style={{ 
                  margin: '0 0 2% 0', 
                  fontSize: '1.2em', 
                  fontWeight: '600',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  {server.name}
                </h3>
                <div style={{ 
                  fontSize: '0.9em',
                  color: '#666',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: '2',
                  WebkitBoxOrient: 'vertical',
                  marginBottom: '2%',
                  flexGrow: 1,
                  flexShrink: 0
                }}>
                  {server.description}
                </div>
                <div style={{ 
                  fontSize: '0.9em',
                  color: '#666',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}>
                  在线人数: 
                  <span style={{ 
                    fontWeight: '500', 
                    marginLeft: '4px' 
                  }}>
                    {server.players}
                  </span>
                </div>
              </mdui-card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConnectPage;