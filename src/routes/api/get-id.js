/**
 * Get a fragment data with the given ID
 */

const md = require('markdown-it')({
  html: true,
});
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);

  try {
    const metaData = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    const fragment = new Fragment(metaData);
    const data = await fragment.getData();
    let extension = req.params.id.split('.')[1];
    if (extension) {
      if (extension === 'html' && fragment.type === 'text/markdown') {
        let result = md.render(data.toString());
        result = Buffer.from(result);
        res.set('Content-Type', 'text/html');
        res.status(200).send(result);
        logger.info(`successfully converted to ${extension}`);
      } else {
        res
          .status(415)
          .json(createErrorResponse(415, `fragment cannot be returned as a ${extension}`));
      }
    } else {
      res.set('Content-Type', fragment.type);
      res.status(200).send(data);
      logger.info(`successfully got-id fragment type ${fragment.type}`);
    }
  } catch (e) {
    logger.warn(e.message, 'Error getting fragment by id');
    res.status(404).json(createErrorResponse(404, e.message));
  }
};
