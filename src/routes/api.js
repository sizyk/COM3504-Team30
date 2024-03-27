/**
 * Router for API-related requests (getting stuff from DB)
 *
 * Should work with any collection, as long as the controller is required and defined in
 * collectionControllers.
 *
 * All controllers must have the following functions:
 *    get(filters: {object}) -
 *        Gets elements from MongoDB, applying the given filters
 *    upsert(body: {object}, file: {File (from multer)}) -
 *        Creates or updates from the provided form body
 *    delete(id: {string}) -
 *        Deletes the object with the provided ID
 */

const Express = require('express');
const chatController = require('../controllers/chat');

const collectionControllers = {
  chat: chatController,
};

const router = Express.Router();
router.use(Express.json());

/**
 * Wrapper for controller 'get' method
 */
router.get('/:collection/get-all', (req, res) => {
  // Call the get method of the controller that corresponds to the requested collection
  collectionControllers[req.params.collection].get({})
    .then((plants) => res.status(200).json(plants));
});

/**
 * Wrapper for controller upsert method
 */
router.put('/:collection', async (req, res) => {
  // Ugly code to get rid of [Object: null prototype]
  const body = JSON.parse(JSON.stringify(req.body));

  // Call the get method of the controller that corresponds to the requested collection
  const controllerRes = await collectionControllers[req.params.collection].upsert(body, req.file);

  res.status(controllerRes.code)
    .json({
      message: controllerRes.message,
      object: controllerRes.object,
    });
});

router.post('/:collection', async (req, res) => {
  const body = JSON.parse(JSON.stringify(req.body));

  // Call the get method of the controller that corresponds to the requested collection
  const controllerRes = await collectionControllers[req.params.collection].add(body);

  res.status(controllerRes.code)
    .json({
      message: controllerRes.message,
      object: controllerRes.object,
    });
});

/**
 * Wrapper for controller delete method
 */
router.delete('/:collection/:id', async (req, res) => {
  // Call the get method of the controller that corresponds to the requested collection
  const controllerRes = await collectionControllers[req.params.collection].delete(req.params.id);

  res.status(controllerRes.code).json({ message: controllerRes.message });
});

module.exports = router;
