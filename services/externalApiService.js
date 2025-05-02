const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const { BadRequestError } = require('../utils/constants');

/**
 * Service for communicating with external APIs
 */
class ExternalApiService {
  /**
   * Get carbon emission estimate from Climatiq API
   * @param {string} activityType - The type of activity
   * @param {Object} details - The activity details
   * @returns {Promise<Object>} The carbon emission data
   */
  async estimateEmissions(activityType, details) {
    try {
      logger.info(`Estimating emissions for ${activityType}: ${JSON.stringify(details)}`);
      
      let requestData;
      let endpoint = 'https://api.climatiq.io/data/v1/estimate';
      
      switch (activityType) {
        case 'transport':
          requestData = this.prepareTransportRequest(details);
          break;
        case 'electricity':
          requestData = this.prepareElectricityRequest(details);
          break;
        case 'food':
          requestData = this.prepareFoodRequest(details);
          break;
        default:
          throw new BadRequestError(`Unsupported activity type: ${activityType}`);
      }
      
      const response = await axios.post(endpoint, requestData, {
        headers: {
          'Authorization': `Bearer ${env.CLIMATIQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        carbon_kg: response.data.co2e,
        activity_data: response.data,
        tip: this.generateTip(activityType, details, response.data.co2e)
      };
    } catch (error) {
      logger.error(`ExternalApiService.estimateEmissions error: ${error.message}`);
      if (error.response) {
        logger.error(`API error: ${JSON.stringify(error.response.data)}`);
        if (error.response.data.error_code === 'no_emission_factors_found') {
          logger.warn(`No emission factor found for ${activityType}, using fallback`);
          if (activityType === 'transport' && details.distance) {
            return {
              carbon_kg: 0.2 * details.distance, // Ước tính: 0.2kg CO2/km
              activity_data: { note: 'Fallback estimation due to unavailable emission factor' },
              tip: this.generateTip(activityType, details, 0.2 * details.distance)
            };
          }
          throw new BadRequestError('Unable to estimate emissions: Invalid or unsupported activity type');
        }
        throw new BadRequestError(`Climatiq API error: ${error.response.data.message}`);
      }
      throw error;
    }
  }

  /**
   * Prepare transport activity request for Climatiq API
   * @param {Object} details - The transport details
   * @returns {Object} The formatted request object
   */
  prepareTransportRequest(details) {
    const { distance, vehicle } = details;
    
    if (!distance || typeof distance !== 'number' || distance <= 0) {
      throw new BadRequestError('Distance must be a positive number');
    }
    if (!vehicle || typeof vehicle !== 'string') {
      throw new BadRequestError('Vehicle must be a valid string');
    }
    
    const dataVersion = env.CLIMATIQ_DATA_VERSION || '21.21';
    if (!dataVersion) {
      throw new BadRequestError('Climatiq data version not configured');
    }
    
    const vehicleTypeMap = {
      car: () => ({
        activity_id: 'passenger_vehicle-vehicle_type_car-fuel_source_petrol-engine_size_na',
        region: 'global',
        data_version: dataVersion
      }),
      bus: () => ({
        activity_id: 'passenger_vehicle-vehicle_type_bus-fuel_source_na',
        region: 'global',
        data_version: dataVersion
      }),
      train: () => ({
        activity_id: 'passenger_train-route_type_commuter_rail-fuel_source_na',
        region: 'global',
        data_version: dataVersion
      }),
      plane: () => ({
        activity_id: 'passenger_flight-route_type_domestic-aircraft_type_jet-distance_na-class_na',
        region: 'global',
        data_version: dataVersion
      }),
      bicycle: () => null
    };
    
    if (vehicle === 'motorbike' || vehicle === 'motorcycle') {
      throw new BadRequestError('Hiện tại không hỗ trợ tính toán khí thải cho motorbike/motorcycle. Vui lòng chọn loại phương tiện khác.');
    }
    
    if (!vehicleTypeMap[vehicle]) {
      throw new BadRequestError(`Unsupported vehicle type: ${vehicle}`);
    }
    
    if (vehicle === 'bicycle') {
      return { co2e: 0 };
    }
    
    const emissionFactor = vehicleTypeMap[vehicle](details);
    
    if (!emissionFactor.activity_id || !emissionFactor.region) {
      throw new BadRequestError('Invalid emission factor configuration');
    }
    
    return {
      emission_factor: emissionFactor,
      parameters: {
        distance: parseFloat(distance),
        distance_unit: 'km'
      }
    };
  }

  /**
   * Generate tip based on activity type and emissions
   * @param {string} activityType - The type of activity
   * @param {Object} details - The activity details
   * @param {number} carbonKg - The carbon emission in kg
   * @returns {string} A tip for reducing emissions
   */
  generateTip(activityType, details, carbonKg) {
    switch (activityType) {
      case 'transport':
        if (details.vehicle === 'car' && carbonKg > 5) {
          return 'Consider carpooling or using public transport to reduce emissions';
        } else if (details.vehicle === 'motorbike') {
          return 'Consider biking for short distances to reduce emissions';
        } else if (details.vehicle === 'plane') {
          return 'Consider offsetting your flight emissions or taking direct routes when possible';
        }
        return 'Consider using more eco-friendly transportation options';
        
      case 'electricity':
        return 'Try to reduce energy consumption during peak hours and consider renewable energy sources';
        
      case 'food':
        if (details.food_type === 'beef' || details.food_type === 'lamb') {
          return 'Consider reducing red meat consumption to lower your carbon footprint';
        }
        return 'Try to buy local and seasonal food to reduce transportation emissions';
        
      default:
        return 'Small changes in daily habits can significantly reduce your carbon footprint';
    }
  }
}

module.exports = new ExternalApiService();