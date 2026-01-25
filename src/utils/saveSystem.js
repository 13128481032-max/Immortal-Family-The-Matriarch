// src/utils/saveSystem.js

const SAVE_KEY = 'cultivation_save_v1'; // 存档键名，加个版本号是个好习惯

// 1. 保存游戏
export const saveGameToStorage = (gameState) => {
  try {
    // 添加保存时间戳
    const dataToSave = {
      ...gameState,
      timestamp: Date.now(),
      saveDate: new Date().toLocaleString()
    };
    const json = JSON.stringify(dataToSave);
    localStorage.setItem(SAVE_KEY, json);
    return { success: true, time: dataToSave.saveDate };
  } catch (error) {
    console.error("Save failed:", error);
    return { success: false, error };
  }
};

// 2. 读取存档
export const loadGameFromStorage = () => {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return null;
    return JSON.parse(json);
  } catch (error) {
    console.error("Load failed:", error);
    return null;
  }
};

// 3. 检查是否有存档
export const hasSaveFile = () => {
  return !!localStorage.getItem(SAVE_KEY);
};

// 4. 清除存档 (重置游戏时用)
export const clearSave = () => {
  localStorage.removeItem(SAVE_KEY);
};