// src/routes/api/get-id-info.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a fragment by the id with info
 */
module.exports = async (req, res) => {
  logger.debug(`get-id-info: ${req.user}, ${req.params.id}`);
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (!fragment.id) {
      res.status(404).json(createErrorResponse(404));
    }

    res.status(200).json(createSuccessResponse({ fragment }));

    logger.info({ fragment }, `Get by id info worked`);
  } catch (error) {
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
