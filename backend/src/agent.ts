import { ChatGroq } from "@langchain/groq";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { getSourceInfo } from "./knowledge_map";

// Schema for the output
const analysisSchema = z.object({
  isLikelyFake: z.boolean().describe("Whether the article is likely fake news"),
  confidenceScore: z.number().describe("AI's confidence score (0-100)"),
  sensationalismScore: z.number().describe("Score for sensationalism/clickbait (0-100)"),
  manipulativeScore: z.number().describe("Score for manipulative/emotional language (0-100)"),
  objectivityScore: z.number().describe("Score for factual objectivity (0-100)"),
  sentiment: z.enum(["Positive", "Neutral", "Negative", "Extreme"]).describe("The sentiment of the article"),
  verdict: z.enum(["DECEPTIVE", "VERIFIED", "UNVERIFIED"]).describe("The final verdict"),
  analysisReason: z.string().describe("Explanation for the verdict")
});

const parser = StructuredOutputParser.fromZodSchema(analysisSchema);

export class FakeNewsAgent {
  private model: ChatGroq;
  private vectorStore: MemoryVectorStore | null = null;
  private embeddings: HuggingFaceInferenceEmbeddings;

  constructor(apiKey: string, hfToken?: string) {
    this.model = new ChatGroq({
      apiKey: apiKey,
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
    });

    this.embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: hfToken || process.env.HUGGINGFACEHUB_API_TOKEN || "",
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });
  }

  private isInitializing = false;

  async initialize() {
    if (this.isInitializing) return;
    this.isInitializing = true;
    console.log("🚀 Initializing Fake News Agent with RAG (Subset)...");
    const datasetPath = path.join(__dirname, "dataset.json");
    try {
      const data = fs.readFileSync(datasetPath, "utf8");
      const KNOWLEDGE_BASE = JSON.parse(data);
      
      // Limit to 30 entries for robust RAG evidence
      const docs = KNOWLEDGE_BASE.slice(0, 30).map((item: any) => new Document({
        pageContent: item.text,
        metadata: { label: item.label, reasoning: item.reasoning }
      }));

      this.vectorStore = await MemoryVectorStore.fromDocuments(docs, this.embeddings);
      console.log(`✅ Vector Store initialized with ${docs.length} entries`);
    } catch (err) {
      console.error("⚠️ Failed to initialize RAG:", err);
    } finally {
      this.isInitializing = false;
    }
  }

  async analyze(headline: string, content: string, sourceUrl: string = "") {
    console.log(`🔍 Deep Intelligence Analysis: ${headline.substring(0, 50)}...`);
    
    // 1. Source Credibility (Knowledge Map) - Instant
    const sourceInfo = getSourceInfo(sourceUrl || headline);
    
    // 2. Retrieve Context (RAG) - Fast with Groq
    const relevantDocs = await this.vectorStore?.similaritySearch(`${headline} ${content.substring(0, 200)}`, 3) || [];
    const ragContext = relevantDocs.length > 0
      ? relevantDocs.map((doc: any, i: number) => 
          `Evidence ${i+1} [Historical Label: ${doc.metadata.label}]:\nContent: ${doc.pageContent}`
        ).join("\n\n")
      : "No direct historical matches found.";

    // 3. Multi-Signal Analysis Prompt
    const prompt = PromptTemplate.fromTemplate(`
You are TruthLens AI, the world's most advanced misinformation detection system. 
Analyze the provided news article using linguistic fingerprinting, source reputation, and historical evidence.

### INPUT DATA:
- Headline: {headline}
- Content Snapshot: {content}

### EVIDENCE & REPUTATION:
- Source category: {sourceCategory} (Trust Score: {sourceTrustScore}/100)
- Source Flagged: {isFlagged}
- Historical Evidence (RAG): 
{ragContext}

### ANALYSIS PROTOCOL:
1. **Linguistic markers**: Identify emotional manipulation, clickbait tactics, and logical fallacies.
2. **Contextual Alignment**: Check if the article aligns with or contradicts the historical evidence provided.
3. **Confidence Calculation**:
   - If Source is Trusted AND Evidence aligns -> Confidence 90-99%.
   - If Source is Flagged AND Evidence contradicts -> Confidence 90-99%.
   - If Source is Unknown OR Evidence is mixed -> Confidence 60-80%.

{format_instructions}

Final Output MUST be valid JSON. Be decisive and prioritize high-confidence markers.
`);

    const chain = RunnableSequence.from([
      prompt,
      this.model,
      parser
    ]);

    console.log("LLM: Executing Deep Analysis with RAG Evidence...");
    const result = await chain.invoke({
      headline,
      content: content.substring(0, 1500),
      sourceTrustScore: sourceInfo.trustScore,
      sourceCategory: sourceInfo.category,
      isFlagged: sourceInfo.isFlagged ? "YES" : "NO",
      ragContext,
      format_instructions: parser.getFormatInstructions()
    });

    // 4. Final Confidence Adjustment (System Logic)
    let finalConfidence = result.confidenceScore;
    if (sourceInfo.isFlagged && result.isLikelyFake) finalConfidence = Math.max(finalConfidence, 96);
    if (sourceInfo.trustScore > 90 && !result.isLikelyFake) finalConfidence = Math.max(finalConfidence, 98);

    console.log(`✅ Analysis Complete. Confidence: ${finalConfidence}%`);

    return {
      ...result,
      id: Math.random().toString(36).substring(7).toUpperCase(),
      confidenceScore: finalConfidence,
      sourceCredibility: sourceInfo.trustScore,
      sourceName: sourceInfo.name,
      preprocessedAnalysis: `RAG scan completed with ${relevantDocs.length} matches. Source identified as ${sourceInfo.name}.`,
      headline,
      content
    };
  }

  async chat(message: string, history: any[], originalAnalysis: any) {
    console.log(`💬 Chat Message received: ${message.substring(0, 50)}...`);

    // Guard: Prevent another check in same chat
    if (message.toLowerCase().includes("check this") || message.toLowerCase().includes("analyze this") || message.toLowerCase().includes("scan this")) {
        return "I am specialized for this specific article. To analyze a new article, please initiate a new scan from the dashboard.";
    }

    const chatPrompt = PromptTemplate.fromTemplate(`
You are TruthLens AI, an expert misinformation analyst. You are currently in a follow-up discussion regarding the following analysis:

### ORIGINAL ANALYSIS:
- Headline: {headline}
- Verdict: {verdict}
- Confidence: {confidence}%
- Reason: {reason}

### USER QUESTION:
{message}

### GUIDELINES:
1. Answer ONLY questions related to this specific news article and your analysis.
2. If the user asks about unrelated topics (weather, coding, general knowledge), politely state: "I don't have those capabilities. I am specialized only in analyzing the integrity of this specific article."
3. If the user tries to provide a new article to scan, tell them: "Please use a different/new chat for a new article check."
4. Be concise and professional.

Final response should be text only.
`);

    const chain = RunnableSequence.from([
      chatPrompt,
      this.model
    ]);

    const response = await chain.invoke({
      headline: originalAnalysis.headline,
      verdict: originalAnalysis.verdict,
      confidence: originalAnalysis.confidenceScore,
      reason: originalAnalysis.analysisReason,
      message
    });

    return response.content.toString();
  }
}
