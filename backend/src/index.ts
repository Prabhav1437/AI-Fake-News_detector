import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { FakeNewsAgent } from './agent';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize the Agent
const agent = new FakeNewsAgent(
    process.env.GROQ_API_KEY || '',
    process.env.HUGGINGFACEHUB_API_TOKEN || ''
);
agent.initialize().then(() => {
    console.log('✅ TruthLens Agent Ready');
});

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'TruthLens LangChain + RAG Engine is running ✅' });
});

app.post('/api/analyze', async (req: Request, res: Response) => {
    const { headline, content, sourceUrl } = req.body;
    if (!headline || !content) {
        return res.status(400).json({ error: 'Headline and content are required' });
    }

    try {
        const analysis = await agent.analyze(headline, content, sourceUrl);

        let savedAnalysis;
        try {
            savedAnalysis = await prisma.analysis.create({
                data: {
                    headline,
                    content,
                    isLikelyFake: analysis.isLikelyFake,
                    confidenceScore: analysis.confidenceScore,
                    sourceCredibility: analysis.sourceCredibility,
                    manipulativeScore: analysis.manipulativeScore,
                    sensationalismScore: analysis.sensationalismScore,
                    objectivityScore: analysis.objectivityScore
                }
            });
        } catch (dbError) {
            console.error('DB Logging failed (non-fatal):', dbError);
            savedAnalysis = {
                ...analysis,
                id: 'mock-' + Date.now(),
                createdAt: new Date().toISOString()
            };
        }

        res.json({ 
            success: true, 
            data: { 
                ...savedAnalysis, 
                analysisReason: analysis.analysisReason, 
                verdict: analysis.verdict,
                sentiment: analysis.sentiment,
                sourceName: analysis.sourceName
            }
        });
    } catch (error: any) {
        const msg = error?.message || 'Unknown error';
        console.error('❌ LLM Analysis error:', msg);
        return res.status(500).json({ error: 'LLM analysis failed: ' + msg });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history, originalAnalysis } = req.body;
        const response = await agent.chat(message, history, originalAnalysis);
        res.json({ success: true, response });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Evaluation Endpoint for 50% Requirement
app.get('/api/evaluate', async (req: Request, res: Response) => {
    const datasetPath = path.join(__dirname, 'dataset.json');
    try {
        const data = fs.readFileSync(datasetPath, 'utf8');
        const dataset = JSON.parse(data).slice(0, 10); // Test on first 10 for speed, user can increase
        
        console.log(`🧪 Running evaluation on ${dataset.length} articles...`);
        
        let results = [];
        let tp = 0, tn = 0, fp = 0, fn = 0;

        for (const item of dataset) {
            const analysis = await agent.analyze(item.text.substring(0, 50), item.text);
            const predictedLabel = analysis.isLikelyFake ? 'FAKE' : 'REAL';
            const actualLabel = item.label;

            if (predictedLabel === 'FAKE' && actualLabel === 'FAKE') tp++;
            else if (predictedLabel === 'REAL' && actualLabel === 'REAL') tn++;
            else if (predictedLabel === 'FAKE' && actualLabel === 'REAL') fp++;
            else if (predictedLabel === 'REAL' && actualLabel === 'FAKE') fn++;

            results.push({
                text: item.text.substring(0, 100) + '...',
                actual: actualLabel,
                predicted: predictedLabel,
                match: predictedLabel === actualLabel
            });
        }

        const accuracy = (tp + tn) / dataset.length;
        const precision = tp / (tp + fp) || 0;
        const recall = tp / (tp + fn) || 0;
        const f1 = 2 * (precision * recall) / (precision + recall) || 0;

        res.json({
            success: true,
            metrics: {
                totalTested: dataset.length,
                accuracy: Math.round(accuracy * 100),
                precision: Math.round(precision * 100),
                recall: Math.round(recall * 100),
                f1: Math.round(f1 * 100)
            },
            details: results
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Evaluation failed: ' + error.message });
    }
});

app.get('/api/history', async (req: Request, res: Response) => {
    try {
        const history = await prisma.analysis.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json({ success: true, data: history });
    } catch (error) {
        res.json({ success: true, data: [] });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 TruthLens server running on http://localhost:${PORT}`);
});
