const { createSuccessResponse, createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    if (req.get('Content-type') !== fragment.type) {
      res.status(400).json(createErrorResponse(400, 'Content type does not match'));
    } else {
      const newFragment = new Fragment({
        ownerId: req.user,
        id: req.params.id.split('.')[0],
        created: fragment.created,
        type: req.get('Content-Type'),
      });

      await newFragment.save();
      await newFragment.setData(req.body);

      res.location(`${process.env.API_URL}/v1/fragments/${fragment.id}`);
      res.status(201).json(
        createSuccessResponse({
          fragment: newFragment,
        })
      );
      logger.info({ fragment: fragment }, `successfully update fragment data`);
    }
  } catch (err) {
    res.status(404).json(createErrorResponse(404, 'unable to find fragment with the given id'));
  }
};
