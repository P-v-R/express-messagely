"use strict";

const Router = require("express").Router;
const router = new Router();
const { ensureCorrectUser} = require("./middleware/auth");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", async function (req, res, next) {
    const results = await Users.all();
    return res.json({ results });
});
  
/** GET /:username - get detail of users.
 * ONLY logged in user can get their own info
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async function (req, res, next) {
    const results = await Users.get(username);
    return res.json({ results });
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
    const results = await Users.messagesTo(username);
    return res.json({ results });
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
    const results = await Users.messagesFrom(username);
    return res.json({ results });
});
module.exports = router;