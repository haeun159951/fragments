// src/routes/api/get-id-info.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a fragment by the id with info
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug(`get-id-info: ${req.user}, ${req.params.id}`);

    if (!fragment.id) {
      res.status(404).json(createErrorResponse(404));
    }

    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );

    logger.info({ fragment }, `get by id info worked`);
  } catch (error) {
    logger.error({ error }, `Error on get-id-info request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
