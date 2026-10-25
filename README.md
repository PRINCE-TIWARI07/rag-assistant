# RAG Document Assistant

A Retrieval-Augmented Generation (RAG) application that answers questions from PDF documents using semantic search and an LLM.

## Architecture

```text
      PDF Document
           │
           ▼
     Text Extraction
           │
           ▼
      Text Chunking
           │
           ▼
   Gemini Embeddings
           │
           ▼
      Qdrant Cloud
```

## Query Pipeline

```text
    User Question
          │
          ▼
   Gemini Embeddings
          │
          ▼
    Qdrant Search
          │
          ▼
   Relevant Context
          │
          ▼
       Groq LLM
          │
          ▼
     Final Answer
```

## Tech Stack

- Node.js & Express.js
- LangChain
- Google Gemini Embeddings
- Qdrant Cloud
- Groq LLM
- `pdf-parse`

## API

**Endpoint:** `POST /ai`

**Request:**
```json
{
  "input": "What is the price of potatoes?"
}
```

## Environment Variables

```env
GOOGLE_API_KEY=
GROQ_API_KEY=
QDRANT_URL=
QDRANT_API_KEY=
```

## Run Locally

```bash
npm install
npm run dev
```
