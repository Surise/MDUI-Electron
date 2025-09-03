const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const iconv = require('iconv-lite');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

let mainWindow = null;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1110,
    height: 700,
    minWidth: 1000, // 设置最小宽度
    minHeight: 500, // 设置最小高度
    autoHideMenuBar: true, // 隐藏菜单栏
    frame: false, // 隐藏窗口边框和标题栏
    roundedCorners: true, // 设置窗口为圆角
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
  });

  // and load the index.html of the app.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }

  // Open the DevTools only in development mode.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  return mainWindow;
};

// 写入日志到文件
const writeLogToFile = (message) => {
  // 确保日志文件在可写目录中
  const logPath = path.join(process.cwd(), 'Log.txt');
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  // 检查是否包含端口信息，使用更宽松的正则表达式
  const portMatch = message.match(/Running on port\s*=>\s*(\d+)/);
  if (portMatch && portMatch[1]) {
    const port = portMatch[1];
    console.log(`本地服务器运行在端口: ${port}`);
    // 通知渲染进程端口信息
    if (mainWindow) {
      mainWindow.webContents.send('local-server-output', message);
    }
  }
  
  // 以追加模式写入日志
  fs.appendFile(logPath, logEntry, (err) => {
    if (err) {
      console.error('写入日志文件失败:', err);
    }
  });
};

// IPC事件监听器，处理窗口控制请求
ipcMain.on('minimize-window', (event) => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.minimize();
  }
});

ipcMain.on('maximize-window', (event) => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  }
});

ipcMain.on('close-window', (event) => {
  const window = BrowserWindow.getFocusedWindow();
  if (window) {
    window.close();
  }
});

// IPC事件监听器，处理打开外部URL请求
ipcMain.on('open-external-url', (event, url) => {
  shell.openExternal(url);
});

// IPC事件监听器，检查本地服务器DLL是否存在
ipcMain.handle('check-local-server', (event) => {
  const basePath = process.resourcesPath || path.join(__dirname, 'resources');
  const domainPath = path.join(basePath, 'domain');
  const dllPath = path.join(domainPath, 'Krypton.LocalServer.dll');

  // 检查domain目录是否存在
  if (!fs.existsSync(domainPath)) {
    return {
      exists: false,
      error: 'domain目录不存在',
      path: domainPath
    };
  }
  
  // 检查DLL文件是否存在
  if (!fs.existsSync(dllPath)) {
    return {
      exists: false,
      error: 'Krypton.LocalServer.dll文件不存在',
      path: dllPath
    };
  }
  
  return {
    exists: true,
    path: dllPath
  };
});

let serverProcess = null;

// 解码数据，使用GBK编码
const decodeData = (data) => {
  if (!Buffer.isBuffer(data)) {
    return data.toString();
  }
  
  // 使用GBK解码
  try {
    return iconv.decode(data, 'gbk');
  } catch (gbkError) {
    // 如果GBK解码失败，回退到UTF-8
    try {
      return data.toString('utf8');
    } catch (utf8Error) {
      // 最后的回退方案
      return data.toString();
    }
  }
};

// IPC事件监听器，处理启动本地服务器请求
ipcMain.on('start-local-server', (event) => {
  // 如果服务器已经在运行，则直接返回成功
  if (serverProcess) {
    event.reply('local-server-result', {
      success: true,
      message: '本地服务器已在运行',
      stdout: '',
      stderr: ''
    });
    return;
  }

  const basePath = process.resourcesPath || path.join(__dirname, 'resources');
  const domainPath = path.join(basePath, 'domain');
  const dllPath = path.join(domainPath, 'Krypton.LocalServer.dll');
  let dotnetPath = path.join(basePath, 'dotnet', 'dotnet.exe');

  // 先检查文件是否存在
  if (!fs.existsSync(domainPath)) {
    const errorMsg = 'domain目录不存在';
    writeLogToFile(`[ERROR] ${errorMsg}`);
    event.reply('local-server-result', {
      success: false,
      error: errorMsg,
      stdout: '',
      stderr: ''
    });
    return;
  }

  if (!fs.existsSync(dllPath)) {
    const errorMsg = 'Krypton.LocalServer.dll文件不存在';
    writeLogToFile(`[ERROR] ${errorMsg}`);
    event.reply('local-server-result', {
      success: false,
      error: errorMsg,
      stdout: '',
      stderr: ''
    });
    return;
  }

  // 检查dotnet.exe是否存在，如果不存在则回退到系统默认的dotnet
  if (!fs.existsSync(dotnetPath)) {
    writeLogToFile(`[WARN] 未找到本地dotnet.exe: ${dotnetPath}`);
    dotnetPath = 'dotnet'; // 回退到系统 dotnet
    writeLogToFile(`[INFO] 回退到系统默认dotnet命令`);
  } else {
    writeLogToFile(`[INFO] 找到dotnet.exe: ${dotnetPath}`);
  }

  writeLogToFile(`[INFO] 正在启动服务器: ${dotnetPath} "${dllPath}"`);
  
  try {
    // 使用spawn启动进程
    serverProcess = spawn(dotnetPath, [dllPath], { 
      cwd: domainPath,
      windowsHide: false
    });
    
    // 监听启动信息，如果在短时间内没有错误，则认为启动成功
    let started = false;
    
    // 监听stdout数据 (使用GBK编码)
    serverProcess.stdout.on('data', (data) => {
      const message = decodeData(data);
      console.log(`服务器输出: ${message}`);
      writeLogToFile(`[STDOUT] ${message}`);
      
      // 检查是否包含端口信息并通知渲染进程，使用更宽松的正则表达式
      const portMatch = message.match(/Running on port\s*=>\s*(\d+)/);
      if (portMatch && portMatch[1]) {
        const port = portMatch[1];
        console.log(`本地服务器运行在端口: ${port}`);
        if (mainWindow) {
          mainWindow.webContents.send('local-server-output', message);
        }
      }
      
      // 一旦有输出数据，就认为服务器已启动
      if (!started) {
        started = true;
        event.reply('local-server-result', {
          success: true,
          message: '本地服务器启动成功',
          stdout: message,
          stderr: ''
        });
      }
    });
    
    // 监听stderr数据 (使用GBK编码)
    serverProcess.stderr.on('data', (data) => {
      const message = decodeData(data);
      console.error(`服务器错误: ${message}`);
      writeLogToFile(`[STDERR] ${message}`);
      
      // 检查是否包含端口信息并通知渲染进程，使用更宽松的正则表达式
      const portMatch = message.match(/Running on port\s*=>\s*(\d+)/);
      if (portMatch && portMatch[1]) {
        const port = portMatch[1];
        console.log(`本地服务器运行在端口: ${port}`);
        if (mainWindow) {
          mainWindow.webContents.send('local-server-output', message);
        }
      }
      
      // 如果在启动前就有错误输出，则认为启动失败
      if (!started) {
        event.reply('local-server-result', {
          success: false,
          error: message,
          stdout: '',
          stderr: message
        });
      }
    });
    
    // 监听进程关闭事件
    serverProcess.on('close', (code) => {
      const message = `服务器进程退出，退出码: ${code}`;
      console.log(message);
      writeLogToFile(`[INFO] ${message}`);
      serverProcess = null;
    });
    
    // 监听进程错误事件
    serverProcess.on('error', (error) => {
      const message = `启动服务器进程时出错: ${error.message}`;
      console.error(message);
      writeLogToFile(`[ERROR] ${message}`);
      serverProcess = null;
      
      if (!started) {
        event.reply('local-server-result', {
          success: false,
          error: message,
          stdout: '',
          stderr: message
        });
      }
    });
    
    // 设置一个超时时间，如果在指定时间内没有输出任何内容，则认为启动成功
    setTimeout(() => {
      if (!started) {
        started = true;
        const message = '本地服务器启动成功（无输出）';
        writeLogToFile(`[INFO] ${message}`);
        event.reply('local-server-result', {
          success: true,
          message: message,
          stdout: '',
          stderr: ''
        });
      }
    }, 5000); // 5秒后如果没有错误就认为启动成功
    
  } catch (error) {
    const message = `启动服务器时发生异常: ${error.message}`;
    writeLogToFile(`[ERROR] ${message}`);
    serverProcess = null;
    event.reply('local-server-result', {
      success: false,
      error: message,
      stdout: '',
      stderr: error.toString()
    });
  }
});

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  // 关闭服务器进程
  if (serverProcess) {
    writeLogToFile('[INFO] 应用关闭，正在终止服务器进程');
    serverProcess.kill();
    serverProcess = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // 应用退出前确保日志被写入
  writeLogToFile('[INFO] 应用即将退出');
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});