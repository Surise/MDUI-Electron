import React, { useState, useMemo } from 'react';
import 'mdui/components/text-field.js';
import 'mdui/components/card.js';
import 'mdui/components/divider.js';
const ConnectPage = () => {
  // 服务器数据示例（模拟一百多个服务器）
  const [servers] = useState(Array.from({ length: 140 }, (_, i) => ({
    id: i + 1,
    name: `服务器 ${i + 1}`,
    players: Math.floor(Math.random() * 100) + 1
  })));
  
  const [searchTerm, setSearchTerm] = useState('');

  // 根据搜索词筛选服务器
  const filteredServers = useMemo(() => {
    if (!searchTerm) return servers;
    return servers.filter(server => 
      server.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [servers, searchTerm]);

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
      
      {/* 服务器卡片区域 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gridAutoRows: 'min-content',
        gap: '12px',
        height: 'calc(100vh - 180px)',
        overflowY: 'auto'
      }}>
        {filteredServers.map(server => (
          <div 
            key={server.id} 
            onClick={() => handleServerClick(server)}
            style={{ cursor: 'pointer' }}
          >
            <mdui-card variant="outlined" clickable style={{ 
              minWidth: '200px', 
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '16px', 
                fontWeight: '600',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {server.name}
              </h3>
              <div style={{ 
                fontSize: '14px',
                color: '#666'
              }}>
                在线人数: 
                <span style={{ 
                  fontWeight: '500', 
                  color: '#FFF', 
                  marginLeft: '4px' 
                }}>
                  {server.players}
                </span>
              </div>
            </mdui-card>
            <h1> </h1>
            <h1> </h1>
            <h1> </h1>
            <h1> </h1>
            <h1> </h1>
            <h1> </h1>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectPage;