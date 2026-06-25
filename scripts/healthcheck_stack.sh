set -euo pipefail

MAX=45
SLEEP=2
SERVICES="api web neo4j weaviate"

for i in $(seq 1 $MAX); do
    ALL_HEALTHY=true
    for svc in $SERVICES; do
        STATUS=$(docker compose ps --format json | python3 -c "
import sys, json
for line in sys.stdin:
    s = json.loads(line)
    if s.get('Service') == '$svc':
        print(s.get('Health', 'unknown'))
")
        if [ "$STATUS" != "healthy" ]; then
            ALL_HEALTHY=false
        fi
    done
    if $ALL_HEALTHY; then
        echo "All services healthy"
        exit 0
    fi
    echo "Waiting... ($i/$MAX)"
    sleep $SLEEP
done

echo "Timeout: not all services healthy"

exit 1
