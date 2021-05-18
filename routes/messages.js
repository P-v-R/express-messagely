"use strict";

const Router = require("express").Router;
const router = new Router();

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id', authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  const message = await Message.get(id);

  if (message.from_user.username === res.locals.user.username ||
    message.to_user.username === res.locals.user.username) {
    return res.json({ message });
  }
  throw new UnauthorizedError("unauthorized action");
});


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", authenticateJWT, ensureLoggedIn, async function (req, res, next) {
  const fromUsername = res.locals.user.username;
  const { to_username, body } = req.body;

  const message = await Message.create({ fromUsername, to_username, body });
  return res.json({ message });
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", authenticateJWT, ensureLoggedIn, async function(rec, res, next){
  const reqMessage = await Message.get(id);
  if (reqMessage.to_user.username === res.locals.user.username){
    const message = await Message.markRead(id);
    return res.json({ message });
  }
  throw new UnauthorizedError("unauthorized action");
})

module.exports = router;