import React from 'react';
import 'mdui/components/navigation-rail.js';
import 'mdui/components/navigation-rail-item.js';
import 'mdui/components/button-icon.js';
import 'mdui/components/fab.js';

const NavigationRail = ({ onPageChange, showLabels, onToggleLabels }) => {
  return (
    <mdui-navigation-rail divider contained>
      <mdui-button-icon lowered icon="menu" slot="top" onClick={onToggleLabels}></mdui-button-icon>
      <mdui-navigation-rail-item 
        onClick={() => onPageChange('home')}
        icon="home">
        {showLabels ? '主页' : ''}
      </mdui-navigation-rail-item>
      <mdui-navigation-rail-item 
        onClick={() => onPageChange('connect')}
        icon="link">
        {showLabels ? '连接' : ''}
      </mdui-navigation-rail-item>
      <mdui-navigation-rail-item 
        onClick={() => onPageChange('settings')}
        icon="settings">
        {showLabels ? '设置' : ''}
      </mdui-navigation-rail-item>
      <mdui-navigation-rail-item 
        onClick={() => onPageChange('profile')}
        icon="person_outline">
        {showLabels ? '我的' : ''}
      </mdui-navigation-rail-item>
    </mdui-navigation-rail>
  );
};

export default NavigationRail;