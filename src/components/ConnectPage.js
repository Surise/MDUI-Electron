import React, { useState, useMemo, useEffect, useRef } from 'react';
import 'mdui/components/text-field.js';
import 'mdui/components/card.js';
import 'mdui/components/divider.js';
import 'mdui/components/circular-progress.js';
import 'mdui/components/dialog.js';
import 'mdui/components/button.js';
import 'mdui/components/select.js';
import 'mdui/components/menu-item.js';
import { checkOnlineAccounts, fetchGameList, fetchGameCharacters, addGameCharacter, ProxyStartDoMain } from './AuthService';
import { useServerCache } from './ServerCacheContext';
import { useUser } from './UserContext';

const ConnectPage = ({ serverPort }) => {
  const { userData } = useUser();
  const [servers, setServers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [hasOnlineAccounts, setHasOnlineAccounts] = useState(true); 
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState({ current: 0, total: 5 });
  const { cachedServers, updateCachedServers } = useServerCache(); 
  
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);
  const [roleName, setRoleName] = useState('');
  const [customRoleName, setCustomRoleName] = useState('');
  const [roleNames, setRoleNames] = useState([
    '狂笑的赵轩海写黄文',
    '狂笑的Daniel写论文',
    '狂笑的郑洋写散文'
  ]);
  
  const [roleNameMap, setRoleNameMap] = useState({});
  const [roleNamesLoading, setRoleNamesLoading] = useState(false);
  const [proxyStarting, setProxyStarting] = useState(false); // 添加代理启动状态
  const roleNameRef = useRef(null);

  // 添加调试日志，监视 roleName 的变化
  useEffect(() => {
    console.log('RoleName changed:', roleName);
  }, [roleName]);

  const filteredServers = useMemo(() => {
    if (!searchTerm) return servers;
    return servers.filter(server => 
      server.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [servers, searchTerm]);

  useEffect(() => {
    const initialize = async () => {
      if (serverPort) {
        setLoading(true);
        setProgress({ current: 0, total: 5 });
        try {
          const onlineResult = await checkOnlineAccounts(serverPort);
          setHasOnlineAccounts(onlineResult);
          
          if (onlineResult) {
            if (cachedServers.length === 0) {
              const gameList = await fetchGameList(serverPort, 250, 50, (current, total) => {
                setProgress({ current, total });
              });
              const formattedServers = gameList.map((game) => ({
                id: game.entity_id,
                name: game.name,
                version: game.mc_version_name,
                description: game.brief_summary,
                players: game.online_count
              }));
              setServers(formattedServers);
              updateCachedServers(formattedServers);
            } else {
              setServers(cachedServers);
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
  }, [serverPort]);

  const handleServerClick = async (server) => {
    console.log('点击了服务器:', server);
    setSelectedServer(server);
    setShowServerSettings(true);
    
    // 先显示对话框，然后加载角色名
    setRoleNamesLoading(true);
    try {
      const result = await fetchGameCharacters(
        serverPort, 
        userData, 
        server.id, 
        2
      );
      
      if (result.code === 0 && result.data && Array.isArray(result.data)) {
        const names = result.data.map(item => item.name);
        setRoleNames(names);
        const map = {};
        result.data.forEach(item => {
          map[item.entity_id] = item.name;
        });
        setRoleNameMap(map);
      }
    } catch (error) {
      console.error('获取角色列表失败:', error);
    } finally {
      setRoleNamesLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddRoleName = async () => {
    if (customRoleName.trim() !== '' && selectedServer && serverPort) {
      try {
        const result = await addGameCharacter(serverPort, selectedServer.id, customRoleName.trim());
        
        if (result.code === 0) {
          setRoleNames(prev => [...prev, customRoleName.trim()]);
          setCustomRoleName('');
        } else {
          console.error('添加角色失败:', result.msg);
        }
      } catch (error) {
        console.error('添加角色时发生错误:', error);
      }
    }
  };

  const generateRandomUsername = () => {
    const adjectives = [
      '快乐的', '开心的', '可爱的', '活泼的', '温柔的', '聪明的', '勇敢的', '善良的', '机智的', '优雅的',
      '调皮的', '安静的', '热情的', '开朗的', '乐观的', '自信的', '坚强的', '独立的', '友善的', '真诚的'
    ];

    const nouns = [
      '小猫', '小狗', '小兔', '小鸟', '小鹿', '小象', '小马', '小羊', '小牛', '小虎',
      '小树', '小花', '小草', '小云', '小星', '小月', '小风', '小雨', '小雪', '小露'
    ];

    const verbs = [
      '在跳舞', '在唱歌', '在画画', '在读书', '在玩耍', '在奔跑', '在跳跃', '在飞翔', '在游泳', '在睡觉'
    ];

    const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];
    
    const adjective = getRandomItem(adjectives);
    const noun = getRandomItem(nouns);
    const verb = getRandomItem(verbs);
    let username = adjective + noun + verb;

    if (username.length !== 8) {
      return '获取失败';
    }

    const positions = new Set();
    while (positions.size < 2) {
      positions.add(Math.floor(Math.random() * 8));
    }

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const allChars = letters + numbers;
    
    let result = username.split('');
    positions.forEach(pos => {
      const isLetter = Math.random() > 0.5;
      const charSet = isLetter ? letters : numbers;
      result[pos] = charSet[Math.floor(Math.random() * charSet.length)];
    });

    return result.join('');
  };

  const handleRandomRoleName = async () => {
    if (selectedServer && serverPort) {
      const randomName = generateRandomUsername();
      
      if (randomName !== '获取失败') {
        try {
          const result = await addGameCharacter(serverPort, selectedServer.id, randomName);
          
          if (result.code === 0) {
            setRoleNames(prev => [...prev, randomName]);
            setRoleName(randomName);
          } else {
            console.error('添加角色失败:', result.msg);
          }
        } catch (error) {
          console.error('添加角色时发生错误:', error);
        }
      }
    }
  };

  const handleCloseServerSettings = () => {
    setShowServerSettings(false);
    setSelectedServer(null);
    setRoleName('');
  };

  const handleSaveServerSettings = async () => {
    const currentRoleName = roleNameRef.current ? roleNameRef.current.value : roleName;
    console.log('保存服务器设置:', {
      server: selectedServer,
      roleName: currentRoleName,
      customRoleName
    });
    
    setProxyStarting(true);
    
    console.log('RoleNameMap:', roleNameMap);
    console.log('Current roleName:', currentRoleName);
    
    let selectedRoleId = null;
    for (const [id, name] of Object.entries(roleNameMap)) {
      console.log(`检查角色映射: ID=${id}, Name=${name}`);
      if (name === currentRoleName) {
        selectedRoleId = id;
        console.log(`找到匹配的角色ID: ${selectedRoleId}`);
        break;
      }
    }
    
    if (!selectedRoleId) {
      console.log('未找到精确匹配，尝试部分匹配');
      for (const [id, name] of Object.entries(roleNameMap)) {
        if (name.includes(currentRoleName) || currentRoleName.includes(name)) {
          selectedRoleId = id;
          console.log(`通过部分匹配找到角色ID: ${selectedRoleId}`);
          break;
        }
      }
    }
    
    console.log('解析参数:', {
      serverPort,
      selectedServer,
      roleName: currentRoleName,
      selectedRoleId
    });
    
    // 调用ProxyStartDoMain函数
    if (selectedRoleId && selectedServer && serverPort) {
      try {
        console.log('调用ProxyStartDoMain函数:',serverPort,
          selectedServer.id, // serverItemId
          selectedRoleId, // roleId
          currentRoleName, // roleName
        );
        const result = await ProxyStartDoMain(
          serverPort,
          selectedServer.id, // serverItemId
          selectedRoleId, // roleId
          currentRoleName // roleName
        );
        
        if (result) {
          console.log('代理启动成功:', result);
          // 可以在这里添加成功后的处理逻辑，比如显示提示或更新UI
        } else {
          console.error('代理启动失败:', result);
          // 可以在这里添加失败后的处理逻辑，比如显示错误提示
        }
      } catch (error) {
        console.error('启动代理时发生错误:', error);
      }
    } else {
      console.warn('缺少必要参数，无法启动代理:', {
        hasSelectedRoleId: !!selectedRoleId,
        hasSelectedServer: !!selectedServer,
        hasServerPort: !!serverPort
      });
    }
    
    // 恢复按钮状态
    setProxyStarting(false);
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
      
      {/* 服务器账号设置对话框 */}
      <mdui-dialog 
        open={showServerSettings}
        onClose={handleCloseServerSettings}
      >
        {selectedServer && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ marginTop: 0 }}>服务器账号设置</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>服务器名: {selectedServer.name}</h3>
              <p>在线人数: {selectedServer.players}人</p>
            </div>
            
            {roleNamesLoading ? (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px'
              }}>
                <mdui-circular-progress style={{ width: '40px', height: '40px', marginBottom: '16px' }}></mdui-circular-progress>
                <p>正在加载角色列表...</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <mdui-select 
                    ref={roleNameRef}
                    value={roleName}
                    change={(e) => {
                      console.log('Select value changed:', e.target.value);
                      setRoleName(e.target.value);
                    }}
                    label="选择角色名（如果为空请先添加）"
                    style={{ width: '100%' }}
                  >
                    {roleNames.map((name, index) => (
                      <mdui-menu-item key={index} value={name}>{name}</mdui-menu-item>
                    ))}
                  </mdui-select>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginBottom: '20px',
                  alignItems: 'center'
                }}>
                  <mdui-text-field 
                    value={customRoleName}
                    onInput={(e) => setCustomRoleName(e.target.value)}
                    label="添加角色名称"
                    variant="outlined"
                    maxlength="11"
                    clearable
                    style={{ flex: 1 }}
                  ></mdui-text-field>
                  <mdui-button onClick={handleAddRoleName} variant="filled">添加</mdui-button>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <mdui-button onClick={handleRandomRoleName} variant="outlined" style={{ width: '100%' }}>
                    随机角色名
                  </mdui-button>
                </div>
              </>
            )}
          </div>
        )}
        
        <div slot="action" style={{display: 'flex',padding: '10px',gap: '10px'}}>
          <mdui-button variant="text" onClick={handleCloseServerSettings}>取消</mdui-button>
          <mdui-button variant="tonal" onClick={handleSaveServerSettings}>开启白端模式</mdui-button>
          <mdui-button variant="filled" onClick={handleSaveServerSettings}>开启服务器代理服务</mdui-button>
        </div>
      </mdui-dialog>
    </div>
  );
};

export default ConnectPage;