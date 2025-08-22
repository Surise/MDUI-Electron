import React from 'react';
import 'mdui/components/tabs.js';
import 'mdui/components/tab.js';
import 'mdui/components/tab-panel.js';
import SuCard from './SuCard';
const SettingsPage = () => {
  return (
    <div style={{ padding: '24px', width: '100%', height: '100%' }}>
      <h1>设置</h1>
      <mdui-tabs value="tab-1" full-width>
        <mdui-tab value="tab-1">基本设置</mdui-tab>
        <mdui-tab value="tab-2">代理设置</mdui-tab>
        <mdui-tab value="tab-3">高级设置</mdui-tab>

        <mdui-tab-panel slot="panel" value="tab-1">Panel 1</mdui-tab-panel>
        <mdui-tab-panel slot="panel" value="tab-2">Panel 2</mdui-tab-panel>
        <mdui-tab-panel slot="panel" value="tab-3">Panel 3</mdui-tab-panel>
      </mdui-tabs>
    </div>
  );
};

export default SettingsPage;