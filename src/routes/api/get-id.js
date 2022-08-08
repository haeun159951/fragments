/**
 * Get a fragment data with the given ID
 */
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const mime = require('mime-types');

module.exports = async (req, res) => {
  logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);
  try {
    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    const data = await fragment.getData();
    const extension = req.params.id.split('.')[1];
    if (extension) {
      let type = mime.lookup(extension);
      console.log(type); // type text/html, image/png
      let result = await fragment.convertType(data, type);

      if (!result) {
        return res.status(415).json(createErrorResponse(415, 'Unsupported type'));
      }

      res.set('Content-Type', type);
      res.status(200).send(result);
    } else {
      res.set('Content-Type', fragment.type);
      res.status(200).send(data);
    }
  } catch (error) {
    logger.error({ error }, `Error on get id request`);
    res.status(404).json(createErrorResponse(404, error.message));
  }
};
