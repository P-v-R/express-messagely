"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

/** POST /login: {username, password} => {token} */


/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */

module.exports = router;