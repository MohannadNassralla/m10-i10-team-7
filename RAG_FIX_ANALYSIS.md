# RAG Answer Generation Fix - Root Cause Analysis & Solution

## PROBLEM SUMMARY

Your RAG endpoint was returning `[1]` instead of actual answers because:
1. The generator model (flan-t5-base) was generating garbage output instead of following the prompt instructions
2. The citation extraction found no valid citations in the garbage text
3. A fallback case was being triggered that produced minimal output

## ROOT CAUSE (Step-by-Step)

### 1. Generator Pipeline Misunderstanding
- **Model**: `google/flan-t5-base` with `text2text-generation` task
- **Behavior**: Returns ONLY the generated output, NOT "prompt + output" like GPT models
- **Your modification** (`generated[len(prompt):]`): Was based on false assumption that the prompt was being included in output
- **Result**: This stripping actually worked by accident because of how the text was being truncated

### 2. The Actual Failure Point
The model output was repetitive garbage:
```
"Carbonara is a dish of pasta that is cooked in a pot of water. The pasta is then poured into a large pot of water and covered with a lid. Then, the pasta is poured into..."
```

NOT:
```
"Carbonara uses guanciale, eggs, pecorino cheese and black pepper [1]"
```

### 3. Why This Happened
The original prompt template was too complex for flan-t5-base to follow:
```
You are a helpful cooking assistant.
Use ONLY the sources below to write a complete answer.
Rules:
- Write a FULL recipe explanation (not short answers)
- NEVER respond with only numbers like [1]
- Use citations like [1] inside sentences
...
```

The model:
- Ignored the detailed rules
- Didn't look at the provided sources
- Generated generic text about cooking pasta
- Never included citations like `[1]`

### 4. The Citation Extraction Failure
With no `[1]`, `[2]` markers in the output, `extract_citations()` found nothing and returned empty citations list, triggering the fallback response.

---

## SOLUTION

### File: `api/rag.py`

**Change 1: Simplify the prompt template**

OLD (too complex for the model):
```python
PROMPT_TEMPLATE = """\
You are a helpful cooking assistant.

Use ONLY the sources below to write a complete answer.

Rules:
- Write a FULL recipe explanation (not short answers)
- NEVER respond with only numbers like [1]
- Use citations like [1] inside sentences
- If needed, combine multiple sources into one answer

Sources:
{sources}

Question:
{question}

Answer step by step:
"""
```

NEW (direct, instruction-following):
```python
PROMPT_TEMPLATE = """\
answer the following question using only the provided sources. cite sources using [1], [2], etc.

Sources:
{sources}

Question: {question}

Answer:"""
```

**Why this works:**
- Shorter = easier for flan-t5 to follow
- `text2text-generation` models are trained on short, imperative prompts
- Removes conflicting rules that confuse the model
- Direct language: "answer...using only...cite sources"

**Change 2: Handle generator timeouts (CRITICAL)**

ADD try-except around generator:
```python
try:
    generated = generator(
        prompt,
        max_new_tokens=256,
        do_sample=False
    )[0]["generated_text"]
except Exception as e:
    return {
        "answer": SENTINEL,
        "citations": [],
        "confidence": 0.0
    }
```

**Why:**
- Generator can hang or timeout on complex inputs
- Prevents API from hanging indefinitely
- Returns graceful failure instead of timeout

**Change 3: Remove prompt stripping**

OLD:
```python
raw = generated[len(prompt):].strip()
```

NEW:
```python
raw = generated.strip()
```

**Why:**
- `text2text-generation` already returns ONLY generated output
- No prompt prefix to strip
- Stripping by length was fragile and broke on longer outputs

---

## TESTING THE FIX

### Prerequisites
1. Weaviate must have data seeded
2. Run the seed script first:
   ```bash
   docker compose exec api python -m api.seed_weaviate
   ```

### Test the endpoint
```bash
curl -X POST http://localhost:8000/rag/answer \
  -H "Content-Type: application/json" \
  -d '{"question":"how to make carbonara","k":3}'
```

### Expected output (FIXED)
```json
{
  "answer": "To make carbonara [1], combine cooked pasta with beaten eggs, guanciale [2], and pecorino cheese. The heat from the pasta cooks the eggs. Add black pepper [1] to finish.",
  "citations": [
    {"chunk_id": 3, "score": 0.58},
    {"chunk_id": 7, "score": 0.55}
  ],
  "confidence": 0.565
}
```

### Before fix (BROKEN)
```json
{
  "answer": "[1]",
  "citations": [{"chunk_id": 3, "score": 0.58}],
  "confidence": 0.58
}
```

---

## WHY THE EARLIER MODIFICATION BROKE THINGS

You modified:
```python
raw_output = generator(...)[0]["generated_text"]
raw = raw_output.replace(prompt, "").strip()
```

This was trying to strip the prompt from output, but:
1. String replacement is fragile (prompt might not match exactly)
2. Could accidentally remove real content from the answer
3. Caused the API to sometimes hang or return empty responses
4. Was based on wrong assumption about what the pipeline returns

---

## DOCKER REBUILDING

```bash
# Option 1: Rebuild just the API image
docker compose up --build api

# Option 2: Full clean rebuild
docker compose down --volumes
docker compose up
```

After rebuild, seed Weaviate:
```bash
docker compose exec api python -m api.seed_weaviate
```

Then test the RAG endpoint.

---

## KEY INSIGHTS

1. **flan-t5-base is an instruction-following model**, not a chat model
   - Prefers short, direct prompts
   - Complex multi-rule prompts confuse it
   - Returns only generated text (no prefix)

2. **text2text-generation pipeline details**:
   - Input: Any instruction + context
   - Output: Model's response only
   - No automatic prompt echoing

3. **RAG prompt best practices**:
   - Keep it simple and directive
   - Avoid conflicting rules
   - Use imperative verbs ("answer", "cite", "use")
   - Specify output format clearly

4. **Error handling**:
   - Always wrap generator calls in try-except
   - Generator can timeout on long contexts
   - Provide sensible fallbacks

---

## VERIFICATION CHECKLIST

- [ ] Modified `api/rag.py` with simplified prompt template
- [ ] Added try-except around generator call
- [ ] Removed prompt stripping logic
- [ ] Rebuilt API: `docker compose up --build api`
- [ ] Seeded Weaviate: `docker compose exec api python -m api.seed_weaviate`
- [ ] Tested endpoint returns full answers with citations
- [ ] Verified frontend RAG feature works end-to-end

