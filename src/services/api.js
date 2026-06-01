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
 * Request AI Assistant answer via OpenAI GPT-4o mini
 * @param {string} query - The user's prompt
 * @param {string} apiKey - OpenAI API Key (required)
 * @param {string} category - Current active category for system prompt tailoring
 */
export const askAI = async (query, apiKey, category = 'all') => {
  if (!apiKey) {
    throw new Error("OpenAI API Key가 설정되지 않았습니다. 상단에서 API Key를 입력해 주세요.");
  }

  try {
    const systemPrompts = {
      all: "당신은 현장 작업자(전기, 배관, 기계공학 등)를 돕는 전문 공학 비서입니다. 답변은 명확하고 실무 지향적이어야 하며 가능한 한 간결하게 줄바꿈과 강조(**)를 섞어 한국어로 제공하세요.",
      electric: "당신은 전기공사 및 KEC(한국전기설비규정) 전문가 페르소나의 AI 비서입니다. 전선 단면적 계산, 허용전류, 전압강하, 안전 수칙에 관한 신뢰성 있는 전문 답변을 한국어로 제공하세요.",
      plumbing: "당신은 배관 설계 및 유체역학 전문가 페르소나의 AI 비서입니다. 유량/유속 계산, 압력 손실, 배관 재질별 손실 계수, 펌프 마력 설계 등에 대한 전문적이고 구체적인 답변을 한국어로 제공하세요.",
      engineering: "당신은 일반 기계공학 및 재료역학 전문가 페르소나의 AI 비서입니다. 단위 환산 공식, 재료 중량 계산(철판, 콘크리트 비중 등), 물리량(토크, 회전력) 산출 공식 등에 대한 기하학적/수학적 답변을 한국어로 제공하세요."
    };

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompts[category] || systemPrompts.all },
        { role: 'user', content: query }
      ],
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    const errMsg = error.response?.data?.error?.message || "OpenAI API 서버와의 통신에 실패했습니다. API Key와 네트워크 상태를 확인해 주세요.";
    throw new Error(errMsg);
  }
};
