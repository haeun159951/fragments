// src/routes/api/get.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

/**
 * Get a fragment by the id
 */
module.exports = async (req, res) => {
  try {
    logger.debug(`get-id: ${req.user}, ${req.params.id}`);

    const fragmentById = await Fragment.byId(req.user, req.params.id);
    //const fragmentById = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    const data = await fragmentById.getData();
    console.log(data);
    res.status(200).send(data);

    logger.info({ fragmentById }, `worked`);
  } catch (error) {
    logger.error({ error }, `Error on post request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
