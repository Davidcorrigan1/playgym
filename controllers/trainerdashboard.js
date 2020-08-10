"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const userStore = require("../models/user-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const analytics = require("./analytics.js");

const trainerdashboard = {
  
  /*-----------------------------------------------------------------------------------
  / Displays the main trainer dashboard showing a list of all
  / users and the number of assessments for each 
  /----------------------------------------------------------------------------------*/
  index(request, response) {
    
    logger.info("trainerdashboard rendering");
    
    // Retrieves the logged on trainer
    const loggedInUser = accounts.getCurrentTrainer(request);
    
    // Retrieves ALL members
    const members = userStore.getAllUsers();

    // Create an Array of members with the count of their assessments.
    let membersWithCountArray = [];
    let assessments;
    for (let t = 0; t < members.length; t++) {
      assessments = assessmentStore.getUserAssessments(members[t].id);
      membersWithCountArray.push({member: members[t], count: assessments.length});
    }
    
    // Creates an object of data to send to the trainer dashboard to display list of members and assessment count.
    const viewData = {
      title: "Trainer Dashboard",
      user: loggedInUser,
      members: membersWithCountArray
    };
    
    logger.info("about to render", viewData);
    response.render("trainerdashboard", viewData);
  },

  /*-----------------------------------------------------------------------------------
  / This method is called to delete a members data.
  /----------------------------------------------------------------------------------*/
  deleteMember(request, response) {
    logger.info("trainerdashboard delete member rendering");
    
    // Retrieve the current logged on trainer.
    const loggedInUser = accounts.getCurrentTrainer(request);
    
    // Retrieve the member selected for deletion from the trainer dashboard.
    const currentMember = userStore.getUserById(request.params.id);
    
    // Remove the member from the json model.
    userStore.removeUser(request.params.id);
    
    // Find all the assessments for the member removed.
    let assessments = assessmentStore.getUserAssessments(currentMember.id);
    
    // loop through the deleted members assessments and delete then from the json.
    for (let t=0; t <= assessments.length; t++) {
      assessmentStore.removeAssessment(assessments[t].id);
    }

    response.redirect("/trainerdashboard");
  }
};

module.exports = trainerdashboard;
