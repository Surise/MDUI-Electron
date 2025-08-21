import React from 'react';
import 'mdui/components/card.js';

/**
 * 标准化卡片组件(SuCard)
 * @param {string} title - 卡片标题
 * @param {string} subtitle - 卡片副标题
 * @param {ReactNode} body - 卡片内容主体
 * @param {boolean} clickable - 是否可点击
 * @param {object} style - 自定义样式
 * @param {ReactNode} actions - 卡片操作区域内容
 */
const SuCard = ({ title, subtitle, body, clickable = false, style = {}, actions }) => {
  const cardStyle = {
    minWidth: '280px',
    ...style
  };

  const headerStyle = {
    padding: '16px 16px 0 16px'
  };

  const titleStyle = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: '24px',
    color: 'var(--mdui-color-on-surface, #000)'
  };

  const subtitleStyle = {
    margin: '4px 0 0 0',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '20px',
    color: 'var(--mdui-color-on-surface-variant, rgba(0, 0, 0, 0.7))'
  };

  const contentStyle = {
    padding: '16px'
  };

  const actionsStyle = {
    padding: '8px 16px 16px 16px',
    display: 'flex',
    justifyContent: 'flex-end',
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0
  };

  return (
    <mdui-card 
      style={cardStyle}
      clickable={clickable}
    >
      <div style={headerStyle}>
        <h2 style={titleStyle}>{title}</h2>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
      </div>
      <div style={{ ...contentStyle, paddingBottom: actions ? '56px' : '16px' }}>
        {body}
      </div>
      {actions && (
        <div style={actionsStyle}>{actions}</div>
      )}
    </mdui-card>
  );
};

export default SuCard;