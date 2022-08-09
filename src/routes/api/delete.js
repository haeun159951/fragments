const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'id is not found'));
    }

    await Fragment.delete(req.user, req.params.id);

    res.status(200).json(createSuccessResponse());
  } catch (error) {
    res.status(404).json(createErrorResponse(404, 'delete: ' + error.message));
  }
};
