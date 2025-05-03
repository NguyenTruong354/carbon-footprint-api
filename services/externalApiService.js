const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');
const { BadRequestError } = require('../utils/constants');

class ExternalApiService {
  async estimateEmissions(activityType, details) {
    try {
      logger.info(`Estimating emissions for ${activityType}: ${JSON.stringify(details)}`);
      if (activityType !== 'transport') {
        throw new BadRequestError('Carbon Interface API hiện chỉ hỗ trợ loại activity_type = transport');
      }
      const { distance, vehicle_model_id } = details;
      if (!distance || !vehicle_model_id) {
        throw new BadRequestError('details phải có distance (km) và vehicle_model_id');
      }
      const endpoint = 'https://www.carboninterface.com/api/v1/estimates';
      const response = await axios.post(
        endpoint,
        {
          type: 'vehicle',
          distance_unit: 'km',
          distance_value: distance,
          vehicle_model_id: vehicle_model_id
        },
        {
          headers: {
            Authorization: `Bearer ${env.CARBON_INTERFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const carbon_kg = response.data.data ? response.data.data.attributes.carbon_kg : response.data.data.attributes.carbon_kg;
      return {
        carbon_kg,
        activity_data: response.data,
        tip: 'Consider carpooling or using public transport to reduce emissions'
      };
    } catch (error) {
      logger.error(`ExternalApiService.estimateEmissions error: ${error.message}`);
      if (error.response) {
        logger.error(`API error: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }
}

module.exports = new ExternalApiService();