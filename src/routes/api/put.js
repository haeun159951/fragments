const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    if (req.get('Content-type') !== fragment.type) {
      res.status(400).json(createErrorResponse(400, 'Fragment content type does not match'));
    } else {
      await fragment.setData(req.body);
      res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);
      res.status(201).json(
        createSuccessResponse({
          fragment: fragment,
        })
      );
      logger.info({ fragment }, `Put worked`);
    }
  } catch (error) {
    res.status(404).json(createErrorResponse(404, 'put: ' + error.message));
  }
};
