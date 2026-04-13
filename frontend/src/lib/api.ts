import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const analyzeArticle = async (headline: string, content: string) => {
    const response = await axios.post(`${API_BASE_URL}/analyze`, { headline, content });
    return response.data;
};

export const getHistory = async () => {
    const response = await axios.get(`${API_BASE_URL}/history`);
    return response.data;
};
