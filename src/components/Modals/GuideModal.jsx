import React, { useState } from 'react';
import { TUTORIAL_CHAPTERS } from '../../data/tutorialData.js';

const GuideModal = ({ onClose, initialTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3>📖 仙途指南</h3>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>
        
        <div style={styles.body}>
          {/* 左侧目录 */}
          <div style={styles.sidebar}>
            {TUTORIAL_CHAPTERS.map((chapter, index) => (
              <div
                key={chapter.id}
                onClick={() => setActiveTab(index)}
                style={{
                  ...styles.menuItem,
                  background: activeTab === index ? '#e0e0e0' : 'transparent',
                  fontWeight: activeTab === index ? 'bold' : 'normal',
                  color: activeTab === index ? '#3e2723' : '#666'
                }}
              >
                {chapter.title}
              </div>
            ))}
          </div>

          {/* 右侧内容 */}
          <div style={styles.content}>
            <h4 style={{marginTop:0, borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
              {TUTORIAL_CHAPTERS[activeTab].title}
            </h4>
            <div
              style={{lineHeight: '1.6', fontSize: '14px', color: '#444'}}
              dangerouslySetInnerHTML={{ __html: TUTORIAL_CHAPTERS[activeTab].content }}
            />
          </div>
        </div>

        <div style={styles.footer}>
           {activeTab < TUTORIAL_CHAPTERS.length - 1 ? (
             <button onClick={() => setActiveTab(activeTab + 1)} style={styles.nextBtn}>下一页</button>
           ) : (
             <button onClick={onClose} style={styles.finishBtn}>我明白了</button>
           )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { width: '600px', height: '450px', background: '#fff', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' },
  header: { padding: '15px 20px', background: '#3e2723', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' },
  body: { flex: 1, display: 'flex', overflow: 'hidden' },
  sidebar: { width: '180px', background: '#f5f5f5', borderRight: '1px solid #ddd', overflowY: 'auto' },
  menuItem: { padding: '15px', cursor: 'pointer', borderBottom: '1px solid #eee', fontSize: '13px' },
  content: { flex: 1, padding: '20px', overflowY: 'auto' },
  footer: { padding: '10px 20px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', background: '#fafafa' },
  nextBtn: { padding: '8px 20px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  finishBtn: { padding: '8px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};

export default GuideModal;
