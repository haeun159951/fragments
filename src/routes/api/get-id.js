// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a fragment by the id
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    let data = await fragment.getData();
    data = data.toString();
    res.status(200).json(
      createSuccessResponse({
        data,
      })
    );
  } catch (error) {
    res.status(415).json(createErrorResponse(415, error.message));
  }
};
