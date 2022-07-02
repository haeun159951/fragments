// src/routes/api/get-id-info.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a fragment by the id with info
 */
module.exports = async (req, res) => {
  try {
    logger.debug(`get-id-info: ${req.user}, ${req.params.id}`);
    const fragment = await Fragment.byId(req.user, req.params.id);

    //If the id does not represent a known fragment, returns an HTTP 404 with an appropriate error message.

    if (!fragment.id) {
      res.status(404).json(createErrorResponse(404));
    }

    console.log(fragment.id);
    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );

    logger.info({ fragment }, `worked`);
  } catch (error) {
    logger.error({ error }, `Error on post request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};