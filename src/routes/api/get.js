// src/routes/api/get.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragments = await Fragment.byUser(req.user, req.query.expand);
    logger.debug(`owner id: ${req.user} ${req.query.expand}`);
    res.status(200).json(
      createSuccessResponse({
        fragments,
      })
    );
    logger.info({ fragments }, 'worked successfully');
  } catch (error) {
    logger.error({ error }, `Error on post request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
