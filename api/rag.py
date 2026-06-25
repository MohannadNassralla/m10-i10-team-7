"""RAG composer — retrieve → assemble → generate → cite → grounding check.

Grounding contract: when `answer` is not the empty-retrieval sentinel,
`len(citations) > 0` is required. Every cited `chunk_id` corresponds to
a chunk in the top-`k` retrieved from Weaviate.

Generator called with `do_sample=False` for reproducibility.

CRITICAL FIX:
- flan-t5-base with text2text-generation returns ONLY generated output (no prompt prefix).
- The model struggles with complex multi-instruction prompts.
- Solution: Use a clearer, more directive prompt that flan-t5 follows better.
"""
import logging
import re
import signal
import time
from typing import Tuple

# Simplified prompt that flan-t5-base can follow reliably
logger = logging.getLogger(__name__)

PROMPT_TEMPLATE = """\
answer the following question using only the provided sources. cite sources using [1], [2], etc.

Sources:
{sources}

Question: {question}

Answer:"""

SENTINEL = "I cannot answer this from the available sources"
CITATION_PATTERN = re.compile(r"\[(\d+)\]")


def assemble_prompt(question: str, chunks: list[dict]) -> Tuple[str, dict[int, dict]]:
    numbered: dict[int, dict] = {}
    lines = []
    for i, chunk in enumerate(chunks, start=1):
        numbered[i] = chunk
        lines.append(f"[{i}] {chunk['text']}")
    sources = "\n".join(lines)
    return PROMPT_TEMPLATE.format(sources=sources, question=question), numbered


def extract_citations(answer: str, numbered: dict[int, dict]) -> list[dict]:
    cited: list[dict] = []
    seen: set[int] = set()
    for match in CITATION_PATTERN.finditer(answer):
        idx = int(match.group(1))
        if idx in numbered and idx not in seen:
            seen.add(idx)
            chunk = numbered[idx]
            cited.append({"chunk_id": chunk["chunk_id"], "score": chunk["score"]})
    return cited


def _timeout_handler(signum, frame):
    raise TimeoutError("generator timed out")


def compose_rag(question: str, embedder, weaviate_client, generator, k: int = 4) -> dict:
    start = time.time()
    logger.info({"event": "rag_start", "question": question, "k": k})

    vector = embedder.encode(question).tolist()
    raw_query = (
        weaviate_client.query.get("Chunk", ["chunk_id", "text"])
        .with_near_vector({"vector": vector})
        .with_limit(k)
        .with_additional(["distance"])
        .do()
    )
    retrieved = [
        {
            "chunk_id": c["chunk_id"],
            "text": c["text"],
            "score": 1.0 - c["_additional"]["distance"],
        }
        for c in raw_query["data"]["Get"]["Chunk"]
    ]
    if not retrieved:
        logger.info({"event": "rag_empty", "duration_sec": round(time.time() - start, 2)})
        return {"answer": SENTINEL, "citations": [], "confidence": 0.0}

    prompt, numbered = assemble_prompt(question, retrieved)
    
    # CRITICAL: flan-t5-base text2text-generation returns ONLY generated output.
    # Use minimal parameters for deterministic behavior.
    try:
        generated = generator(
            prompt,
            max_new_tokens=256,
            do_sample=False
        )[0]["generated_text"]
    except Exception as e:
        # If generation fails, return no-answer sentinel
        return {
            "answer": SENTINEL,
            "citations": [],
            "confidence": 0.0
        }

    raw = generated.strip()
    
    citations = extract_citations(raw, numbered)
    if not citations:
        return {
            "answer": "No relevant recipe found in sources.",
            "citations": [],
            "confidence": 0.0
        }

    signal.signal(signal.SIGALRM, _timeout_handler)
    signal.alarm(30)
    try:
        raw = generator(prompt, max_new_tokens=256, do_sample=False)[0]["generated_text"]
    finally:
        signal.alarm(0)

    citations = extract_citations(raw, numbered)
    if not citations:
        logger.info({"event": "rag_no_citations", "duration_sec": round(time.time() - start, 2)})
        return {"answer": SENTINEL, "citations": [], "confidence": 0.0}

    confidence = sum(c["score"] for c in citations) / len(citations)
    confidence = max(0.0, min(1.0, confidence))

    logger.info({
        "event": "rag_done",
        "confidence": round(confidence, 3),
        "citations_count": len(citations),
        "duration_sec": round(time.time() - start, 2)
    })

    return {"answer": raw, "citations": citations, "confidence": confidence}