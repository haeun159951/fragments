// src/routes/api/get.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a fragment by the id
 */
module.exports = async (req, res) => {
  //let fragmentParamId = req.params.id.toString().split('.');
  try {
    //logger.debug(`get-id: ${req.user}, ${req.params.id}, ${fragmentParamId}`);
    let fragmentById = await Fragment.byId(req.user, req.params.id);
    fragmentById = await fragmentById.getData();
    fragmentById = fragmentById.toString(); // convert to string
    res.status(200).json(
      createSuccessResponse({
        fragment: fragmentById,
      })
    );
    //res.status(200).send(Buffer.from(fragmentById));

    logger.info({ fragmentById }, `worked`);
  } catch (error) {
    logger.error({ error }, `Error on post request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
