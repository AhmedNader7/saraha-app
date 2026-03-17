import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import fs from "fs";

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

const BASE_URL = "http://localhost:3003";

// Test data
const testEmail = "test@example.com";
const testPassword = "password123";
const testPublicUsername = "testuser";
const mockOTP = "123456"; // Mock OTP for testing

// Results array
const results = [];

// Helper function to log result
function logResult(apiName, success) {
  const status = success ? "✅" : "❌";
  const result = success ? "Work" : "False";
  const line = `${status} ${apiName}: ${result}`;
  results.push(line);
  console.log(line);
}

// Test Signup
async function testSignup() {
  try {
    const response = await client.post(`${BASE_URL}/api/auth/signup`, {
      email: testEmail,
      password: testPassword,
      publicUsername: testPublicUsername,
    });
    if (response.status === 200) {
      logResult("Signup", true);
      return true;
    } else {
      logResult("Signup", false);
      return false;
    }
  } catch (error) {
    console.error("Signup error:", error.response?.data || error.message);
    logResult("Signup", false);
    return false;
  }
}

// Test OTP Verification
async function testVerifyOTP() {
  try {
    const response = await client.post(`${BASE_URL}/api/auth/verify-otp`, {
      email: testEmail,
      code: mockOTP,
      password: testPassword,
      publicUsername: testPublicUsername,
    });
    if (response.status === 201) {
      logResult("OTP Verification", true);
      // Extract access token
      const accessToken = response.data.data.accessToken;
      return accessToken;
    } else {
      logResult("OTP Verification", false);
      return null;
    }
  } catch (error) {
    console.error(
      "OTP Verification error:",
      error.response?.data || error.message,
    );
    logResult("OTP Verification", false);
    return null;
  }
}

// Test Login
async function testLogin() {
  try {
    const response = await client.post(`${BASE_URL}/api/auth/login`, {
      email: testEmail,
      password: testPassword,
    });
    if (response.status === 200) {
      logResult("Login", true);
      // Extract access token
      const accessToken = response.data.data.accessToken;
      return accessToken;
    } else {
      logResult("Login", false);
      return null;
    }
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    logResult("Login", false);
    return null;
  }
}

// Test Protected Profile
async function testProfile(accessToken) {
  try {
    const response = await client.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.status === 200) {
      logResult("Protected Profile", true);
      return true;
    } else {
      logResult("Protected Profile", false);
      return false;
    }
  } catch (error) {
    console.error("Profile error:", error.response?.data || error.message);
    logResult("Protected Profile", false);
    return false;
  }
}

// Test Token Refresh
async function testRefresh() {
  try {
    const response = await client.post(`${BASE_URL}/api/auth/refresh`);
    if (response.status === 200) {
      logResult("Token Refresh", true);
      return true;
    } else {
      logResult("Token Refresh", false);
      return false;
    }
  } catch (error) {
    console.error("Refresh error:", error.response?.data || error.message);
    logResult("Token Refresh", false);
    return false;
  }
}

// Test Anonymous Message
async function testAnonymousMessage() {
  try {
    const response = await client.post(
      `${BASE_URL}/api/messages/send/${testPublicUsername}`,
      {
        content: "Test anonymous message",
      },
    );
    if (response.status === 201) {
      logResult("Anonymous Message", true);
      return true;
    } else {
      logResult("Anonymous Message", false);
      return false;
    }
  } catch (error) {
    console.error(
      "Anonymous Message error:",
      error.response?.data || error.message,
    );
    logResult("Anonymous Message", false);
    return false;
  }
}

// Test Logout
async function testLogout(accessToken) {
  try {
    const response = await client.post(
      `${BASE_URL}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    if (response.status === 200) {
      logResult("Logout", true);
      return true;
    } else {
      logResult("Logout", false);
      return false;
    }
  } catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    logResult("Logout", false);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log("Starting API tests...\n");

  // 1. Signup
  const signupSuccess = await testSignup();
  if (!signupSuccess) {
    console.log("Signup failed, skipping further tests.");
  }

  // 2. OTP Verification
  const accessTokenFromVerify = await testVerifyOTP();

  // 3. Login (assuming user is now verified)
  const accessTokenFromLogin = await testLogin();

  // Use access token from login for protected routes
  const accessToken = accessTokenFromLogin || accessTokenFromVerify;

  if (accessToken) {
    // 4. Protected Profile
    await testProfile(accessToken);

    // 5. Token Refresh
    await testRefresh();

    // 6. Anonymous Message
    await testAnonymousMessage();

    // 7. Logout
    await testLogout(accessToken);
  } else {
    console.log("No access token, skipping protected tests.");
    logResult("Protected Profile", false);
    logResult("Token Refresh", false);
    logResult("Anonymous Message", false);
    logResult("Logout", false);
  }

  // Write results to file
  const output = results.join("\n");
  fs.writeFileSync("test-results.txt", output);
  console.log("\nTest results written to test-results.txt");
}

// Run the tests
runTests().catch(console.error);
