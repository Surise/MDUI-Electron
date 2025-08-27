const { contextBridge, ipcRenderer } = require('electron');
const { shell } = require('electron');

// 安全地暴露 IPC 方法给渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    send: (channel, data) => {
      // 白名单 channels
      const validChannels = ['minimize-window', 'maximize-window', 'close-window', 'start-local-server', 'open-external-url'];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    invoke: (channel, data) => {
      // 白名单 channels
      const validChannels = ['check-local-server'];
      if (validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
    },
    on: (channel, func) => {
      const validChannels = ['minimize-window', 'maximize-window', 'close-window', 'local-server-result', 'local-server-output', 'open-external-url'];
      if (validChannels.includes(channel)) {
        // 从 ipcRenderer 接收消息时，使用预先验证过的监听器
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    removeAllListeners: (channel) => {
      const validChannels = ['minimize-window', 'maximize-window', 'close-window', 'local-server-result', 'local-server-output', 'open-external-url'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeAllListeners(channel);
      }
    }
  }
});