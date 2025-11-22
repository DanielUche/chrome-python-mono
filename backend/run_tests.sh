#!/bin/bash
set -e

echo "🧪 Chrome Python Monitor - Backend Test Suite"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pytest is installed
if ! command -v pytest &> /dev/null; then
    echo "${YELLOW}Installing pytest...${NC}"
    pip install pytest pytest-cov
fi

# Parse arguments
TEST_TYPE=${1:-all}

case $TEST_TYPE in
    all)
        echo "${GREEN}Running all tests...${NC}"
        python -m pytest tests/ -v
        ;;
    
    metrics)
        echo "${GREEN}Running metrics endpoint tests...${NC}"
        python -m pytest tests/test_metrics.py -v
        ;;
    
    services)
        echo "${GREEN}Running services layer tests...${NC}"
        python -m pytest tests/test_services.py -v
        ;;
    
    schemas)
        echo "${GREEN}Running schema validation tests...${NC}"
        python -m pytest tests/test_schemas.py -v
        ;;
    
    routes)
        echo "${GREEN}Running route tests...${NC}"
        python -m pytest tests/test_routes.py -v
        ;;
    
    coverage)
        echo "${GREEN}Running tests with coverage report...${NC}"
        python -m pytest tests/ --cov=app --cov-report=html --cov-report=term
        echo "${GREEN}Coverage report generated in htmlcov/index.html${NC}"
        ;;
    
    quick)
        echo "${GREEN}Running quick test summary...${NC}"
        python -m pytest tests/ -v --tb=no -q
        ;;
    
    list)
        echo "${GREEN}Listing all available tests...${NC}"
        python -m pytest tests/ --collect-only -q
        ;;
    
    *)
        echo "${RED}Unknown test type: $TEST_TYPE${NC}"
        echo ""
        echo "Usage: ./run_tests.sh [type]"
        echo ""
        echo "Available types:"
        echo "  all        - Run all tests (default)"
        echo "  metrics    - Run metrics endpoint tests"
        echo "  services   - Run services layer tests"
        echo "  schemas    - Run schema validation tests"
        echo "  routes     - Run route tests"
        echo "  coverage   - Run with coverage report"
        echo "  quick      - Run quick summary"
        echo "  list       - List all tests"
        exit 1
        ;;
esac

echo ""
echo "${GREEN}✅ Test run completed!${NC}"
