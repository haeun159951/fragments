// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    console.log(req.query.expand); //undefined
    const fragments = await Fragment.byUser(req.user, req.query.expand);
    console.log(fragments);
    res.status(200).json(
      createSuccessResponse({
        fragments,
      })
    );
  } catch (error) {
    res.status(415).json(createErrorResponse(415, error.message));
  }
};
