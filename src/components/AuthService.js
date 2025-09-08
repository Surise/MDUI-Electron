/**
 * 账号登录认证服务
 * 提供多种登录方式的封装
 */
import { useUser } from './UserContext';
/**
 * 检查在线账户列表
 * @param {string} serverPort - 服务器端口
 * @returns {Promise<boolean>} 如果有在线账户返回true，否则返回false
 */
export async function checkOnlineAccounts(serverPort) {
  try {
    const response = await fetch(`http://127.0.0.1:${serverPort}/Manager/Account/Online/List`);
    const result = await response.json();
    
    // 检查响应是否成功并且数据不为空
    if (result.code === 0 && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('检查在线账户列表失败:', error);
    return false;
  }
}

/**
 * 获取游戏列表
 * @param {string} serverPort - 服务器端口
 * @param {number} total - 需要获取的总数量
 * @param {number} batchSize - 每批获取的数量
 * @param {function} onProgress - 进度回调函数
 * @returns {Promise<Array>} 游戏列表数据
 */
export async function fetchGameList(serverPort, total = 250, batchSize = 50, onProgress = null) {
  const allData = [];
  
  try {
    // 分批获取数据
    const batchCount = Math.ceil(total / batchSize);
    for (let i = 0; i < batchCount; i++) {
      const offset = i * batchSize;
      const length = Math.min(batchSize, total - offset);
      
      const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Item/NetGame/List`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          offset,
          length
        })
      });
      
      const result = await response.json();
      
      // 检查响应是否成功
      if (result.code === 0 && result.data && result.data.entities && Array.isArray(result.data.entities)) {
        allData.push(...result.data.entities);
      } else {
        console.error(`获取游戏列表失败 (批次 ${i + 1}):`, result.msg);
        // 如果某一批次失败，可以选择继续获取其他批次或直接返回已获取的数据
      }
      
      // 调用进度回调
      if (onProgress) {
        onProgress(i + 1, batchCount);
      }
    }
    
    return allData;
  } catch (error) {
    console.error('获取游戏列表时发生错误:', error);
    return allData; // 返回已获取的数据
  }
}

/**
 * 获取可用区域列表
 * @param {string} serverPort - 服务器端口
 * @returns {Promise<Array>} 可用区域数据
 */
export async function getAvailableRegions(serverPort) {
  try {
    const response = await fetch(`http://127.0.0.1:${serverPort}/Func/CloudProxy/GetAvailableRegions`);
    const result = await response.json();
    
    // 检查响应是否成功并返回数据
    if (result.code === 0 && result.data && Array.isArray(result.data)) {
      return result.data;
    }
    
    return [];
  } catch (error) {
    console.error('获取可用区域列表失败:', error);
    return [];
  }
}

/**
 * 4399登录认证
 * @param {string} serverPort - 服务器端口
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @param {string} captcha - 验证码（可选）
 * @returns {Promise<Object>} 登录响应数据
 */
export async function login4399(serverPort, account, password, captcha = '') {
  const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Auth/4399`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      account,
      password,
      captcha
    })
  });
  
  return await response.json();
}

/**
 * SAuth登录认证
 * @param {string} serverPort - 服务器端口
 * @param {string} sauth - SAuth令牌
 * @returns {Promise<Object>} 登录响应数据
 */
export async function loginSAuth(serverPort, sauth) {
  const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Auth/SAuth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sauth
    })
  });
  
  return await response.json();
}

/**
 * 网易官方账号登录认证
 * @param {string} serverPort - 服务器端口
 * @param {string} account - 账号
 * @param {string} password - 密码
 * @param {string} deviceID - 设备ID（可选）
 * @param {string} deviceKey - 设备密钥（可选）
 * @returns {Promise<Object>} 登录响应数据
 */
export async function loginOfficial(serverPort, account, password, deviceID = '', deviceKey = '') {
  const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Auth/Official`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      account,
      password,
      deviceID,
      deviceKey
    })
  });
  
  return await response.json();
}

/**
 * 获取游戏中角色列表
 * @param {string} serverPort - 服务器端口
 * @param {number} userId - 用户ID，来自UserContext中的userData
 * @param {number} gameId - 游戏ID
 * @param {number} gameType - 游戏类型
 * @param {number} offset - 偏移量，默认为0
 * @param {number} length - 获取数量，默认为3
 * @returns {Promise<Object>} 角色列表响应数据
 */
export async function fetchGameCharacters(serverPort, userId, gameId, gameType, offset = 0, length = 3) {
  const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Character/NetGame/List`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      offset,
      length,
      user_id: userId,
      game_id: gameId,
      game_type: gameType
    })
  });
  
  return await response.json();
}

/**
 * 添加游戏角色
 * @param {string} serverPort - 服务器端口
 * @param {number} gameId - 游戏ID
 * @param {string} name - 角色名称
 * @returns {Promise<Object>} 添加角色响应数据
 */
export async function addGameCharacter(serverPort, gameId, name) {
  const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Character/NetGame/Add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      game_id: gameId,
      name: name
    })
  });
  
  return await response.json();
}

/**
 * 获取游戏地址信息
 * @param {string} serverPort - 服务器端口
 * @param {number} itemId - 商品ID
 * @returns {Promise<{ip: string, port: number} | null>} IP和端口信息，失败时返回null
 */
export async function fetchGameAddress(serverPort, serverItemId) {
  try {
    // 添加参数验证
    if (!serverPort) {
      console.error('服务器端口不能为空');
      return null;
    }
    
    if (!serverItemId) {
      console.error('商品ID不能为空');
      return null;
    }

    console.log('发送请求到地址:', `http://127.0.0.1:${serverPort}/Netease/Game/NetGame/Address`);
    console.log('发送的数据:', { item_id: serverItemId });

    const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Game/NetGame/Address`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        item_id: serverItemId
      })
    });

    console.log('响应状态:', response.status);
    console.log('响应状态文本:', response.statusText);

    // 检查响应状态
    if (!response.ok) {
      console.error(`HTTP错误! 状态: ${response.status}`);
      return null;
    }

    const result = await response.json();
    console.log('响应数据:', result);

    // 检查响应是否成功并包含所需数据
    if (result.code === 0 && result.data && result.data.ip && result.data.port) {
      return {
        ip: result.data.ip,
        port: result.data.port
      };
    }

    console.error('获取游戏地址信息失败:', result.msg || '未知错误');
    return null;
  } catch (error) {
    console.error('获取游戏地址信息时发生错误:', error);
    return null;
  }
}

/**
 * 获取游戏版本名称
 * @param {string} serverPort - 服务器端口
 * @param {number} itemId - 商品ID
 * @returns {Promise<string|null>} 版本名称，失败时返回null
 */
export async function fetchGameVersionName(serverPort, serverItemId) {
  try {
    const versionResponse = await fetch(`http://127.0.0.1:${serverPort}/Netease/Game/Version`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        item_id: serverItemId
      })
    });

    const versionResult = await versionResponse.json();

    if (versionResult.code !== 0 || !versionResult.data || !Array.isArray(versionResult.data) || versionResult.data.length === 0) {
      console.error('获取游戏版本信息失败:', versionResult.msg || '未知错误');
      return null;
    }

    const mcVersionId = versionResult.data[0].mc_version_id;
    
    if (mcVersionId === 12) {
      return '1.8.9';
    }

    const versionsResponse = await fetch('https://x19apigatewayobt.nie.netease.com/mc-version');
    const versionsResult = await versionsResponse.json();

    if (versionsResult.code !== 0 || !versionsResult.entities || !Array.isArray(versionsResult.entities)) {
      console.error('获取版本列表失败:', versionsResult.message || '未知错误');
      return null;
    }

    const matchedVersion = versionsResult.entities.find(entity => 
      entity.entity_id === mcVersionId.toString()
    );

    if (matchedVersion) {
      return matchedVersion.name;
    } else {
      console.error(`未找到匹配的版本名称，mc_version_id: ${mcVersionId}`);
      return null;
    }
  } catch (error) {
    console.error('获取游戏版本名称时发生错误:', error);
    return null;
  }
}

/**
 * 发送游戏加入预请求
 * @param {string} serverPort - 服务器端口
 * @param {string} gameId - 游戏ID
 * @param {string} roleName - 角色名称
 * @returns {Promise<string|null>} 成功时返回data字段，失败时返回null
 */
export async function sendGameJoinPreRequest(serverPort, serverItemId, roleName) {
  try {
    const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Game/Join/Pre`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        gameId: serverItemId,
        roleName: roleName,
        gameType: 2
      })
    });

    const result = await response.json();

    // 检查响应是否成功，如果成功则返回data字段
    if (result.code === 0) {
      return result.msg;
    } else {
      console.error('发送游戏加入预请求失败:', result.msg || '未知错误');
      return null;
    }
  } catch (error) {
    console.error('发送游戏加入预请求时发生错误:', error);
    return null;
  }
}

/**
 * 启动游戏代理
 * @param {string} serverPort - 服务器端口
 * @param {string} serverItemId - 服务器商品ID
 * @param {string} roleId - 角色ID
 * @param {string} roleName - 角色名称
 * @param {string} serverIp - 服务器IP
 * @param {number} port - 服务器端口
 * @returns {Promise<Object|null>} 成功时返回data对象，失败时返回null
 */
export async function startGameProxy(serverPort, serverItemId, roleId, roleName, serverIp, port) {
  try {
    const response = await fetch(`http://127.0.0.1:${serverPort}/Netease/Game/Proxy/Start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serverItemId: serverItemId,
        roleId: roleId,
        roleName: roleName,
        serverIp: serverIp,
        serverPort: port
      })
    });

    const result = await response.json();

    // 检查响应是否成功，如果成功则返回data字段
    if (result.code === 0) {
      return result.data;
    } else {
      console.error('启动游戏代理失败:', result.msg || '未知错误');
      return null;
    }
  } catch (error) {
    console.error('启动游戏代理时发生错误:', error);
    return null;
  }
}

/**
 * 执行游戏代理启动的主流程
 * @param {string} serverPort - 服务器端口
 * @param {string} serverItemId - 服务器商品ID，同时用作gameId和itemId
 * @param {string} roleId - 角色ID
 * @param {string} roleName - 角色名称
 * @param {string} gameId - 游戏ID
 * @param {number} itemId - 商品ID
 * @returns {Promise<Object|null>} 成功时返回最终的代理数据，失败时返回null
 */
export async function ProxyStartDoMain(serverPort, serverItemId, roleId, roleName) {
  try {
    console.log('开始执行游戏代理启动的主流程...',
      + `\nserverPort: ${serverPort}`
      + `\nserverItemId: ${serverItemId}`
      + `\nroleId: ${roleId}`
      + `\nroleName: ${roleName}`
    );
    // 第一步：调用fetchGameAddress获取ip和port
    const addressInfo = await fetchGameAddress(serverPort, serverItemId);
    if (!addressInfo) {
      console.error('获取游戏地址信息失败');
      return null;
    }

    const { ip, port } = addressInfo;

    // 第二步：调用fetchGameVersionName获取游戏版本号
    const versionName = await fetchGameVersionName(serverPort, serverItemId);
    if (!versionName) {
      console.error('获取游戏版本名称失败');
      return null;
    }

    // 第三步：调用sendGameJoinPreRequest
    const joinPreData = await sendGameJoinPreRequest(serverPort, serverItemId, roleName);
    if (!joinPreData) {
      console.error('发送游戏加入预请求失败');
      return null;
    }

    // 第四步：调用startGameProxy
    const proxyData = await startGameProxy(serverPort, serverItemId, roleId, roleName, ip, port);
    if (!proxyData) {
      console.error('启动游戏代理失败');
      return null;
    }

    // 返回最终的代理数据
    return proxyData;
  } catch (error) {
    console.error('执行代理启动主流程时发生错误:', error);
    return null;
  }
}
