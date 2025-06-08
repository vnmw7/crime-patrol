require("dotenv").config();
const express = require("express");
const request = require("http");

// First, let's start our server
require("./src/index.js");

// Wait a bit for the server to start, then run tests
setTimeout(async () => {
  console.log("🧪 Testing API endpoints...\n");

  // Test function to make HTTP requests
  const makeRequest = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "localhost",
        port: 3000,
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      const req = request.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data: body });
          }
        });
      });

      req.on("error", reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  };

  try {
    // Test 1: Root endpoint
    console.log("📡 Test 1: Testing root endpoint...");
    const rootResponse = await makeRequest("GET", "/");
    console.log(`✅ Root endpoint: ${rootResponse.statusCode}`);
    console.log(`   Message: ${rootResponse.data.message}\n`);

    // Test 2: Create user via API
    console.log("👤 Test 2: Creating user via API...");
    const userData = {
      firstName: "Jane",
      lastName: "Smith",
      role: "citizen",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      address: "456 Oak Ave, Town, State",
    };

    const createUserResponse = await makeRequest(
      "POST",
      "/api/users",
      userData
    );
    console.log(`✅ Create user: ${createUserResponse.statusCode}`);
    if (createUserResponse.statusCode === 201) {
      console.log(`   User ID: ${createUserResponse.data.user.$id}\n`);
    } else {
      console.log(`   Response: ${JSON.stringify(createUserResponse.data)}\n`);
    }

    // Test 3: Get users via API
    console.log("📋 Test 3: Getting users via API...");
    const getUsersResponse = await makeRequest(
      "GET",
      "/api/users?includeContacts=true"
    );
    console.log(`✅ Get users: ${getUsersResponse.statusCode}`);
    if (getUsersResponse.statusCode === 200) {
      console.log(`   Found ${getUsersResponse.data.length} users\n`);
    } else {
      console.log(`   Response: ${JSON.stringify(getUsersResponse.data)}\n`);
    }

    console.log("🎉 API endpoint tests completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ API test failed:", error);
    process.exit(1);
  }
}, 5000); // Wait 5 seconds for server to start
