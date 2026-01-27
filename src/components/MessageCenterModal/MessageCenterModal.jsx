import React, { useState, useMemo } from 'react';
import { MESSAGE_TYPES } from '../../game/messageCenter';
import './MessageCenterModal.css';

/**
 * 传书馆弹窗组件
 * 统一展示所有文字剧情类信息
 */
const MessageCenterModal = ({ isOpen, onClose, messages, onMarkAsRead, onDeleteMessage }) => {
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // all, letter, obituary

  // 过滤消息
  const filteredMessages = useMemo(() => {
    if (activeFilter === 'all') return messages;
    if (activeFilter === 'letter') {
      return messages.filter(m => m.type === MESSAGE_TYPES.LETTER || m.type === MESSAGE_TYPES.DEPARTURE || m.type === MESSAGE_TYPES.ACHIEVEMENT);
    }
    if (activeFilter === 'obituary') {
      return messages.filter(m => m.type === MESSAGE_TYPES.OBITUARY);
    }
    return messages;
  }, [messages, activeFilter]);

  // 选中的消息
  const selectedMessage = useMemo(() => {
    return filteredMessages.find(m => m.id === selectedMessageId);
  }, [filteredMessages, selectedMessageId]);

  // 处理消息点击
  const handleMessageClick = (message) => {
    setSelectedMessageId(message.id);
    if (!message.isRead) {
      onMarkAsRead(message.id);
    }
  };

  // 关闭弹窗
  const handleClose = () => {
    setSelectedMessageId(null);
    onClose();
  };

  // 获取消息类型的中文名
  const getMessageTypeLabel = (type) => {
    switch (type) {
      case MESSAGE_TYPES.OBITUARY:
        return '绝笔';
      case MESSAGE_TYPES.LETTER:
        return '家书';
      case MESSAGE_TYPES.DEPARTURE:
        return '离别';
      case MESSAGE_TYPES.ACHIEVEMENT:
        return '喜讯';
      default:
        return '消息';
    }
  };

  // 获取背景样式类
  const getBackgroundClass = (type) => {
    if (type === MESSAGE_TYPES.OBITUARY) {
      return 'message-background-obituary';
    }
    return 'message-background-letter';
  };

  if (!isOpen) return null;

  return (
    <div className="message-center-overlay" onClick={handleClose}>
      <div className="message-center-modal" onClick={(e) => e.stopPropagation()}>
        {/* 标题栏 */}
        <div className="message-center-header">
          <h2>📜 传书馆</h2>
          <button className="close-btn" onClick={handleClose}>✕</button>
        </div>

        {/* 分类标签 */}
        <div className="message-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            全部 ({messages.length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'letter' ? 'active' : ''}`}
            onClick={() => setActiveFilter('letter')}
          >
            家书 ({messages.filter(m => m.type !== MESSAGE_TYPES.OBITUARY).length})
          </button>
          <button
            className={`filter-btn ${activeFilter === 'obituary' ? 'active' : ''}`}
            onClick={() => setActiveFilter('obituary')}
          >
            绝笔 ({messages.filter(m => m.type === MESSAGE_TYPES.OBITUARY).length})
          </button>
          
          {/* 一键已读按钮 */}
              {messages.some(m => !m.isRead) && (
            <button
              className="filter-btn mark-all-read-btn"
              onClick={() => {
                messages.forEach(m => {
                  if (!m.isRead) {
                    onMarkAsRead(m.id);
                  }
                });
              }}
              style={{
                marginLeft: 'auto',
                background: '#7AA893',
                color: 'white'
              }}
            >
              ✓ 全部已读
            </button>
          )}
        </div>

        <div className="message-center-content">
          {/* 左侧：消息列表 */}
          <div className="message-list">
            {filteredMessages.length === 0 ? (
              <div className="empty-message">
                <p>📭</p>
                <p>暂无消息</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${selectedMessageId === message.id ? 'selected' : ''} ${
                    !message.isRead ? 'unread' : ''
                  } ${message.type === MESSAGE_TYPES.OBITUARY ? 'obituary' : ''}`}
                  onClick={() => handleMessageClick(message)}
                >
                  {/* 未读标记 */}
                  {!message.isRead && <span className="unread-dot"></span>}

                  {/* 发件人头像占位 */}
                  <div className="message-avatar">
                    {message.type === MESSAGE_TYPES.OBITUARY ? '🕯️' : '✉️'}
                  </div>

                  {/* 消息信息 */}
                  <div className="message-info">
                    <div className="message-sender">
                      {message.senderName}
                      <span className="message-type-label">{getMessageTypeLabel(message.type)}</span>
                    </div>
                    <div className="message-title">{message.title}</div>
                    <div className="message-time">
                      云澜历 {Math.floor(message.timestamp.year)}年{message.timestamp.month}月
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 右侧：阅读区域 */}
          <div className={`message-reader ${selectedMessage ? getBackgroundClass(selectedMessage.type) : ''}`}>
            {!selectedMessage ? (
              <div className="reader-placeholder">
                <p>📖</p>
                <p>请选择一封信件</p>
              </div>
            ) : (
              <div className="reader-content">
                {/* 信件标题 */}
                <div className="reader-header">
                  <h3>{selectedMessage.title}</h3>
                  <div className="reader-meta">
                    <span>{selectedMessage.senderName}</span>
                    <span>·</span>
                    <span>
                      云澜历 {Math.floor(selectedMessage.timestamp.year)}年{selectedMessage.timestamp.month}月
                    </span>
                  </div>
                </div>

                {/* 信件内容 */}
                <div className="reader-body">
                  {selectedMessage.content ? (
                    <pre className="message-content">{selectedMessage.content}</pre>
                  ) : (
                    <p className="content-loading">内容生成中...</p>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="reader-actions">
                  {selectedMessage.type === MESSAGE_TYPES.OBITUARY ? (
                    <>
                      <button className="action-btn secondary">🕯️ 缅怀</button>
                      <button
                        className="action-btn danger"
                        onClick={() => {
                          if (window.confirm('确定要删除这封绝笔吗？')) {
                            onDeleteMessage(selectedMessage.id);
                            setSelectedMessageId(null);
                          }
                        }}
                      >
                        删除
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="action-btn secondary">✍️ 回信</button>
                      <button
                        className="action-btn"
                        onClick={() => {
                          onDeleteMessage(selectedMessage.id);
                          setSelectedMessageId(null);
                        }}
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageCenterModal;
