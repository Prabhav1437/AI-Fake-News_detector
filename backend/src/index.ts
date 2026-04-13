import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Main health check / diagnosis endpoint
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Fake News Detector API is running' });
});

// Endpoint to analyze an article
app.post('/api/analyze', async (req: Request, res: Response) => {
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

        // Try to save to DB, but don't crash if it fails (fallback to mock)
        let savedAnalysis;
        try {
            savedAnalysis = await prisma.analysis.create({
                data: {
                    headline,
                    content,
                    isLikelyFake,
                    confidenceScore,
                    sourceCredibility,
                    manipulativeScore,
                    sensationalismScore,
                    objectivityScore
                }
            });
        } catch (dbError) {
            console.error('DB Logging failed, using mock return:', dbError);
            savedAnalysis = {
                id: 'mock-' + Date.now(),
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
        }

        res.json({
            success: true,
            data: savedAnalysis
        });
    } catch (error) {
        console.error('Error in analysis API:', error);
        res.status(500).json({ error: 'Internal server error while evaluating article.' });
    }
});

// Endpoint to fetch history
app.get('/api/history', async (req: Request, res: Response) => {
    try {
        const history = await prisma.analysis.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        });
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error fetching history:', error);
        res.json({ success: true, data: [] }); // Fallback to empty history on error
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
