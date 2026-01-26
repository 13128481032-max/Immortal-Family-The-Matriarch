// src/components/Modals/NpcLogModal.jsx
import { useState } from 'react';
import { getVisibleLogs, LOG_TYPE } from '../../game/npcLogSystem.js';
import './NpcLogModal.css';

/**
 * NPC 日志查看模态框
 * 以第一人称形式展示 NPC 的生活日志
 */
export default function NpcLogModal({ npc, onClose, playerAffection = 0 }) {
  const [filterType, setFilterType] = useState('ALL'); // ALL | INTERACTION | STATE_CHANGE | DAILY

  if (!npc) return null;

  // 获取可见的日志（根据好感度过滤私密内容）
  const visibleLogs = getVisibleLogs(npc, playerAffection);
  
  // 根据类型过滤
  const filteredLogs = filterType === 'ALL' 
    ? visibleLogs 
    : visibleLogs.filter(log => log.type === filterType);

  // 统计各类型日志数量
  const counts = {
    all: visibleLogs.length,
    interaction: visibleLogs.filter(l => l.type === LOG_TYPE.INTERACTION).length,
    stateChange: visibleLogs.filter(l => l.type === LOG_TYPE.STATE_CHANGE).length,
    daily: visibleLogs.filter(l => l.type === LOG_TYPE.DAILY).length
  };

  // 根据类型获取图标和颜色
  const getTypeIcon = (type) => {
    switch (type) {
      case LOG_TYPE.INTERACTION:
        return { icon: '💬', color: '#4CAF50', label: '互动' };
      case LOG_TYPE.STATE_CHANGE:
        return { icon: '⚡', color: '#FF5722', label: '大事' };
      case LOG_TYPE.DAILY:
        return { icon: '📖', color: '#2196F3', label: '日常' };
      default:
        return { icon: '📝', color: '#9E9E9E', label: '其他' };
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="npc-log-modal" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="log-modal-header">
          <div className="log-modal-title">
            <h2>{npc.name} 的日志</h2>
            <p className="log-modal-subtitle">
              {npc.gender === '女' ? '她' : '他'}的生活轨迹...
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 过滤器 */}
        <div className="log-filter-bar">
          <button 
            className={`filter-btn ${filterType === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterType('ALL')}
          >
            📚 全部 ({counts.all})
          </button>
          <button 
            className={`filter-btn ${filterType === LOG_TYPE.INTERACTION ? 'active' : ''}`}
            onClick={() => setFilterType(LOG_TYPE.INTERACTION)}
          >
            💬 互动 ({counts.interaction})
          </button>
          <button 
            className={`filter-btn ${filterType === LOG_TYPE.STATE_CHANGE ? 'active' : ''}`}
            onClick={() => setFilterType(LOG_TYPE.STATE_CHANGE)}
          >
            ⚡ 大事 ({counts.stateChange})
          </button>
          <button 
            className={`filter-btn ${filterType === LOG_TYPE.DAILY ? 'active' : ''}`}
            onClick={() => setFilterType(LOG_TYPE.DAILY)}
          >
            📖 日常 ({counts.daily})
          </button>
        </div>

        {/* 日志列表 */}
        <div className="log-content">
          {filteredLogs.length === 0 ? (
            <div className="log-empty">
              <p>📭</p>
              <p>暂无日志记录</p>
              {playerAffection < 80 && visibleLogs.length < npc.logs?.length && (
                <p className="log-hint">💡 提升好感度可以查看更多私密日志</p>
              )}
            </div>
          ) : (
            <div className="log-list">
              {filteredLogs.map((log, index) => {
                const typeInfo = getTypeIcon(log.type);
                return (
                  <div 
                    key={`${log.timestamp}-${index}`} 
                    className={`log-entry ${log.isSecret ? 'secret' : ''}`}
                  >
                    <div className="log-header">
                      <span 
                        className="log-type-badge" 
                        style={{ backgroundColor: typeInfo.color }}
                      >
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <span className="log-date">
                        天元 {log.year} 年 {log.month} 月
                      </span>
                      {log.isSecret && (
                        <span className="secret-badge" title="私密日志">🔒</span>
                      )}
                    </div>
                    <div className="log-text">
                      {log.content}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 底部提示 */}
        {playerAffection < 80 && npc.logs?.length > visibleLogs.length && (
          <div className="log-footer-hint">
            💡 好感度达到 80+ 可查看更多私密日志
          </div>
        )}
      </div>
    </div>
  );
}
