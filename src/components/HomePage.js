import React from 'react';
import 'mdui/components/card.js';
import 'mdui/components/button.js';
import SuCard from './SuCard';

const HomePage = () => {
  return (
    <div style={{ padding: '24px', width: '100%', height: '100%' }}>
      <h1>主页</h1>
      <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
        <SuCard
          title="公告"
          subtitle="Topic"
          clickable
          body={
            <>
              <p>愿我终生写诗</p>
              <p>也终生不明白什么是诗</p>
              <p>只让写作这件事自然而然发生</p>
              <p>这意味这一切</p>
            </>
          }
          actions={<mdui-button variant="text">管理</mdui-button>}
        />
        
        <SuCard
          title="当前套餐"
          subtitle="Cup"
          clickable
          body={
            <>
              <p>总用量: 100GB</p>
              <p>已使用: 30GB</p>
              <p>可用: 70GB</p>
            </>
          }
          actions={<mdui-button variant="text">查看</mdui-button>}
        />
      </div>
    </div>
  );
};

export default HomePage;