set -euo pipefail

source .env

docker compose exec -T neo4j cypher-shell \
    -u $NEO4J_USER \
    -p $NEO4J_PASSWORD \
    < seed.cypher


echo "Neo4j seeded successfully"