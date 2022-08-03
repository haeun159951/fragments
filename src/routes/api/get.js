// src/routes/api/get.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    logger.debug(`get: ${req.user} ${req.query.expand}`);
    const fragments = await Fragment.byUser(req.user, req.query.expand);

    res.status(200).json(
      createSuccessResponse({
        fragments,
      })
    );
    logger.info({ fragments }, `GET worked`);
  } catch (error) {
    logger.error({ error }, `Error on get request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
