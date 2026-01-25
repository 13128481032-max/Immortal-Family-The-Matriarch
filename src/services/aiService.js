// AI 服务通信层
// 负责与兼容 OpenAI 格式的 API 进行通信（如 DeepSeek、Kimi、通义千问等）

/**
 * 发送消息到 AI 并获取回复
 * @param {Array} messages - 对话历史 [{role: 'system'|'user'|'assistant', content: string}]
 * @param {string} apiKey - API 密钥
 * @param {string} apiUrl - API 端点 URL
 * @param {Object} options - 可选配置（模型名、温度等）
 * @returns {Promise<string>} AI 的回复内容
 */
export const sendMessageToAI = async (messages, apiKey, apiUrl, options = {}) => {
  if (!apiKey) {
    throw new Error("请先在系统设置中配置 API Key");
  }

  if (!apiUrl) {
    throw new Error("请先在系统设置中配置 API URL");
  }

  const {
    model = "deepseek-chat", // 默认使用 DeepSeek，也兼容其他服务
    temperature = 0.85, // 0.8-1.0 更有创造力，适合角色扮演
    maxTokens = 200, // 限制回复长度，防止废话太多
  } = options;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        // 某些服务可能需要这个参数
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API 调用失败 (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    // 检查返回格式
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("API 返回格式异常");
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("AI 对话失败:", error);
    
    // 提供更友好的错误提示
    if (error.message.includes('Failed to fetch')) {
      throw new Error("网络连接失败，请检查网络或 API URL 是否正确");
    }
    
    throw error;
  }
};

/**
 * 测试 API 配置是否有效
 * @param {string} apiKey 
 * @param {string} apiUrl 
 * @returns {Promise<boolean>}
 */
export const testAPIConnection = async (apiKey, apiUrl) => {
  try {
    const testMessages = [
      { role: "system", content: "你是一个测试助手" },
      { role: "user", content: "测试" }
    ];
    
    await sendMessageToAI(testMessages, apiKey, apiUrl, { maxTokens: 10 });
    return true;
  } catch (error) {
    console.error("API 测试失败:", error);
    return false;
  }
};
