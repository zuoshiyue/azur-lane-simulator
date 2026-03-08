/**
 * Web Fetch 包装器 - 用于浏览器环境调用
 */

export interface WebFetchResponse {
  text: string;
  url: string;
  status: number;
}

/**
 * 调用 web_fetch 工具获取网页内容
 * 注意：这个函数需要在支持 web_fetch 的环境中运行
 */
export async function webFetch(
  url: string, 
  options: { maxChars?: number } = {}
): Promise<WebFetchResponse> {
  // 在浏览器环境中，我们需要通过后端代理调用 web_fetch
  // 这里使用一个简单的 fetch 作为替代方案
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    
    // 限制返回字符数
    const maxChars = options.maxChars || 10000;
    const truncatedText = text.length > maxChars ? text.substring(0, maxChars) : text;

    return {
      text: truncatedText,
      url: response.url,
      status: response.status,
    };
  } catch (error) {
    console.error('Web fetch error:', error);
    throw error;
  }
}
