"use strict";

const userstore = require("../models/user-store");
const trainerstore = require("../models/trainer-store");
const logger = require("../utils/logger");
const uuid = require("uuid");

const accounts = {
  
  /*-----------------------------------------------------------------------------------
  / This method triggers the rendering of the login screen
  /----------------------------------------------------------------------------------*/
  login(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("login", viewData);
  },

  /*-----------------------------------------------------------------------------------
  / This method clears the useraccount cookie, logging off the user.
  /----------------------------------------------------------------------------------*/
  logout(request, response) {
    response.cookie("useraccount", "");
    response.redirect("/");
  },

  /*-----------------------------------------------------------------------------------
  / This method triggers the rendering of the signup screen
  /----------------------------------------------------------------------------------*/
  signup(request, response) {
    const viewData = {
      title: "Login to the Service"
    };
    response.render("signup", viewData);
  },

  /*-----------------------------------------------------------------------------------
  / This method triggers the rendering of the settings update screen
  /----------------------------------------------------------------------------------*/
  settings(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const viewData = {
      title: "Update Settings",
      user: loggedInUser
    };
    response.render("settings", viewData);
  },

  /*-----------------------------------------------------------------------------------
  / This method takes the input from the register screen and creates a newUser object
  / with it. It then uses the randon generator to get a userid which is added to the 
  / object. It then adds this new user object to the user-store json file.
  /----------------------------------------------------------------------------------*/
  register(request, response) {
    let newUser = {memberName: request.body.memberName,
                   gender: request.body.gender,
                   email: request.body.email,
                   password: request.body.password,
                   address: request.body.address,
                   height: parseFloat(request.body.height),
                   startingWeight: parseFloat(request.body.startingWeight),
                   id: uuid.v1()
    };
    userstore.addUser(newUser);
    logger.info(`registering ${newUser.email}`);
    response.redirect("/");
  },

  /*-----------------------------------------------------------------------------------
  / This method authenicates the user trying to logon. It check is the email exists on
  / the user json first, and if not it checks the trainer json. If the email match is
  / found then it continues to check the password matches the user or trainer record.
  / If a match is found, it saves the 'useraccount' cookie as the user.id. And the
  / user is directed to their dashboard.
  /----------------------------------------------------------------------------------*/
  authenticate(request, response) {
    const user = userstore.getUserByEmail(request.body.email);
    if (user) {
      if (user.password === request.body.password) {
        response.cookie("useraccount", user.id);
        logger.info(`logging in ${user.email}`);
        response.redirect("/dashboard");
      } else {
        response.redirect("/login");
      }
    } else {
      const trainer = trainerstore.getTrainerByEmail(request.body.email);
      if (trainer) {
        if (trainer.password === request.body.password) {
          response.cookie("useraccount", trainer.id);
          logger.info(`logging in ${trainer.email}`);
          response.redirect("/trainerdashboard");
        } else {
          response.redirect("/login");
        }
      } else {
        response.redirect("/login");
      }
      response.redirect("/login");
    }
  },

  /*-----------------------------------------------------------------------------------
  / This method handles the updating of a users settings. It first checks the logged in
  / user. If one exists then it checks if any of the user data has been entered for update.
  / If anything has been entered for update, it update that field on the logged on user
  / object, it will then update the user object in the user-store json.
  /----------------------------------------------------------------------------------*/
  settingsUpdate(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);

    if (loggedInUser) {
      logger.info(`Update Settings ${loggedInUser.memberName}`);
      if (request.body.memberName !== null && request.body.memberName !== "") {
        loggedInUser.memberName = request.body.memberName;
      }
      if (request.body.gender !== null && request.body.gender !== "") {
        loggedInUser.gender = request.body.gender;
      }
      if (request.body.email !== null && request.body.email !== "") {
        loggedInUser.email = request.body.email;
      }
      if (request.body.password !== null && request.body.password !== "") {
        loggedInUser.password = request.body.password;
      }
      if (request.body.address !== null && request.body.address !== "") {
        loggedInUser.address = request.body.address;
      }
      if (request.body.height !== null && request.body.height !== "") {
        loggedInUser.height = request.body.height;
      }
      if (
        request.body.startingWeight !== null &&
        request.body.startingWeight !== ""
      ) {
        loggedInUser.startingWeight = request.body.startingWeight;
      }
      userstore.updateUser(loggedInUser);
      response.redirect("/dashboard");
    } else {
      response.redirect("/dashboard");
    }
  },

  getCurrentUser(request) {
    const userId = request.cookies.useraccount;
    return userstore.getUserById(userId);
  },

  getCurrentTrainer(request) {
    const trainerId = request.cookies.useraccount;
    return trainerstore.getTrainerById(trainerId);
  }
};

module.exports = accounts;
