import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export const analyzeArticle = async (headline: string, content: string, sourceUrl: string = '') => {
    const response = await axios.post(`${API_BASE_URL}/analyze`, { headline, content, sourceUrl });
    return response.data;
};

export const getHistory = async () => {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
};

export const chatWithAgent = async (message: string, history: any[], originalAnalysis: any) => {
    const response = await axios.post(`${API_BASE_URL}/chat`, { message, history, originalAnalysis });
    return response.data;
};
