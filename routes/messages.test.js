"use strict";

const request = require("supertest");
const jwt = require("jsonwebtoken");

const app = require("../app");
const db = require("../db");
const User = require("../models/user");
const Message = require("../models/message")
const { SECRET_KEY } = require("../config");

const { authenticateJWT, ensureLoggedIn ,ensureCorrectUser } = require("../middleware/auth");


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
  
  
    /* GET /messages/:id  get a single message.*/
    describe("GET /messages/:id", function () {
        test("can get a single message", async function () {
            const token = jwt.sign({ username:"test1" }, SECRET_KEY);
            let m3 = await Message.create({
                from_username: "test2",
                to_username: "test1",
                body: "u2-to-u1",
            });
            let response = await request(app)
                .get(`/messages/${m3.id}`)
                .send({ _token: token });
            // console.log("response body", response.body);
            expect(response.statusCode).toEqual(200);
            expect(response.body.message.id).toEqual(m3.id);
            //TODO make sure entire response.body.message is equal
            
        });

        test("cant get all messages if not logged in", async function () {
            let response = await request(app)
                .get(`/messages/1`);

            expect(response.statusCode).toEqual(401)
        });

        //TODO fail test, test if user that is not to_user or from_user can't access message
    });

    // /* POST /messages -  post message*/
    // describe("POST /messages/:id", function () {
    //     test("can get a single message", async function () {
    //         const token = jwt.sign({ username:"test1" }, SECRET_KEY);
    //         let m3 = await Message.create({
    //             from_username: "test2",
    //             to_username: "test1",
    //             body: "u2-to-u1",
    //         });
    //         let response = await request(app)
    //             .get(`/messages/${m3.id}`)
    //             .send({ _token: token });
    //         // console.log("response body", response.body);
    //         expect(response.statusCode).toEqual(200);
    //         expect(response.body.message.id).toEqual(m3.id);
            
    //     });

    //     test("cant get all users if not logged in", async function () {
    //         let response = await request(app)
    //             .get(`/messages/1`);

    //         expect(response.statusCode).toEqual(401)
    //     });
    // });


  });