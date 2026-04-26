# Analysis Pipeline Diagram

The following diagram details the multi-stage processing pipeline for fake news detection, involving Vision AI, RAG, and Real-time Web Search.

```mermaid
graph TD
    User([User Input]) --> InputType{Input Type?}
    
    InputType -- "Screenshot" --> VisionAI[Groq Vision: Llama 4 Scout]
    VisionAI --> TextExtracted[Extracted Headline & Content]
    
    InputType -- "Text/URL" --> RawInput[Raw Headline & Content]
    TextExtracted --> CombinedInput[Consolidated Text Data]
    RawInput --> CombinedInput
    
    CombinedInput --> Stage1[Stage 1: Source Reputation]
    Stage1 --> KnowledgeMap[Knowledge Map Lookup]
    
    CombinedInput --> Stage2[Stage 2: Historical Evidence - RAG]
    Stage2 --> VectorDB[(Memory Vector Store)]
    VectorDB --> HistoricalContext[Historical Matches & Labels]
    
    CombinedInput --> Stage3[Stage 3: Real-time Verification]
    Stage3 --> TavilyAPI[Tavily Search API]
    TavilyAPI --> SearchContext[Current News Context]
    
    KnowledgeMap --> LLM[Groq: Llama 3.3-70B Deep Analysis]
    HistoricalContext --> LLM
    SearchContext --> LLM
    CombinedInput --> LLM
    
    LLM --> PostProcess[Post-processing & Confidence Tuning]
    PostProcess --> Result([Final Analysis Report])
    
    Result --> DB[(PostgreSQL / Prisma)]
    Result --> UI[Frontend Dashboard]
```

## Pipeline Stages

1.  **Ingestion & Vision**: If a screenshot is provided, the system uses OCR/Vision models to extract text.
2.  **Source Reputation**: The system checks the source domain against a database of known entities to determine a baseline trust score.
3.  **RAG (Retrieval Augmented Generation)**: A vector database of known fake and real news is queried to find semantically similar historical cases.
4.  **Real-time Web Search**: The system performs a live search to see if the claim is being reported by other reputable sources or debunked by fact-checkers.
5.  **Multi-Signal LLM Analysis**: An LLM synthesizes the source reputation, RAG evidence, and search results to provide a final verdict with detailed linguistic scoring.
6.  **Persistence**: The results are logged for future reference and analytics.
