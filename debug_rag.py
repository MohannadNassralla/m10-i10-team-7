#!/usr/bin/env python
"""Debug RAG answer generation issue."""
from api.rag import PROMPT_TEMPLATE, assemble_prompt, extract_citations
from api.m8_rag import load_generator
from sentence_transformers import SentenceTransformer

# Load deps
gen = load_generator()

# Mock chunks (simulating Weaviate retrieval)
chunks = [
    {
        "chunk_id": 3,
        "text": "Italian carbonara uses guanciale, pecorino or parmesan, eggs, and freshly cracked black pepper; never add cream.",
        "score": 0.58
    },
    {
        "chunk_id": 7,
        "text": "To make carbonara, cook pasta, then mix with beaten eggs, cheese, and bacon. The heat from the pasta cooks the eggs [1].",
        "score": 0.55
    }
]

# Assemble prompt with new format
prompt, numbered = assemble_prompt("how to make carbonara", chunks)
print("PROMPT:")
print(repr(prompt))
print("\nPROMPT (display):")
print(prompt)
print("\n" + "="*80 + "\n")

# Generate
generated = gen(
    prompt,
    max_new_tokens=256,
    do_sample=False
)[0]["generated_text"]

print("RAW GENERATED:")
print(repr(generated[:500]))
print("\nRAW GENERATED (display):")
print(generated[:500])
print("\n" + "="*80 + "\n")

# Extract citations
raw = generated.strip()
citations = extract_citations(raw, numbered)
print("CITATIONS:", citations)
print("ANSWER:", raw)
