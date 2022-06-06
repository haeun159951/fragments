// src/routes/api/post.js
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Post a fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const fragment = new Fragment({ ownerId: req.user, type: 'text/plain' });
    logger.debug(`owner id: ${req.user}`);
    await fragment.setData(req.body);
    res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
    logger.info({ fragment }, 'created successfully');
  } catch (error) {
    logger.error({ error }, `Error on post request`);
    res.status(415).json(createErrorResponse(415, error.message));
  }
};
