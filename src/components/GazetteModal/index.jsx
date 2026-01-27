// src/components/GazetteModal/index.jsx
import React, { useState, useEffect } from 'react';
import theme from '../../styles/theme.js';

const GazetteModal = ({ gazette, onClose, history = [], playerName = '楚清辞' }) => {
  const [viewMode, setViewMode] = useState('current'); // 'current' or 'history'
  const [selectedHistory, setSelectedHistory] = useState(null);
  
  // 调试日志
  console.log('GazetteModal props:', { gazette, history, hasGazette: !!gazette, historyLength: history.length });
  
  // 高亮玩家相关内容的函数
  const highlightPlayerContent = (text) => {
    if (!text || !playerName) return text;
    
    // 使用正则替换玩家名字，添加红色标记
    const regex = new RegExp(`(${playerName})`, 'g');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      part === playerName ? 
        <span key={index} style={{ color: '#b33', fontWeight: 'bold' }}>{part}</span> : 
        part
    );
  };

  // 如果没有当前报纸但有历史记录，自动切换到历史视图
  useEffect(() => {
    if (!gazette && history.length > 0) {
      setViewMode('history');
    }
  }, [gazette, history]);

  const displayGazette = viewMode === 'current' ? gazette : selectedHistory;

  // 如果没有任何报纸，显示空状态
  const hasNoContent = !gazette && history.length === 0;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <button onClick={onClose} style={styles.closeBtn}>×</button>

        {/* 如果没有任何内容，显示空状态 */}
        {hasNoContent ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📰</div>
            <h3 style={styles.emptyTitle}>暂无邸报</h3>
            <p style={styles.emptyText}>
              还没有生成过邸报，请等待季度末（3、6、9、12月）
            </p>
            <button onClick={onClose} style={styles.emptyBtn}>
              知道了
            </button>
          </div>
        ) : (
          <>
            {/* 切换标签 */}
            <div style={styles.tabBar}>
              <button
                onClick={() => setViewMode('current')}
                style={{
                  ...styles.tab,
                  background: viewMode === 'current' ? theme.colors.primary : theme.colors.parchment,
                  color: viewMode === 'current' ? '#fff' : theme.colors.ink,
                  opacity: !gazette ? 0.5 : 1,
                  cursor: !gazette ? 'not-allowed' : 'pointer'
                }}
                disabled={!gazette}
              >
                📰 本期邸报
              </button>
              <button
                onClick={() => setViewMode('history')}
                style={{
                  ...styles.tab,
                  background: viewMode === 'history' ? theme.colors.primary : theme.colors.parchment,
                  color: viewMode === 'history' ? '#fff' : theme.colors.ink
                }}
              >
                📚 往期回顾 ({history.length})
              </button>
            </div>

            <div style={styles.content}>
          {viewMode === 'current' ? (
            // 当前邸报
            <div style={styles.newspaper}>
              {/* 报头 */}
              <div style={styles.header}>
                <h1 style={styles.title}>修真界邸报</h1>
                <div style={styles.subtitle}>
                  天机阁发行 · 第 {displayGazette.issue} 期
                </div>
                <div style={styles.date}>
                  云澜历 {Math.floor(displayGazette.year)}年 {displayGazette.month}月
                </div>
              </div>

              {/* 天机榜 */}
              {displayGazette.powerRanking && displayGazette.powerRanking.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>【天机榜 - 本季修为前三】</h3>
                  <div style={styles.ranking}>
                    {displayGazette.powerRanking.map((rank, index) => (
                      <div key={index} style={styles.rankItem}>
                        {rank}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 头版头条 */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>【头版头条】</h3>
                <div style={styles.newsContent}>
                  {displayGazette.headlines && displayGazette.headlines.length > 0 ? (
                    displayGazette.headlines.map((news, index) => (
                      <p key={index} style={styles.newsItem}>
                        · {highlightPlayerContent(news)}
                      </p>
                    ))
                  ) : (
                    <p style={styles.placeholder}>近期风平浪静，无大事发生。</p>
                  )}
                </div>
              </div>

              {/* 坊间传闻 */}
              {displayGazette.rumors && displayGazette.rumors.length > 0 && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>【坊间传闻】</h3>
                  <div style={styles.newsContent}>
                    {displayGazette.rumors.map((news, index) => (
                      <p key={index} style={styles.newsItem}>
                        · {highlightPlayerContent(news)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 广告位（彩蛋） */}
              <div style={styles.adSection}>
                <div style={styles.ad}>
                  🗡️ 天机楼：高价回收二手法宝，童叟无欺！
                </div>
                <div style={styles.ad}>
                  💊 丹鼎阁：炼气期特惠丹药，买三送一！
                </div>
              </div>
            </div>
          ) : (
            // 历史回顾
            <div style={styles.historyView}>
              {history.length === 0 ? (
                <div style={styles.emptyHistory}>暂无往期邸报</div>
              ) : selectedHistory ? (
                // 查看某期历史邸报
                <div>
                  <button
                    onClick={() => setSelectedHistory(null)}
                    style={styles.backBtn}
                  >
                    ← 返回列表
                  </button>
                  <div style={styles.newspaper}>
                    <div style={styles.header}>
                      <h1 style={styles.title}>修真界邸报</h1>
                      <div style={styles.subtitle}>
                        第 {selectedHistory.issue} 期（往期）
                      </div>
                      <div style={styles.date}>
                        云澜历 {Math.floor(selectedHistory.year)}年 {selectedHistory.month}月
                      </div>
                    </div>
                    <div style={styles.section}>
                      <h3 style={styles.sectionTitle}>【头版头条】</h3>
                      <div style={styles.newsContent}>
                        {selectedHistory.headlines?.map((news, index) => (
                          <p key={index} style={styles.newsItem}>
                            · {news}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // 历史列表
                <div style={styles.historyList}>
                  {history.map((item, index) => (
                    <div
                      key={index}
                      style={styles.historyItem}
                      onClick={() => setSelectedHistory(item)}
                    >
                      <div style={styles.historyTitle}>
                        第 {item.issue} 期
                      </div>
                      <div style={styles.historyDate}>
                        {Math.floor(item.year)}年 {item.month}月
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: theme.gradients.warm,
    borderRadius: '16px',
    maxWidth: '800px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    border: `3px solid ${theme.colors.border}`
  },
  closeBtn: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    border: 'none',
    background: '#b33',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  tabBar: {
    display: 'flex',
    gap: '10px',
    padding: '15px 20px',
    borderBottom: `2px solid ${theme.colors.border}`
  },
  tab: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.3s'
  },
  content: {
    padding: '20px',
    maxHeight: 'calc(85vh - 100px)',
    overflowY: 'auto'
  },
  newspaper: {
    background: theme.colors.paper,
    padding: '30px',
    borderRadius: '8px',
    boxShadow: `inset 0 0 20px ${theme.colors.shadow}`,
    fontFamily: '"Noto Serif SC", "KaiTi", serif'
  },
  header: {
    textAlign: 'center',
    borderBottom: `3px double ${theme.colors.border}`,
    paddingBottom: '20px',
    marginBottom: '25px'
  },
  title: {
    fontSize: '36px',
    color: theme.colors.primary,
    margin: '0 0 10px 0',
    letterSpacing: '8px',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
  },
  subtitle: {
    fontSize: '14px',
    color: theme.colors.primary,
    marginBottom: '5px'
  },
  date: {
    fontSize: '12px',
    color: theme.colors.muted
  },
  section: {
    marginBottom: '25px',
    padding: '15px',
    background: theme.gradients.subtle,
    borderRadius: '8px',
    border: `1px solid ${theme.colors.border}`
  },
  sectionTitle: {
    fontSize: '20px',
    color: theme.colors.primary,
    marginBottom: '15px',
    borderBottom: `2px solid ${theme.colors.border}`,
    paddingBottom: '8px'
  },
  ranking: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  rankItem: {
    fontSize: '16px',
    padding: '8px',
    background: theme.colors.paper,
    borderRadius: '4px',
    border: `1px solid ${theme.colors.border}`
  },
  newsContent: {
    fontSize: '15px',
    lineHeight: '1.8',
    color: theme.colors.ink
  },
  newsItem: {
    margin: '10px 0',
    paddingLeft: '15px',
    textIndent: '0'
  },
  placeholder: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  adSection: {
    marginTop: '30px',
    padding: '15px',
    background: theme.gradients.subtle,
    borderRadius: '8px',
    border: `2px dashed ${theme.colors.border}`
  },
  ad: {
    fontSize: '12px',
    color: theme.colors.primary,
    marginBottom: '5px'
  },
  historyView: {
    minHeight: '400px'
  },
  historyList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '15px'
  },
  historyItem: {
    padding: '20px',
    background: theme.colors.paper,
    borderRadius: '8px',
    border: `2px solid ${theme.colors.border}`,
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: `0 4px 12px ${theme.colors.shadow}`
    }
  },
  historyTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: '8px'
  },
  historyDate: {
    fontSize: '12px',
    color: theme.colors.primary
  },
  emptyHistory: {
    textAlign: 'center',
    padding: '50px',
    color: '#999',
    fontSize: '16px'
  },
  backBtn: {
    marginBottom: '15px',
    padding: '8px 16px',
    background: '#8d6e63',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  // 空状态样式
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 40px',
    minHeight: '400px'
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    opacity: 0.5
  },
  emptyTitle: {
    fontSize: '24px',
    color: theme.colors.primary,
    marginBottom: '10px'
  },
  emptyText: {
    fontSize: '14px',
    color: theme.colors.muted,
    textAlign: 'center',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  emptyBtn: {
    padding: '10px 30px',
    background: theme.colors.primary,
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  }
};

export default GazetteModal;
