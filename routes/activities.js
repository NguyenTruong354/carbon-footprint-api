const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/activities
 * @desc    Create a new activity
 * @access  Private
 */
router.post('/', activityController.createActivity);

/**
 * @route   GET /api/activities
 * @desc    Get all activities for authenticated user
 * @access  Private
 */
router.get('/', activityController.getAllActivities);

/**
 * @route   GET /api/activities/estimate
 * @desc    Estimate carbon emissions for an activity
 * @access  Private
 */
router.get('/estimate', activityController.estimateEmissions);

/**
 * @route   GET /api/activities/:id
 * @desc    Get activity by ID
 * @access  Private
 */
router.get('/:id', activityController.getActivityById);

/**
 * @route   PUT /api/activities/:id
 * @desc    Update an activity
 * @access  Private
 */
router.put('/:id', activityController.updateActivity);

/**
 * @route   DELETE /api/activities/:id
 * @desc    Delete an activity
 * @access  Private
 */
router.delete('/:id', activityController.deleteActivity);

module.exports = router;