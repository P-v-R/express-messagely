"use strict";

const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const { SECRET_KEY } = require("../config");
const { BadRequestError } = require("../expressError");


/** POST /login: {username, password} => {token} */

router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;
  const isAuthenticated = await User.authenticate(username, password);
  if (isAuthenticated === true) {
    const token = jwt.sign({ username }, SECRET_KEY);
    await User.updateLoginTimestamp(username);
    return res.json({ token });
  }
  throw new BadRequestError("Invalid password");
});



/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  const { username, password, first_name, last_name, phone } = req.body;
  const newUser = await User.register({ username, password, first_name, last_name, phone });

  if (!newUser) {
    throw new BadRequestError("Invalid inputs");
  }
  await User.updateLoginTimestamp(username);
  const token = jwt.sign({ username }, SECRET_KEY);
  return res.json({ token });
});

module.exports = router;