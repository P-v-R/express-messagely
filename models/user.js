"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY, BCRYPT_WORK_FACTOR } = require("../config")

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {

    const hashedPassword = await bcrypt.hash(
      password, BCRYPT_WORK_FACTOR);

    const result = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);
    // console.log("RESULT ==>", result.rows[0])
    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */
  // TODO/NOTE be explicit ( ==== true ) in route as well as here!
  static async authenticate(username, password) {
    const result = await db.query(`
      SELECT password from users
      WHERE username=$1`, [username]);
    let dbPassword = result.rows[0].password
    // console.log('query password ---->', dbPassword);
    
    if (await bcrypt.compare(password, dbPassword) === true) {
      return true;
    }
    else {
      return false;
    }
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    console.log('updateLogin running');
    const result = await db.query(`
      UPDATE users SET last_login_at=CURRENT_TIMESTAMP
      WHERE username=$1
      RETURNING username, password, first_name, last_name, phone, last_login_at`,
      [username]);

    let updatedUser = result.rows[0];
    console.log('updateUser --->', updatedUser);

    if (updatedUser === undefined) {
      const err = new Error(`No such user: ${username}`);
      err.status = 404;
      throw err;
    }

    return updatedUser;

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const result = await db.query(`
    SELECT username, first_name, last_name from users`)

    return result.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(`
    SELECT username, first_name, last_name, phone, join_at, last_login_at from users
    WHERE username=$1`, [username]);
    let user = result.rows[0];

    if (user === undefined) {
      throw new NotFoundError(`No such user: ${username}`)
    }

    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {

    const result = await db.query(
      `SELECT m.id AS id,
              m.to_username AS username,
              t.first_name AS first_name,
              t.last_name AS last_name,
              t.phone AS phone,
              m.body AS body,
              m.sent_at AS sent_at,
              m.read_at AS read_at
         FROM messages AS m
                JOIN users AS t ON m.to_username = t.username
         WHERE m.from_username=$1`,
      [username]);

    let messages = result.rows;

    if (!messages) throw new NotFoundError(`No such messages from: ${username}`);


    return messages.map(message => {
      let { id, body, sent_at, read_at, username, first_name, last_name, phone } = message;
      let mData = {id,  body, sent_at, read_at};
      let toUserData = { username, first_name, last_name, phone };
      mData.to_user = toUserData;
      return mData;
    });

  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
  }
}

module.exports = User;
