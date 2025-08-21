const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
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

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  
  return mainWindow;
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
app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
