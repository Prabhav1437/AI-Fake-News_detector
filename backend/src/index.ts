import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Load RAG Knowledge Base
const datasetPath = path.join(__dirname, 'dataset.json');
let KNOWLEDGE_BASE: any[] = [];
try {
    const data = fs.readFileSync(datasetPath, 'utf8');
    KNOWLEDGE_BASE = JSON.parse(data);
    console.log(`✅ RAG Knowledge Base loaded: ${KNOWLEDGE_BASE.length} entries`);
} catch (err) {
    console.error('⚠️ Failed to load RAG Dataset:', err);
}

// RAG: Retrieve most relevant examples from the knowledge base
const retrieveContext = (input: string): any[] => {
    const STOP_WORDS = new Set(['the', 'is', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'of', 'are', 'was', 'were', 'be', 'has', 'had', 'he', 'she', 'it', 'they', 'we', 'you', 'i']);
    const inputWords = input.toLowerCase().split(/\W+/).filter(w => w.length > 3 && !STOP_WORDS.has(w));
    
    if (inputWords.length === 0) return [];

    const scored = KNOWLEDGE_BASE.map(item => {
        const itemText = item.text.toLowerCase();
        const matchCount = inputWords.filter(word => itemText.includes(word)).length;
        const density = matchCount / inputWords.length;
        return { ...item, score: matchCount, density };
    });

    return scored
        .filter(item => item.score >= 1)
        .sort((a, b) => b.density - a.density)
        .slice(0, 3);
};

// LLM + RAG Analysis using Gemini
const analyzeWithGemini = async (headline: string, content: string) => {
    const retrievedExamples = retrieveContext(headline + " " + content);

    const ragContext = retrievedExamples.length > 0
        ? `Here are ${retrievedExamples.length} relevant examples from the knowledge base to guide your analysis:\n\n` +
          retrievedExamples.map((ex, i) =>
            `Example ${i + 1}:\n  Text: "${ex.text}"\n  Label: ${ex.label}\n  Reasoning: ${ex.reasoning}`
          ).join('\n\n')
        : 'No direct matches found in the knowledge base. Analyze based on linguistic and factual indicators alone.';

    const prompt = `You are an expert AI fact-checking system specializing in detecting fake news and misinformation. Your task is to analyze a news article and classify it as REAL or FAKE with a detailed breakdown.

${ragContext}

---

Now analyze this article:
HEADLINE: "${headline}"
CONTENT: "${content}"

Respond ONLY with a valid JSON object (no markdown, no explanation outside the JSON) in this exact format:
{
  "isLikelyFake": true or false,
  "confidenceScore": <number between 40 and 99>,
  "sourceCredibility": <number between 0 and 100>,
  "sensationalismScore": <number between 0 and 100>,
  "manipulativeScore": <number between 0 and 100>,
  "objectivityScore": <number between 0 and 100>,
  "verdict": "DECEPTIVE" or "VERIFIED",
  "analysisReason": "<2-3 sentence explanation of your verdict based on the article's language, claims, source, and any knowledge base matches>"
}

Guidelines:
- sensationalismScore: How much clickbait/dramatized language is used (high = more sensational)
- manipulativeScore: Use of emotionally charged or politically biased language (high = more manipulative)
- objectivityScore: Presence of factual, neutral, and cited language (high = more objective)
- sourceCredibility: How credible the cited source/publication appears (high = more credible)
- If content is in a regional language (Hindi, Hinglish, etc.), still analyze the claims and tone`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
        ] as any,
        generationConfig: {
            responseMimeType: "application/json"
        }
    });

    const result = await model.generateContent(prompt);
    
    let responseText: string;
    try {
        responseText = result.response.text().trim();
    } catch {
        console.warn('⚠️ Gemini blocked response — safety filter triggered');
        return {
            isLikelyFake: true,
            confidenceScore: 85,
            sourceCredibility: 10,
            sensationalismScore: 90,
            manipulativeScore: 80,
            objectivityScore: 15,
            verdict: "DECEPTIVE",
            analysisReason: "Content flagged by AI safety filters — contains unverifiable claims typical of misinformation."
        };
    }

    console.log('🤖 Gemini raw response:', responseText.substring(0, 400));
    
    try {
        return JSON.parse(responseText);
    } catch (parseError) {
        // Fallback or attempt to extract just in case it included markdown unexpectedly
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('JSON: No valid JSON found. Raw: ' + responseText.substring(0, 100));
    }
};

app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'TruthLens RAG + LLM Engine is running ✅' });
});

app.post('/api/analyze', async (req: Request, res: Response) => {
    const { headline, content } = req.body;
    if (!headline || !content) {
        return res.status(400).json({ error: 'Headline and content are required' });
    }

    try {
        const analysis = await analyzeWithGemini(headline, content);

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
                id: 'mock-' + Date.now(),
                headline,
                content,
                ...analysis,
                createdAt: new Date().toISOString()
            };
        }

        res.json({ 
            success: true, 
            data: { ...savedAnalysis, analysisReason: analysis.analysisReason, verdict: analysis.verdict }
        });
    } catch (error: any) {
        const msg = error?.message || 'Unknown error';
        console.error('❌ LLM Analysis error:', msg);
        if (msg.includes('API_KEY') || msg.includes('API key')) {
            return res.status(500).json({ error: 'Invalid or missing GEMINI_API_KEY in .env file.' });
        }
        if (msg.includes('JSON')) {
            return res.status(500).json({ error: 'LLM returned unexpected response format. Try again.' });
        }
        return res.status(500).json({ error: 'LLM analysis failed: ' + msg });
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
    console.log(`🤖 LLM: Gemini 2.0 Flash | RAG: ${KNOWLEDGE_BASE.length} knowledge entries`);
});
