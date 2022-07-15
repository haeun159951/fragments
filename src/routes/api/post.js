// src/routes/api/post.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Post a fragments for the current user
 */
module.exports = async (req, res) => {
  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }

  try {
    const fragment = new Fragment({ ownerId: req.user, type: req.get('Content-type') });
    await fragment.save();
    await fragment.setData(req.body);
    res.set('Content-Type', fragment.type);
    res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment,
      })
    );
    logger.info({ fragment }, `worked`);
  } catch (error) {
    logger.error({ error }, `Error on post request`);
    res.status(415).json(createErrorResponse(415, error.message));
  }
};
