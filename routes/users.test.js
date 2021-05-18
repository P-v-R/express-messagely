"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message")
const { SECRET_KEY } = require("../config");



describe("Users route tests", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM messages");
    await db.query("DELETE FROM users");
    await db.query("ALTER SEQUENCE messages_id_seq RESTART WITH 1");

    let u1 = await User.register({
      username: "test1",
      password: "password",
      first_name: "Test1",
      last_name: "Testy1",
      phone: "+14155550000",
    });
    let u2 = await User.register({
      username: "test2",
      password: "password",
      first_name: "Test2",
      last_name: "Testy2",
      phone: "+14155552222",
    });
    let m1 = await Message.create({
      from_username: "test1",
      to_username: "test2",
      body: "u1-to-u2",
    });
    let m2 = await Message.create({
      from_username: "test2",
      to_username: "test1",
      body: "u2-to-u1",
    });
  });


  /* GET /  get list of users.*/
  describe("GET /users/  ", function () {
    test("can get all users", async function () {
      const token = jwt.sign({ username:"test1" }, SECRET_KEY);
      
      let response = await request(app)
      .get("/users")
      .send({ _token: token });

      expect(response.statusCode).toEqual(200);
      expect(response.body.users.length).toEqual(2);
      //expect response.body.users to equal ^^^users above(make request in insomnia and copy)
    });

    test("cant get all users if not logged in", async function () {
      let response = await request(app)
      .get("/users")

      expect(response.statusCode).toEqual(401)
    });
  });
});