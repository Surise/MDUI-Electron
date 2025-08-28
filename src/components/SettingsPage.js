import React, { useState, useEffect } from 'react';
import 'mdui/components/tabs.js';
import 'mdui/components/tab.js';
import 'mdui/components/tab-panel.js';
import SuCard from './SuCard';
import 'mdui/components/switch.js';
import 'mdui/components/chip.js';
import 'mdui/components/dialog.js';
import 'mdui/components/list.js';
import 'mdui/components/list-item.js';
import 'mdui/components/button.js';
import 'mdui/components/circular-progress.js';
import { getAvailableRegions } from './AuthService';

const SettingsPage = () => {
  const [selectedChip, setSelectedChip] = useState('random'); // 'random' or 'custom'
  const [isRegionDialogOpen, setIsRegionDialogOpen] = useState(false);
  const [regionsData, setRegionsData] = useState([]);
  const [groupedRegions, setGroupedRegions] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedRegionInfo, setSelectedRegionInfo] = useState(null);

  const handleRandomChipClick = () => {
    setSelectedChip('random');
  };

  const handleCustomChipClick = () => {
    setSelectedChip('custom');
  };

  const handleSelectRegionClick = () => {
    setIsRegionDialogOpen(true);
    loadRegionsData();
  };

  const loadRegionsData = async () => {
    if (regionsData.length > 0) return; // 如果已有数据则不重复加载
    
    setLoading(true);
    try {
      // 使用真实API调用
      const data = await getAvailableRegions(serverPort);
      
      // 过滤掉city为空的项
      const filteredData = data.filter(item => item.city !== '');
      
      // 按省份分组数据
      const grouped = {};
      filteredData.forEach(item => {
        if (!grouped[item.prov]) {
          grouped[item.prov] = [];
        }
        grouped[item.prov].push(item);
      });
      
      setRegionsData(filteredData);
      setGroupedRegions(grouped);
    } catch (error) {
      console.error('加载地区数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionSelect = (region) => {
    const regionInfo = regionsData.find(item => item.region === region);
    setSelectedRegion(region);
    setSelectedRegionInfo(regionInfo);
    setIsRegionDialogOpen(false);
  };

  const closeRegionDialog = () => {
    setIsRegionDialogOpen(false);
  };

  return (
    <div style={{ padding: '24px', width: '100%', height: '100%' }}>
      <h1>设置</h1>
      <mdui-tabs value="tab-1" full-width>
        <mdui-tab value="tab-1">代理设置</mdui-tab>
        <mdui-tab value="tab-2">高级设置</mdui-tab>

        <mdui-tab-panel slot="panel" value="tab-1">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-start',
            gap: '24px',
            marginTop: '24px',
            height: '100%'
          }}>
            <SuCard
              title="随机代理IP"
              subtitle="Range_Mode"
              body={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <mdui-chip 
                    selectable 
                    selected={selectedChip === 'random'}
                    selected-icon="favorite"
                    onClick={handleRandomChipClick}
                  >
                    选我
                  </mdui-chip>
                  {selectedRegionInfo && (
                    <mdui-chip>{selectedRegionInfo.city}</mdui-chip>
                  )}
                </div>
              }
              actions={<mdui-button variant="text" onClick={handleSelectRegionClick}>选择节点</mdui-button>}
            />
            <SuCard
              title="自定义代理IP"
              subtitle="Custom_Mode"
              body={
                <mdui-chip 
                  selectable 
                  selected={selectedChip === 'custom'}
                  selected-icon="favorite"
                  onClick={handleCustomChipClick}
                >
                  选我
                </mdui-chip>
              }
              actions={<mdui-button variant="text">配置节点</mdui-button>}
            />
          </div>
        </mdui-tab-panel>
        <mdui-tab-panel slot="panel" value="tab-2">Panel 2</mdui-tab-panel>
      </mdui-tabs>
      
      {/* 地区选择对话框 */}
      <mdui-dialog 
        open={isRegionDialogOpen}
        onClosed={closeRegionDialog}
        style={{ width: '80%', maxWidth: '600px' }}
      >
        <div style={{ padding: '20px' }}>
          <h2 style={{ marginTop: 0 }}>选择地区</h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <mdui-circular-progress></mdui-circular-progress>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Object.entries(groupedRegions).map(([province, cities]) => (
                <div key={province}>
                  <h3 style={{ margin: '10px 0 5px 0' }}>{province}</h3>
                  <mdui-list>
                    {cities.map((item, index) => (
                      <mdui-list-item 
                        key={index}
                        onClick={() => handleRegionSelect(item.region)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.city}
                      </mdui-list-item>
                    ))}
                  </mdui-list>
                </div>
              ))}
            </div>
          )}
        </div>
        <div slot="action">
          <mdui-button variant="text" onClick={closeRegionDialog}>取消</mdui-button>
        </div>
      </mdui-dialog>
    </div>
  );
};

export default SettingsPage;