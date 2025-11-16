#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="${API_URL:-https://api.vivaform.com}"
WEB_URL="${WEB_URL:-https://app.vivaform.com}"
METRICS_SECRET="${METRICS_SECRET:-}"

echo "🔍 VivaForm Production Smoke Tests"
echo "=================================="
echo "API: $API_URL"
echo "Web: $WEB_URL"
echo ""

# Test counter
PASSED=0
FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED++))
}

fail() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# Test 1: Health endpoint
echo "Testing health endpoint..."
if curl -f -s -m 5 "$API_URL/health" > /dev/null 2>&1; then
  pass "Health endpoint responding"
else
  fail "Health endpoint not responding"
fi

# Test 2: Frontend
echo "Testing frontend..."
if curl -f -s -I -m 5 "$WEB_URL" > /dev/null 2>&1; then
  pass "Frontend accessible"
else
  fail "Frontend not accessible"
fi

# Test 3: CORS
echo "Testing CORS..."
CORS_RESPONSE=$(curl -s -H "Origin: $WEB_URL" -I "$API_URL/health" 2>&1)
if echo "$CORS_RESPONSE" | grep -qi "access-control-allow-origin"; then
  pass "CORS headers present"
else
  warn "CORS headers missing (may be expected for same-origin)"
fi

# Test 4: Metrics endpoint (if secret provided)
if [ ! -z "$METRICS_SECRET" ]; then
  echo "Testing metrics endpoint..."
  if curl -f -s -m 5 -H "X-Internal-Key: $METRICS_SECRET" "$API_URL/metrics" > /dev/null 2>&1; then
    pass "Metrics endpoint accessible with secret"
  else
    fail "Metrics endpoint not accessible"
  fi

  # Test metrics without secret (should fail)
  if curl -f -s -m 5 "$API_URL/metrics" > /dev/null 2>&1; then
    fail "Metrics endpoint accessible WITHOUT secret (security issue!)"
  else
    pass "Metrics endpoint properly protected"
  fi
else
  warn "METRICS_SECRET not set, skipping metrics tests"
fi

# Test 5: Security headers
echo "Testing security headers..."
HEADERS=$(curl -s -I "$WEB_URL" 2>&1)
if echo "$HEADERS" | grep -qi "x-frame-options\|content-security-policy"; then
  pass "Security headers present"
else
  warn "Some security headers missing"
fi

# Test 6: HTTPS redirect (if production)
if [[ "$API_URL" == https://* ]]; then
  echo "Testing HTTPS redirect..."
  HTTP_URL=$(echo "$API_URL" | sed 's/https:/http:/')
  REDIRECT=$(curl -s -I -m 5 "$HTTP_URL/health" 2>&1)
  if echo "$REDIRECT" | grep -qi "301\|302\|307\|308"; then
    pass "HTTPS redirect configured"
  else
    warn "No HTTPS redirect detected"
  fi
fi

# Test 7: Rate limiting (gentle test)
echo "Testing rate limiting..."
SUCCESS_COUNT=0
for i in {1..10}; do
  if curl -f -s -m 2 "$API_URL/health" > /dev/null 2>&1; then
    ((SUCCESS_COUNT++))
  fi
  sleep 0.1
done

if [ $SUCCESS_COUNT -ge 8 ]; then
  pass "Rate limiting allows normal traffic"
else
  warn "Rate limiting may be too strict ($SUCCESS_COUNT/10 succeeded)"
fi

# Test 8: Response time
echo "Testing response time..."
START_TIME=$(date +%s%3N)
curl -f -s -m 5 "$API_URL/health" > /dev/null 2>&1
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ $RESPONSE_TIME -lt 500 ]; then
  pass "Response time OK (${RESPONSE_TIME}ms)"
elif [ $RESPONSE_TIME -lt 1000 ]; then
  warn "Response time slow (${RESPONSE_TIME}ms)"
else
  fail "Response time too slow (${RESPONSE_TIME}ms)"
fi

# Summary
echo ""
echo "=================================="
echo "Summary: $PASSED passed, $FAILED failed"
echo "=================================="

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All critical tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed. Check logs above.${NC}"
  exit 1
fi

