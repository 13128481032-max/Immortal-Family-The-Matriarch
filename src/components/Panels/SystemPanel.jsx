import React, { useState, useEffect } from 'react';
import { hasSaveFile, clearSave } from '../../utils/saveSystem.js';
import { testAPIConnection } from '../../services/aiService.js';

const SystemPanel = ({ player, onSave, onLoad, onReset, onOpenGuide }) => {
  const [saveExists, setSaveExists] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState(null);
  
  // AI 配置状态
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiModel, setApiModel] = useState('');
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  // 初始化检查存档
  useEffect(() => {
    checkSave();
    loadAPIConfig();
  }, []);

  const loadAPIConfig = () => {
    const savedKey = localStorage.getItem('game_api_key') || '';
    const savedUrl = localStorage.getItem('game_api_url') || 'https://api.deepseek.com/chat/completions';
    const savedModel = localStorage.getItem('game_api_model') || 'deepseek-chat';
    
    setApiKey(savedKey);
    setApiUrl(savedUrl);
    setApiModel(savedModel);
  };

  const saveAPIConfig = () => {
    localStorage.setItem('game_api_key', apiKey);
    localStorage.setItem('game_api_url', apiUrl);
    localStorage.setItem('game_api_model', apiModel);
    alert('AI 配置已保存！');
    setApiStatus(null);
  };

  const handleTestAPI = async () => {
    if (!apiKey || !apiUrl) {
      alert('请先填写 API Key 和 URL');
      return;
    }
    
    setIsTestingAPI(true);
    setApiStatus(null);
    
    try {
      const success = await testAPIConnection(apiKey, apiUrl);
      if (success) {
        setApiStatus({ success: true, message: '✅ 连接成功！API 配置有效。' });
      } else {
        setApiStatus({ success: false, message: '❌ 连接失败，请检查配置。' });
      }
    } catch (err) {
      setApiStatus({ success: false, message: `❌ 测试失败: ${err.message}` });
    } finally {
      setIsTestingAPI(false);
    }
  };

  const checkSave = () => {
    const exists = hasSaveFile();
    setSaveExists(exists);
    if(exists) {
      // 读取一下时间（这里稍微有点hack，为了不完整读取大文件，其实localstorage只能全读）
      try {
         const data = JSON.parse(localStorage.getItem('cultivation_save_v1'));
         setLastSaveTime(data.saveDate);
      } catch(e) {}
    }
  };

  const handleSaveClick = () => {
    const result = onSave();
    if (result.success) {
      alert(`存档成功！\n时间: ${result.time}`);
      checkSave(); // 刷新状态
    } else {
      alert("存档失败，可能是存储空间不足。");
    }
  };

  const handleLoadClick = () => {
    if (window.confirm("确定要读取旧存档吗？当前未保存的进度将丢失。")) {
      onLoad();
    }
  };

  const handleResetClick = () => {
    if (window.confirm("😱 警告：确定要删除存档并重新开始吗？这无法撤销！")) {
      clearSave();
      onReset();
    }
  };

  return (
    <div style={{padding: '20px'}}>
      <h3 style={{borderBottom: '1px solid #ccc', paddingBottom: '10px'}}>⚙️ 系统设置</h3>
      
      {/* AI 配置卡片 */}
      <div style={styles.card}>
        <h4>🤖 AI 对话配置</h4>
        <p style={styles.info}>
          配置大语言模型 API，让 NPC 拥有真正的智能对话能力。<br/>
          <small style={{color: '#999'}}>推荐使用 DeepSeek（便宜且擅长中文角色扮演）</small>
        </p>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>API Key:</label>
          <input 
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-xxxxxxxxxxxxxxxx"
            style={styles.input}
          />
          <small style={styles.hint}>
            获取 Key: <a href="https://platform.deepseek.com/" target="_blank" rel="noopener">DeepSeek</a> | 
            <a href="https://platform.openai.com/" target="_blank" rel="noopener"> OpenAI</a> | 
            <a href="https://dashscope.aliyun.com/" target="_blank" rel="noopener"> 通义千问</a>
          </small>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>API URL:</label>
          <input 
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.deepseek.com/chat/completions"
            style={styles.input}
          />
          <small style={styles.hint}>
            DeepSeek: https://api.deepseek.com/chat/completions<br/>
            OpenAI: https://api.openai.com/v1/chat/completions
          </small>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>模型名称:</label>
          <input 
            type="text"
            value={apiModel}
            onChange={(e) => setApiModel(e.target.value)}
            placeholder="deepseek-chat"
            style={styles.input}
          />
          <small style={styles.hint}>
            DeepSeek: deepseek-chat | OpenAI: gpt-4o-mini | 通义: qwen-plus
          </small>
        </div>

        {apiStatus && (
          <div style={{
            ...styles.statusBox,
            background: apiStatus.success ? '#e8f5e9' : '#ffebee',
            color: apiStatus.success ? '#2e7d32' : '#c62828'
          }}>
            {apiStatus.message}
          </div>
        )}

        <div style={styles.btnGroup}>
          <button onClick={saveAPIConfig} style={styles.saveBtn}>
            💾 保存配置
          </button>
          <button 
            onClick={handleTestAPI} 
            style={{...styles.btn, background: '#2196f3', color: 'white', border: 'none'}}
            disabled={isTestingAPI}
          >
            {isTestingAPI ? '测试中...' : '🔌 测试连接'}
          </button>
        </div>
      </div>
      
      <div style={styles.card}>
        <h4>📁 存档管理</h4>
        <div style={styles.info}>
          当前状态: {saveExists ? `已存 (${lastSaveTime})` : "无存档"}
        </div>
        
        <div style={styles.btnGroup}>
          <button onClick={handleSaveClick} style={styles.saveBtn}>
            💾 保存当前进度
          </button>
          
          <button 
            onClick={handleLoadClick} 
            style={{...styles.btn, opacity: saveExists ? 1 : 0.5}}
            disabled={!saveExists}
          >
            📂 读取存档
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <h4>📚 帮助文档</h4>
        <p style={styles.info}>查看游戏机制、反哺公式及战斗说明。</p>
        <button 
          onClick={onOpenGuide} 
          style={{...styles.btn, background: '#2196f3', color: 'white', border: 'none', width: '100%'}} 
        >
          📖 打开仙途指南
        </button>
      </div>

      <div style={{...styles.card, borderColor: '#d32f2f', background: '#ffebee'}}>
        <h4 style={{color: '#d32f2f'}}>🔥 危险区域</h4>
        <p style={{fontSize: '12px', color: '#666'}}>如果游戏出现严重Bug或想重开一局。</p>
        <button onClick={handleResetClick} style={styles.resetBtn}>
          ☠️ 删档重开
        </button>
      </div>

      <div style={{textAlign:'center', marginTop:'30px', color:'#999', fontSize:'12px'}}>
        <p>版本: v0.1.0 Alpha</p>
        <p>提示：本游戏使用浏览器本地存储，<br/>清除浏览器缓存会丢失存档。</p>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '20px' },
  info: { marginBottom: '15px', fontSize: '14px', color: '#555' },
  btnGroup: { display: 'flex', gap: '10px' },
  btn: { flex: 1, padding: '10px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #ccc', background: '#f5f5f5' },
  saveBtn: { flex: 1, padding: '10px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: '#4caf50', color: 'white', fontWeight: 'bold' },
  resetBtn: { width: '100%', padding: '10px', cursor: 'pointer', borderRadius: '5px', border: 'none', background: '#d32f2f', color: 'white' },
  formGroup: { marginBottom: '15px' },
  label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#333' },
  input: { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  hint: { display: 'block', marginTop: '5px', fontSize: '11px', color: '#999', lineHeight: '1.4' },
  statusBox: { padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '13px', fontWeight: 'bold' }
};

export default SystemPanel;