# VeriNews AI Project Documentation

Welcome to the official documentation for **VeriNews AI**, a state-of-the-art misinformation detection platform.

## Documentation Index

1.  **[System Architecture](System_Architecture.md)**
    *   Overview of the tech stack and component relationships.
2.  **[Pipeline Diagram](Pipeline_Diagram.md)**
    *   Detailed flow of how news is analyzed from ingestion to final verdict.
3.  **[ER Diagram](ER_Diagram.md)**
    *   Database schema and entity relationships.
4.  **[API Reference](API_Reference.md)**
    *   Documentation for the backend endpoints.

## Project Overview

VeriNews AI uses a multi-layered approach to verify news integrity:
- **Vision Extraction**: Automatically parses news from social media screenshots.
- **RAG (Retrieval-Augmented Generation)**: Compares claims against a verified database of historical news.
- **Real-time Web Search**: Cross-references claims with live news reports.
- **Linguistic Analysis**: Uses advanced LLMs to identify manipulative and sensationalist language patterns.
