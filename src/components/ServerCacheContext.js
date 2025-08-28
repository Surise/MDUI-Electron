import React, { createContext, useContext, useState } from 'react';

// 创建Context
const ServerCacheContext = createContext();

// 创建Provider组件
export const ServerCacheProvider = ({ children }) => {
  const [cachedServers, setCachedServers] = useState([]);
  
  // 提供设置缓存的方法
  const updateCachedServers = (servers) => {
    setCachedServers(servers);
  };
  
  // 提供清空缓存的方法
  const clearCachedServers = () => {
    setCachedServers([]);
  };
  
  return (
    <ServerCacheContext.Provider value={{ 
      cachedServers, 
      updateCachedServers, 
      clearCachedServers 
    }}>
      {children}
    </ServerCacheContext.Provider>
  );
};

// 创建自定义hook方便使用
export const useServerCache = () => {
  const context = useContext(ServerCacheContext);
  if (!context) {
    throw new Error('useServerCache must be used within a ServerCacheProvider');
  }
  return context;
};