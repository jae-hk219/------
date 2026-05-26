import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'https://api.example.com/v1', // Replace with actual API base URL later
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Perform a calculation via API (Currently returns a mock promise)
 * @param {string} calcId - The calculator ID
 * @param {number[]} inputs - Array of input values
 * @param {function} localFormula - Fallback local formula for MVP calculation
 */
export const performCalculation = async (calcId, inputs, localFormula) => {
  try {
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // TODO: In production, uncomment the actual Axios call
    // const response = await apiClient.post('/calculate', { calcId, inputs });
    // return response.data.result;

    // MVP dummy return using the local formula
    return localFormula(inputs);
  } catch (error) {
    console.error("Calculation API Error:", error);
    throw new Error("서버와의 통신에 실패했습니다.");
  }
};

/**
 * Request AI Assistant answer (Dummy response for now)
 * @param {string} query - The user's prompt
 */
export const askAI = async (query) => {
  try {
    // Simulated API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // TODO: In production, integrate OpenAI GPT-4o mini via backend
    // const response = await apiClient.post('/ask-ai', { prompt: query });
    // return response.data.answer;

    return `(더미 AI 응답) "${query}"에 대한 제 생각은 다음과 같습니다. 현장에서 해당 작업을 수행하실 때는 KEC 규정을 준수하고 반드시 안전 장비를 착용해 주세요!`;
  } catch (error) {
    console.error("AI API Error:", error);
    throw new Error("AI 서버와의 통신에 실패했습니다.");
  }
};
