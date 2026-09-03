#!/bin/bash
# ============================================================================
# FieldFlow CRM — Post-Deploy Health Check
# ============================================================================
# Verifies all production services are healthy after deployment.
# Usage: bash scripts/health-check.sh [app-url]
# ============================================================================
set -euo pipefail

APP_URL="${1:-http://localhost}"
COMPOSE_FILE="docker-compose.prod.yml"
FAILURES=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass() { echo -e "  ${GREEN}PASS${NC}  $*"; }
fail() { echo -e "  ${RED}FAIL${NC}  $*"; FAILURES=$((FAILURES + 1)); }
warn() { echo -e "  ${YELLOW}WARN${NC}  $*"; }

echo "========================================="
echo " FieldFlow CRM — Health Check"
echo "========================================="
echo ""

# 1. Docker containers
echo "[Docker Containers]"
for svc in app postgres nginx; do
    status=$(docker compose -f "$COMPOSE_FILE" ps --format json "$svc" 2>/dev/null | grep -o '"State":"[^"]*"' | cut -d'"' -f4 || echo "not found")
    if [[ "$status" == "running" ]]; then
        pass "$svc is running"
    else
        fail "$svc is $status"
    fi
done
echo ""

# 2. HTTP endpoint
echo "[HTTP Endpoint]"
http_code=$(curl -sf -o /dev/null -w "%{http_code}" "$APP_URL" 2>/dev/null || echo "000")
if [[ "$http_code" == "200" ]]; then
    pass "HTTP $http_code — $APP_URL"
elif [[ "$http_code" == "302" || "$http_code" == "301" ]]; then
    pass "HTTP $http_code — redirect (expected for auth)"
else
    fail "HTTP $http_code — $APP_URL"
fi
echo ""

# 3. Health endpoint
echo "[Health Endpoint]"
health_code=$(curl -sf -o /dev/null -w "%{http_code}" "$APP_URL/health" 2>/dev/null || echo "000")
if [[ "$health_code" == "200" ]]; then
    pass "Health check returned 200"
else
    warn "Health check returned $health_code (may not be configured yet)"
fi
echo ""

# 4. Database
echo "[Database]"
db_ok=$(docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U fieldflow 2>/dev/null && echo "yes" || echo "no")
if [[ "$db_ok" == "yes" ]]; then
    pass "PostgreSQL is accepting connections"
else
    fail "PostgreSQL is not responding"
fi
echo ""

# 5. Redis
echo "[Redis]"
redis_ok=$(docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping 2>/dev/null || echo "")
if [[ "$redis_ok" == *"PONG"* ]]; then
    pass "Redis is responding (PONG)"
else
    warn "Redis not responding (may not be critical)"
fi
echo ""

# 6. Disk space
echo "[Disk Space]"
disk_pct=$(df / | awk 'NR==2 {print $5}' | tr -d '%')
if [[ "$disk_pct" -lt 80 ]]; then
    pass "Disk usage: ${disk_pct}%"
elif [[ "$disk_pct" -lt 90 ]]; then
    warn "Disk usage: ${disk_pct}% (getting high)"
else
    fail "Disk usage: ${disk_pct}% (critical!)"
fi
echo ""

# 7. Container resource usage
echo "[Container Resources]"
docker stats --no-stream --format "  {{.Name}}: {{.CPUPerc}} CPU, {{.MemUsage}}" \
    $(docker compose -f "$COMPOSE_FILE" ps -q) 2>/dev/null || warn "Could not fetch stats"
echo ""

# Summary
echo "========================================="
if [[ "$FAILURES" -eq 0 ]]; then
    echo -e "${GREEN}All checks passed!${NC}"
else
    echo -e "${RED}${FAILURES} check(s) failed${NC}"
fi
echo "========================================="

exit "$FAILURES"
