# Team Roster — Module 10 Integration

This file is the team roster artifact for the Module 10 four-service Docker Compose Integration. The instructional team pre-populates the role assignments before handing the template repo to the team; the team fills in the Team Member identifier, branch, and Slack channel fields.

> **No personal names** in this file. Use anonymized initials, role tokens, or team-chosen identifiers. The team grading and TA cross-reference use `git log --author=<email>` for attribution, not names in this file.

---

## Team Identity

- **Team name:** team-m10-integration-7
- **Team Slack channel:** #m10-team-integration-7
- **Team-formation date:** 2026-06-25
- **Designated team submitter:** Infra-Integration lead

---

## Team Roster

| Role | Team Member identifier | Assigned by | Branch | Internal-PR reviewer | Primary files owned |
|---|---|---|---|---|---|
| Backend lead | BA-LEAD | Instructional team | `backend/api-endpoints` | Frontend lead | `api/main.py`, `api/models.py`, `api/rag.py`, `api/deps.py`, `api/Dockerfile` |
| Frontend lead | FE-LEAD | Instructional team | `frontend/nextjs-pages` | Backend lead | `web/pages/{extract,kg,rag}.tsx`, `web/lib/types.ts`, `web/Dockerfile`, `tests/frontend/playwright/*` |
| Infra-Integration lead | INFRA-LEAD | Instructional team | `infra/docker-compose` | Backend lead | `docker-compose.yml`, `seed_neo4j.sh`, `seed_weaviate.sh`, `.env.example`, `README.md`, `tests/integration/*` |
| Backend lead | _(initials or anon ID)_ | Instructional team | `backend/api-endpoints` | Frontend lead | `api/main.py`, `apomodels.py`, `api/rag.py`, `api/deps.py`, `api/Dockerfile` |
| Frontend lead | _(initials or anon ID)_ | Instructional team | `frontend/nextjs-pages` | Backend lead | `web/pages/{extract,kg,rag}.tsx`, `web/lib/types.ts`, `web/Dockerfile`, `tests/frontend/playwright/*` |
| Infra-Integration lead | _(initials or anon ID)_ | Instructional team | `infra/docker-compose` | Backend lead | `docker-compose.yml`, `seed_neo4j.sh`, `seed_weaviate.sh`, `.env.example`, `README.md`, `tests/integration/*` |

**Fallback compositions for non-3-Team-Member teams:**

- **2 Team Members:** Frontend and Infra-Integration roles merge.
- **4 Team Members:** Infra-Integration splits into "Compose + healthchecks" and "Seed + runbook".

---

## Per-Role File Checklist (used for TA grading cross-reference)

### Backend lead
- [ ] `api/main.py`
- [ ] `api/models.py`
- [ ] `api/rag.py`
- [ ] `api/deps.py`
- [ ] `api/Dockerfile`

### Frontend lead
- [ ] `web/pages/extract.tsx`
- [ ] `web/pages/kg.tsx`
- [ ] `web/pages/rag.tsx`
- [ ] `web/lib/types.ts`
- [ ] `web/Dockerfile`
- [ ] `tests/frontend/playwright/*.spec.ts`

### Infra-Integration lead
- [ ] `docker-compose.yml`
- [ ] `seed_neo4j.sh`
- [ ] `seed_weaviate.sh`
- [ ] `.env.example`
- [ ] `README.md`
- [ ] `tests/integration/test_stack_e2e.py`

---

## Escalation Checklist

1. Inline comment on internal PR
2. Team Slack channel with TA tagged
3. Support Instructor
4. Lead Instructor

---

## Contract-Change Protocol

- Backend lead announces Pydantic/OpenAPI changes before merge.
- Frontend lead requests schema changes via PR comments only.
- Infra lead announces `.env` / DNS / Compose changes before merge.

---

## Submission

1. Merge all role branches into `main`.
2. Ensure `docker compose up -d` works locally.
3. Submit repository link via TalentLMS.
4. Each member submits participation confirmation separately.