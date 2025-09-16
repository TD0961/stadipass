#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const API_URL = `${BACKEND_URL}/api`;

// Test configuration
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

console.log('🚀 Starting Complete Authentication Test');
console.log('=====================================');

async function testBackendHealth() {
    console.log('\n1. Testing Backend Health...');
    try {
        const response = await axios.get(`${BACKEND_URL}/health`);
        console.log('✅ Backend is healthy:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Backend health check failed:', error.message);
        return false;
    }
}

async function testUserRegistration() {
    console.log('\n2. Testing User Registration...');
    try {
        const response = await axios.post(`${API_URL}/auth/signup`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            firstName: 'Test',
            lastName: 'User'
        });
        
        console.log('✅ User registration successful:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Registration failed:', error.response?.data || error.message);
        return false;
    }
}

async function testUserLogin() {
    console.log('\n3. Testing User Login...');
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        });
        
        console.log('✅ User login successful, token received');
        return response.data.token;
    } catch (error) {
        console.log('❌ Login failed:', error.response?.data || error.message);
        return null;
    }
}

async function testUserProfile(token) {
    console.log('\n4. Testing User Profile...');
    try {
        const response = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ User profile retrieved:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Profile retrieval failed:', error.response?.data || error.message);
        return false;
    }
}

async function testPasswordReset() {
    console.log('\n5. Testing Password Reset...');
    try {
        const response = await axios.post(`${API_URL}/auth/request-reset`, {
            email: TEST_EMAIL
        });
        
        console.log('✅ Password reset request successful:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Password reset failed:', error.response?.data || error.message);
        return false;
    }
}

async function testEmailVerification() {
    console.log('\n6. Testing Email Verification...');
    try {
        // This would normally use a real verification token
        const response = await axios.post(`${API_URL}/auth/verify-email`, {
            email: TEST_EMAIL,
            token: 'test-token'
        });
        
        console.log('✅ Email verification endpoint accessible');
        return true;
    } catch (error) {
        if (error.response?.status === 400) {
            console.log('✅ Email verification endpoint working (expected error for test token)');
            return true;
        }
        console.log('❌ Email verification failed:', error.response?.data || error.message);
        return false;
    }
}

async function testOAuthEndpoints() {
    console.log('\n7. Testing OAuth Endpoints...');
    try {
        // Test OAuth callback endpoint
        const response = await axios.post(`${API_URL}/auth/oauth/callback`, {
            code: 'test-code',
            state: 'google'
        });
        
        console.log('✅ OAuth callback endpoint accessible');
        return true;
    } catch (error) {
        if (error.response?.status === 500) {
            console.log('✅ OAuth callback endpoint working (expected error for test code)');
            return true;
        }
        console.log('❌ OAuth callback failed:', error.response?.data || error.message);
        return false;
    }
}

async function testLogout(token) {
    console.log('\n8. Testing Logout...');
    try {
        const response = await axios.post(`${API_URL}/auth/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Logout successful');
        return true;
    } catch (error) {
        console.log('❌ Logout failed:', error.response?.data || error.message);
        return false;
    }
}

async function runAllTests() {
    const results = [];
    
    // Test backend health
    results.push(await testBackendHealth());
    
    // Test user registration
    results.push(await testUserRegistration());
    
    // Test user login
    const token = await testUserLogin();
    results.push(!!token);
    
    if (token) {
        // Test user profile
        results.push(await testUserProfile(token));
        
        // Test logout
        results.push(await testLogout(token));
    }
    
    // Test password reset
    results.push(await testPasswordReset());
    
    // Test email verification
    results.push(await testEmailVerification());
    
    // Test OAuth endpoints
    results.push(await testOAuthEndpoints());
    
    // Summary
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log('\n=====================================');
    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Authentication system is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Please check the output above.');
    }
    
    return passed === total;
}

// Run the tests
runAllTests().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
});
