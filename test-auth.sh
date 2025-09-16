#!/bin/bash

# StadiPass Authentication Integration Test Script
# This script tests the complete authentication flow with the backend

set -e

echo "🚀 Starting StadiPass Authentication Integration Tests"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:5173"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test functions
test_backend_health() {
    log_info "Testing backend health..."
    
    if curl -sf "$BACKEND_URL/health" > /dev/null; then
        log_success "Backend is healthy"
        return 0
    else
        log_error "Backend is not responding"
        return 1
    fi
}

test_user_registration() {
    log_info "Testing user registration..."
    
    local response=$(curl -s -w "%{http_code}" -X POST "$BACKEND_URL/api/auth/signup" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\",
            \"firstName\": \"Test\",
            \"lastName\": \"User\"
        }")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "201" ]; then
        log_success "User registration successful"
        echo "Response: $body"
        return 0
    else
        log_error "User registration failed (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

test_user_login() {
    log_info "Testing user login..."
    
    local response=$(curl -s -w "%{http_code}" -X POST "$BACKEND_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"$TEST_EMAIL\",
            \"password\": \"$TEST_PASSWORD\"
        }")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        log_success "User login successful"
        # Extract token for further tests
        TOKEN=$(echo "$body" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
        echo "Token extracted: ${TOKEN:0:20}..."
        return 0
    else
        log_error "User login failed (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

test_password_reset_request() {
    log_info "Testing password reset request..."
    
    local response=$(curl -s -w "%{http_code}" -X POST "$BACKEND_URL/api/auth/request-reset" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"$TEST_EMAIL\"}")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        log_success "Password reset request successful"
        echo "Response: $body"
        return 0
    else
        log_error "Password reset request failed (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

test_user_profile() {
    log_info "Testing user profile retrieval..."
    
    if [ -z "$TOKEN" ]; then
        log_error "No token available for profile test"
        return 1
    fi
    
    local response=$(curl -s -w "%{http_code}" -X GET "$BACKEND_URL/api/auth/me" \
        -H "Authorization: Bearer $TOKEN")
    
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [ "$http_code" = "200" ]; then
        log_success "User profile retrieval successful"
        echo "Response: $body"
        return 0
    else
        log_error "User profile retrieval failed (HTTP $http_code)"
        echo "Response: $body"
        return 1
    fi
}

test_frontend_build() {
    log_info "Testing frontend build..."
    
    cd frontend
    
    if npm run build > /dev/null 2>&1; then
        log_success "Frontend build successful"
        cd ..
        return 0
    else
        log_error "Frontend build failed"
        cd ..
        return 1
    fi
}

test_frontend_tests() {
    log_info "Running frontend tests..."
    
    cd frontend
    
    if npm run test > /dev/null 2>&1; then
        log_success "Frontend tests passed"
        cd ..
        return 0
    else
        log_warning "Some frontend tests failed (check output above)"
        cd ..
        return 1
    fi
}

# Main test execution
main() {
    echo "Test Configuration:"
    echo "  Backend URL: $BACKEND_URL"
    echo "  Frontend URL: $FRONTEND_URL"
    echo "  Test Email: $TEST_EMAIL"
    echo ""
    
    local tests_passed=0
    local tests_total=0
    
    # Backend tests
    tests_total=$((tests_total + 1))
    if test_backend_health; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_user_registration; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_user_login; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_password_reset_request; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_user_profile; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Frontend tests
    tests_total=$((tests_total + 1))
    if test_frontend_build; then
        tests_passed=$((tests_passed + 1))
    fi
    
    tests_total=$((tests_total + 1))
    if test_frontend_tests; then
        tests_passed=$((tests_passed + 1))
    fi
    
    # Summary
    echo ""
    echo "=================================================="
    echo "Test Results: $tests_passed/$tests_total tests passed"
    
    if [ $tests_passed -eq $tests_total ]; then
        log_success "All tests passed! 🎉"
        exit 0
    else
        log_error "Some tests failed. Please check the output above."
        exit 1
    fi
}

# Check if backend is running
if ! test_backend_health; then
    log_error "Backend is not running. Please start the backend first:"
    echo "  cd backend && npm run dev"
    exit 1
fi

# Run tests
main

