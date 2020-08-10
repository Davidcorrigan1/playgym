"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const userStore = require("../models/user-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const analytics = require("./analytics.js");

const trainerdashboard = {
  
  /* Displays the main trainer dashboard showing a list of all
     users and the number of assessments for each */
  index(request, response) {
    logger.info("trainerdashboard rendering");
    const loggedInUser = accounts.getCurrentTrainer(request);
    const members = userStore.getAllUsers();
    logger.info("checking members found: ", members);
    let membersWithCountArray = [];
    let assessments;
    for (let t = 0; t < members.length; t++) {
      assessments = assessmentStore.getUserAssessments(members[t].id);
      membersWithCountArray.push({member: members[t], count: assessments.length});
    }
    
    const viewData = {
      title: "Trainer Dashboard",
      user: loggedInUser,
      members: membersWithCountArray
    };
    
    logger.info("about to render", viewData);
    response.render("trainerdashboard", viewData);
  },

  deleteMember(request, response) {
    logger.info("trainerdashboard delete member rendering");
    const loggedInUser = accounts.getCurrentTrainer(request);
    const currentMember = userStore.getUserById(request.params.id);
    userStore.removeUser(request.params.id);

    response.redirect("/trainerdashboard");
  }
};

module.exports = trainerdashboard;
