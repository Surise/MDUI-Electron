/**
 * 账号登录认证服务
 * 提供多种登录方式的封装
 */

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