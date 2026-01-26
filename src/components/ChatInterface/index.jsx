import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToAI } from '../../services/aiService';
import { buildSystemPrompt } from '../../services/promptBuilder';

/**
 * AI 聊天界面组件
 * 为 NPC 提供基于 LLM 的智能对话能力
 */
const ChatInterface = ({ npc, player, apiKey, apiUrl, gameState = {} }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  // 初始化：构建 System Prompt 并加载历史记录
  useEffect(() => {
    const systemPrompt = {
      role: "system",
      content: buildSystemPrompt(npc, player, gameState)
    };
    
    // 尝试从 localStorage 加载历史记录
    const savedHistory = loadChatHistory(npc.id);
    
    if (savedHistory && savedHistory.length > 0) {
      // 更新 system prompt 但保留历史对话
      setMessages([systemPrompt, ...savedHistory.filter(m => m.role !== 'system')]);
    } else {
      setMessages([systemPrompt]);
    }
  }, [npc.id, npc, player, gameState]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 保存聊天记录
  useEffect(() => {
    if (messages.length > 1) { // 至少有一条非 system 消息才保存
      saveChatHistory(npc.id, messages.filter(m => m.role !== 'system'));
    }
  }, [messages, npc.id]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = { role: "user", content: input.trim() };
    const userInput = input.trim(); // 保存用户输入用于关键词检测
    
    // 重新构建 System Prompt（带上用户消息进行关键词检测）
    const updatedSystemPrompt = {
      role: "system",
      content: buildSystemPrompt(npc, player, gameState, userInput)
    };
    
    // 更新消息历史，替换旧的 system prompt
    const historyWithoutSystem = messages.filter(m => m.role !== 'system');
    const newHistory = [updatedSystemPrompt, ...historyWithoutSystem, userMsg];
    
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const replyContent = await sendMessageToAI(newHistory, apiKey, apiUrl);
      
      const aiMsg = { role: "assistant", content: replyContent };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setError(err.message);
      // 显示错误提示
      const errorMsg = { 
        role: "system", 
        content: `【系统提示】灵力波动干扰，传讯失败：${err.message}` 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // 清空聊天记录
  const handleClear = () => {
    const systemPrompt = messages[0];
    setMessages([systemPrompt]);
    clearChatHistory(npc.id);
  };

  return (
    <div style={styles.container}>
      {/* 顶部工具栏 */}
      <div style={styles.toolbar}>
        <div style={styles.npcName}>与 {npc.name} 传音</div>
        <button onClick={handleClear} style={styles.clearBtn} title="清空记录">
          清空
        </button>
      </div>

      {/* 聊天记录区域 */}
      <div style={styles.chatBox} ref={scrollRef}>
        {messages.filter(m => m.role !== 'system').map((msg, idx) => {
          const isMe = msg.role === 'user';
          const isSystemMsg = msg.role === 'system';
          
          if (isSystemMsg) {
            return (
              <div key={idx} style={styles.systemMsg}>
                {msg.content}
              </div>
            );
          }
          
          return (
            <div key={idx} style={{
              ...styles.bubbleRow, 
              justifyContent: isMe ? 'flex-end' : 'flex-start'
            }}>
              {!isMe && (
                <div style={styles.avatar} title={npc.name}>
                  {npc.name[0]}
                </div>
              )}
              <div style={{
                ...styles.bubble,
                background: isMe ? 'linear-gradient(135deg, #d4af37 0%, #c5a028 100%)' : '#fff',
                color: isMe ? '#fff' : '#333',
                border: isMe ? 'none' : '2px solid #d4af37',
                boxShadow: isMe 
                  ? '0 2px 8px rgba(212, 175, 55, 0.3)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                {msg.content}
              </div>
              {isMe && (
                <div style={{...styles.avatar, background: '#4e6a5d'}} title="我">
                  {player.name[0]}
                </div>
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <div style={styles.loading}>
            <span className="loading-dots">对方正在凝神思索</span>
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div style={styles.inputArea}>
        <input 
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="输入消息，按 Enter 发送..." 
          disabled={isLoading}
        />
        <button 
          onClick={handleSend} 
          style={{
            ...styles.sendBtn,
            opacity: (isLoading || !input.trim()) ? 0.5 : 1,
            cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer'
          }} 
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? '发送中...' : '发送'}
        </button>
      </div>
    </div>
  );
};

// 本地存储相关函数
const STORAGE_KEY_PREFIX = 'npc_chat_history_';

const saveChatHistory = (npcId, messages) => {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${npcId}`, 
      JSON.stringify(messages)
    );
  } catch (err) {
    console.error('保存聊天记录失败:', err);
  }
};

const loadChatHistory = (npcId) => {
  try {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${npcId}`);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('加载聊天记录失败:', err);
    return [];
  }
};

const clearChatHistory = (npcId) => {
  try {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${npcId}`);
  } catch (err) {
    console.error('清空聊天记录失败:', err);
  }
};

// 样式定义
const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    height: '500px', 
    background: 'rgba(255, 250, 240, 0.95)', 
    borderRadius: '12px', 
    border: '2px solid #d4af37',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #4e6a5d 0%, #3d5549 100%)',
    borderBottom: '2px solid #d4af37',
  },
  npcName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#d4af37',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
  },
  clearBtn: {
    padding: '6px 12px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  chatBox: { 
    flex: 1, 
    overflowY: 'auto', 
    padding: '20px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px',
    background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
  },
  bubbleRow: { 
    display: 'flex', 
    gap: '10px', 
    alignItems: 'flex-start',
    animation: 'fadeIn 0.3s ease-in'
  },
  avatar: { 
    minWidth: '36px',
    width: '36px', 
    height: '36px', 
    borderRadius: '50%', 
    background: 'linear-gradient(135deg, #d4af37 0%, #c5a028 100%)', 
    color: '#fff', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '14px',
    fontWeight: 'bold',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    border: '2px solid rgba(255, 255, 255, 0.5)'
  },
  bubble: { 
    maxWidth: '70%', 
    padding: '12px 16px', 
    borderRadius: '16px', 
    fontSize: '14px', 
    lineHeight: '1.6',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap'
  },
  systemMsg: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
    padding: '8px 16px',
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '8px',
    fontStyle: 'italic'
  },
  loading: { 
    fontSize: '13px', 
    color: '#666', 
    textAlign: 'center', 
    padding: '12px',
    fontStyle: 'italic'
  },
  inputArea: { 
    padding: '16px', 
    borderTop: '2px solid #d4af37', 
    display: 'flex', 
    gap: '12px', 
    background: 'linear-gradient(180deg, rgba(255, 250, 240, 0.9) 0%, rgba(245, 240, 230, 0.9) 100%)',
  },
  input: { 
    flex: 1, 
    padding: '12px 16px', 
    borderRadius: '24px', 
    border: '2px solid #d4af37', 
    outline: 'none',
    fontSize: '14px',
    background: '#fff',
    transition: 'all 0.2s',
  },
  sendBtn: { 
    padding: '10px 24px', 
    borderRadius: '24px', 
    background: 'linear-gradient(135deg, #4e6a5d 0%, #3d5549 100%)', 
    color: '#fff', 
    border: 'none', 
    fontWeight: 'bold',
    fontSize: '14px',
    transition: 'all 0.2s',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  }
};

export default ChatInterface;
