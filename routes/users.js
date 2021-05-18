"use strict";

const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const Message = require("../models/message");
const { authenticateJWT, ensureLoggedIn ,ensureCorrectUser } = require("../middleware/auth");
const { UnauthorizedError } = require("../expressError");
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async function (req, res, next) {
  const users = await User.all();
  if (!res.locals.user){
    throw new UnauthorizedError("must be logged in") 
  }
  return res.json({ users });
});

/** GET /:username - get detail of users.
 * ONLY logged in user can get their own info
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
  const user = await User.get(username);
  return res.json({ user });
});


/** GET /:username/to - get messages to user
 * ONLY logged in user can get their own to-messages
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async function (req, res, next) {
  const messages = await User.messagesTo(username);
  return res.json({ messages });
});

/** GET /:username/from - get messages from user
 * ONLY logged in user can get their own from-messages
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async function (req, res, next) {
  const messages = await User.messagesFrom(username);
  return res.json({ messages });
});

module.exports = router;