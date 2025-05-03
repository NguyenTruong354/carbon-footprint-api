const axios = require('axios');

// Base URL for API
const API_URL = 'http://localhost:3000/api';
let token = null;

/**
 * Test login endpoint
 */
const testLogin = async () => {
  try {
    console.log('1. Testing login endpoint...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: 'admin',
      password: '123'
    });
    
    token = response.data.data.token;
    console.log('✅ Login successful');
    console.log(`Token: ${token}`);
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Test creating a new activity
 */
const testCreateActivity = async () => {
  try {
    console.log('\n2. Testing create activity endpoint...');
    
    const response = await axios.post(
      `${API_URL}/activities`,
      {
        activity_type: 'transport',
        details: { distance: 10, vehicle: 'motorbike' },
        carbon_kg: 0.5
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const activityId = response.data.data.id;
    console.log('✅ Activity created successfully');
    console.log('Activity:', response.data.data);
    return activityId;
  } catch (error) {
    console.error('❌ Create activity failed:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Test getting all activities
 */
const testGetActivities = async () => {
  try {
    console.log('\n3. Testing get all activities endpoint...');
    
    const response = await axios.get(
      `${API_URL}/activities`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Activities retrieved successfully');
    console.log(`Found ${response.data.data.length} activities:`);
    console.log(response.data.data);
  } catch (error) {
    console.error('❌ Get activities failed:', error.response ? error.response.data : error.message);
  }
};

/**
 * Test updating an activity
 */
const testUpdateActivity = async (activityId) => {
  try {
    console.log(`\n4. Testing update activity endpoint for ID ${activityId}...`);
    
    const response = await axios.put(
      `${API_URL}/activities/${activityId}`,
      {
        activity_type: 'transport',
        details: { distance: 15, vehicle: 'car' },
        carbon_kg: 1.5
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Activity updated successfully');
    console.log(response.data);
  } catch (error) {
    console.error('❌ Update activity failed:', error.response ? error.response.data : error.message);
  }
};

/**
 * Test estimating emissions
 */
const testEstimateEmissions = async () => {
  try {
    console.log('\n5. Testing estimate emissions endpoint...');
    
    const details = JSON.stringify({ distance: 10, vehicle: 'car' });
    const response = await axios.get(
      `${API_URL}/activities/estimate?activity_type=transport&details=${details}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Emissions estimated successfully');
    console.log('Estimation:', response.data.data);
  } catch (error) {
    console.error('❌ Estimate emissions failed:', error.response ? error.response.data : error.message);
  }
};

/**
 * Test deleting an activity
 */
const testDeleteActivity = async (activityId) => {
  try {
    console.log(`\n6. Testing delete activity endpoint for ID ${activityId}...`);
    
    const response = await axios.delete(
      `${API_URL}/activities/${activityId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Activity deleted successfully');
    console.log(response.data);
  } catch (error) {
    console.error('❌ Delete activity failed:', error.response ? error.response.data : error.message);
  }
};

/**
 * Run all tests in sequence
 */
const runTests = async () => {
  console.log('🚀 Starting API tests...\n');
  
  try {
    // Login first to get token
    await testLogin();
    
    // Create activity
    const activityId = await testCreateActivity();
    
    // Get all activities
    await testGetActivities();
    
    // Update activity
    await testUpdateActivity(activityId);
    
    // Get activities again to see update
    await testGetActivities();
    
    // Estimate emissions
    await testEstimateEmissions();
    
    // Delete activity
    await testDeleteActivity(activityId);
    
    // Get activities again to confirm deletion
    await testGetActivities();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Tests failed!');
  }
};

// Run the tests
runTests();