/**
 * 账号登录认证服务
 * 提供多种登录方式的封装
 */

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