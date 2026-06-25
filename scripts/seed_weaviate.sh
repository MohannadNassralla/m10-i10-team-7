set -euo pipefail

docker compose exec -T api python seed_weaviate.py

echo "Weaviate seeded successfully"