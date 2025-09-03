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
import 'mdui/components/radio.js';
import 'mdui/components/radio-group.js';
import 'mdui/components/text-field.js';
import { getAvailableRegions } from './AuthService';

const SettingsPage = ({ serverPort }) => {
  const [selectedChip, setSelectedChip] = useState('random'); // 'random' or 'custom'
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [showCustomProxyInputs, setShowCustomProxyInputs] = useState(false);
  const [regionsData, setRegionsData] = useState([]);
  const [groupedRegions, setGroupedRegions] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedRegionInfo, setSelectedRegionInfo] = useState(null);
  
  // 自定义代理IP的状态
  const [customProxyIp, setCustomProxyIp] = useState('');
  const [customProxyPort, setCustomProxyPort] = useState('');
  const [customProxyUsername, setCustomProxyUsername] = useState('');
  const [customProxyPassword, setCustomProxyPassword] = useState('');

  const handleRandomChipClick = () => {
    setSelectedChip('random');
  };

  const handleCustomChipClick = () => {
    setSelectedChip('custom');
  };

  const handleSelectRegionClick = () => {
    setShowRegionSelector(!showRegionSelector);
    if (!showRegionSelector) {
      loadRegionsData();
    }
    setShowCustomProxyInputs(false);
  };

  const handleCustomProxyClick = () => {
    setShowCustomProxyInputs(!showCustomProxyInputs);
    setShowRegionSelector(false);
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
    setShowRegionSelector(false);
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
              actions={<mdui-button variant="text" onClick={handleCustomProxyClick}>配置节点</mdui-button>}
            />
          </div>
          
          {/* 地区选择区域 */}
          {showRegionSelector && (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              marginTop: '24px'
            }}>
              <div style={{ width: '60%' }}>
                <SuCard
                  title="选择地区"
                  body={
                    loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                        <mdui-circular-progress></mdui-circular-progress>
                      </div>
                    ) : (
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        <mdui-radio-group value={selectedRegion} onChange={(e) => handleRegionSelect(e.target.value)}>
                          {Object.entries(groupedRegions).map(([province, cities]) => (
                            <div key={province}>
                              <h3 style={{ margin: '10px 0 5px 0' }}>{province}</h3>
                              <div style={{ 
                                display: 'flex', 
                                flexWrap: 'wrap', 
                                gap: '12px',
                                marginBottom: '12px'
                              }}>
                                {cities.map((item, index) => (
                                  <mdui-radio 
                                    key={index}
                                    value={item.region}
                                    style={{ 
                                      display: 'inline-block',
                                      minWidth: '80px',
                                      padding: '8px 0'
                                    }}
                                  >
                                    {item.city}
                                  </mdui-radio>
                                ))}
                              </div>
                            </div>
                          ))}
                        </mdui-radio-group>
                      </div>
                    )
                  }
                />
              </div>
            </div>
          )}
          
          {/* 自定义代理IP输入区域 */}
          {showCustomProxyInputs && (
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              marginTop: '24px'
            }}>
              <div style={{ width: '60%' }}>
                <SuCard
                  title="配置代理"
                  body={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <mdui-text-field 
                        label="代理IP地址" 
                        value={customProxyIp}
                        onChange={(e) => setCustomProxyIp(e.target.value)}
                      ></mdui-text-field>
                      <mdui-text-field 
                        label="端口" 
                        value={customProxyPort}
                        onChange={(e) => setCustomProxyPort(e.target.value)}
                      ></mdui-text-field>
                      <mdui-text-field 
                        label="用户名" 
                        value={customProxyUsername}
                        onChange={(e) => setCustomProxyUsername(e.target.value)}
                      ></mdui-text-field>
                      <mdui-text-field 
                        label="密码" 
                        type="password"
                        value={customProxyPassword}
                        onChange={(e) => setCustomProxyPassword(e.target.value)}
                      ></mdui-text-field>
                    </div>
                  }
                />
              </div>
            </div>
          )}
        </mdui-tab-panel>
        <mdui-tab-panel slot="panel" value="tab-2">Panel 2</mdui-tab-panel>
      </mdui-tabs>
    </div>
  );
};

export default SettingsPage;
