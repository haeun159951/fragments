// src/routes/api/get.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a fragment by the id
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug(`owner id and params id: ${req.user} ${req.params.id}`);
    let data = await fragment.getData();
    data = data.toString();
    res.status(200).json(
      createSuccessResponse({
        data,
      })
    );
    logger.info({ fragment }, 'worked successfully');
  } catch (error) {
    logger.error({ error }, `Error on post request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
