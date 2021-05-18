"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const SECRET_KEY = require("../config.js")
const router = new Router();
const { BadRequestError, UnauthorizedError } = require("../expressError.js")

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res, next) {
  const { username, password } = req.body;

  if (User.authenticate(username, password) === true) {
    let token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
  throw new UnauthorizedError("Invalid user/password");
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

router.post("/register", async function (req, res, next) {
  const { username, password, first_name, last_name, phone } = req.body;
  const newUser = User.register({ username, password, first_name, last_name, phone })

  if (newUser) {
    let token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  }
  
  throw new BadRequestError("Invalid inputs");
})

module.exports = router;