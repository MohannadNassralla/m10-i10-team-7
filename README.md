# Integration 10 — Dockerize the Four-Service Stack

Compose the Lab's FastAPI backend and Next.js frontend with **containerized Neo4j and Weaviate** into a one-command Docker Compose stack.

This project is a team-based integration assignment that demonstrates end-to-end system design using:
- FastAPI backend (RAG + KG + Extract services)
- Next.js frontend
- Neo4j graph database
- Weaviate vector database

The system supports a full Retrieval-Augmented Generation (RAG) pipeline with citations and grounded answers.

---

## Team Members

- **Rama Mathloni** — Infra-Integration Lead  
- **Omar Al Akhras** — Backend Lead  
- **Mohannad Nassrallah** — Frontend Lead  

---

##  Project Overview

This system integrates four services into a unified AI-powered application:

### Backend (FastAPI)
- Handles `/extract`, `/kg/query`, `/rag/answer`
- Connects to Neo4j and Weaviate
- Implements RAG pipeline with citation support

### Frontend (Next.js)
- Provides UI for extract, knowledge graph, and RAG queries
- Displays answers with citations
- Communicates with backend API

### Neo4j
- Stores structured knowledge graph data
- Seeded using Cypher scripts

### Weaviate
- Stores vector embeddings for semantic search
- Seeded using embedding pipeline

---

## Project Structure

```
api/                      Pre-implemented FastAPI backend (extended by Backend Lead)
web/                      Pre-implemented Next.js frontend (extended by Frontend Lead)
docker-compose.yml        Main orchestration file (Infra-Integration Lead)
scripts/
  seed_neo4j.sh           Seeds graph database
  seed_weaviate.sh        Seeds vector database
  healthcheck_stack.sh    Validates system readiness
.env.example              Environment variables template
TEAM.md                   Team roles and ownership
CONTRIBUTING.md           Collaboration and branching rules
```

---

##  How to Run the Project

### 1. Setup environment
```bash
cp .env.example .env
# Edit .env with correct credentials
```

### 2. Build and start services
```bash
docker compose up -d --build
```

### 3. Check system health
```bash
docker compose ps
bash scripts/healthcheck_stack.sh
```

### 4. Seed databases
```bash
bash scripts/seed_neo4j.sh
bash scripts/seed_weaviate.sh
```

### 5. Test RAG endpoint
```bash
curl -X POST http://localhost:8000/rag/answer \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I prep ginger for stir-fry?"}'
```

### 6. Open frontend
```
http://localhost:3000/rag
```

---

##  System Architecture

User → Next.js Frontend → FastAPI Backend →  
Neo4j (Graph Retrieval) + Weaviate (Vector Search) →  
RAG Pipeline → LLM Generator → Answer with Citations

---

##  Services

| Service   | Description |
|----------|-------------|
| api       | FastAPI backend (RAG system) |
| web       | Next.js frontend UI |
| neo4j     | Graph database |
| weaviate  | Vector database |

---

##  Demo Flow

1. Start stack using Docker Compose
2. Seed Neo4j + Weaviate
3. Open frontend at `/rag`
4. Ask a question (e.g. recipe query)
5. Receive grounded answer with citations

---

##  Submission Requirements

- One team submission via TalentLMS
- Must include:
  - `docker compose ps` showing healthy services
  - Seed script outputs
  - Working `/rag/answer` curl response
  - Screenshot of frontend RAG page
  - Completed TEAM.md
  - Contribution summary per member

---

##  Collaboration Rules

- Backend owns API contract (Pydantic + OpenAPI)
- Frontend consumes API strictly via types
- Infra owns Docker Compose and orchestration
- Any contract change must be communicated in team channel before merge

---

## License

This repository is for educational purposes only.
Unauthorized distribution outside the course is not permitted.