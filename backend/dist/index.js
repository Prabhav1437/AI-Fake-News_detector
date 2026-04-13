"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Main health check / diagnosis endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Fake News Detector API is running' });
});
// Endpoint to analyze an article
app.post('/api/analyze', async (req, res) => {
    const { headline, content } = req.body;
    if (!headline || !content) {
        return res.status(400).json({ error: 'Headline and content are required' });
    }
    try {
        const lowerHeadline = headline.toLowerCase();
        const lowerContent = content.toLowerCase();
        const fakeKeywords = ['shocking', 'secret', 'miracle', 'you won\'t believe', 'conspiracy', 'illuminati', 'hoax', 'banned'];
        let fakeKeywordCount = 0;
        fakeKeywords.forEach(word => {
            if (lowerHeadline.includes(word) || lowerContent.includes(word)) {
                fakeKeywordCount++;
            }
        });
        const isLikelyFake = fakeKeywordCount > 0 || Math.random() > 0.6;
        const confidenceScore = 65 + (Math.random() * 30);
        const sourceCredibility = isLikelyFake ? Math.floor(20 + Math.random() * 30) : Math.floor(75 + Math.random() * 20);
        const manipulativeScore = Math.floor(isLikelyFake ? 60 + Math.random() * 35 : 5 + Math.random() * 15);
        const sensationalismScore = Math.floor(isLikelyFake ? 70 + Math.random() * 25 : 10 + Math.random() * 20);
        const objectivityScore = Math.floor(isLikelyFake ? 10 + Math.random() * 25 : 75 + Math.random() * 20);
        const savedAnalysis = {
            id: 'mock-id',
            headline,
            content,
            isLikelyFake,
            confidenceScore,
            sourceCredibility,
            manipulativeScore,
            sensationalismScore,
            objectivityScore,
            createdAt: new Date().toISOString()
        };
        res.json({
            success: true,
            data: savedAnalysis
        });
    }
    catch (error) {
        console.error('Error in analysis API:', error);
        res.status(500).json({ error: 'Internal server error while evaluating article.' });
    }
});
// Endpoint to fetch history
app.get('/api/history', async (req, res) => {
    res.json({ success: true, data: [] });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
