"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const goalStore = require("../models/goal-store");
const userStore = require("../models/user-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const analytics = require("./analytics.js");

const memberdashboard = {
  /*-----------------------------------------------------------------------------------
  / This method the main Member Dashboard when a member is selected from a trainer logon.
  /----------------------------------------------------------------------------------*/
  index(request, response) {
    logger.info("trainerboard member rendering");
    
    // Retrieve the current user selected from the trainer dashboard.
    const currentUser = userStore.getUserById(request.params.id);
    
    // Sort the assessments by date decreasing before sending to the memberDashboard view.
    let assessments = assessmentStore.getUserAssessments(request.params.id);
    assessments.sort(function(a, b) {
      let dateA = new Date(a.dateTime), dateB = new Date(b.dateTime);
      return dateB - dateA;
    });  
    
    // Retieve the users goals to calculate counts of each goal status
    let openCount = 0; let missedCount = 0; let achievedCount = 0;
    let goalStatus;
    let goals = goalStore.getUserGoals(request.params.id);
    for (let t = 0; t < goals.length; t++) {
      goalStatus = analytics.calcGoalStatus(goals[t], assessments);
      if (goalStatus === "Open") {
        openCount ++;
      } else if (goalStatus === "Missed") {
        missedCount++; 
      } else {
        achievedCount++;
      }
    }
    
    // The latest weight will be the [0] assessment or the startingWeight if no assessments yet.
    let latestWeight = currentUser.startingWeight;
    if (assessments.length > 0) {
      latestWeight = assessments[0].weight;
    }
    
    // Calculate the BMI data for the Analytics section of the page
    let calculatedBMI = analytics.calculateBMI(request.params.id);
    calculatedBMI = Math.round(calculatedBMI * 100.0 ) / 100.0;
    const calculatedBMICategory = analytics.calculateBMICategory(calculatedBMI);
    
    // Create a new array of memberIds and the associated array of assessments.
    const memberAssessments = {
      memberId: request.params.id,
      assessments: assessments
    };

    // Create an data object to be passed to the member dashboard view and render the view. 
    const viewData = {
      title: "Member Assessment Dashboard",
      user: currentUser,
      memberAssessments: memberAssessments,
      calculatedBMI: calculatedBMI,
      bmiCategory: calculatedBMICategory,
      idealWeightIndicator: analytics.checkIdealWeight(
        currentUser.id,
        latestWeight
      ),
      openCount: openCount,
      missedCount: missedCount,
      achievedCount: achievedCount
    };
    logger.info("about to render", memberAssessments);
    response.render("memberdashboard", viewData);
  },
  
  /*-----------------------------------------------------------------------------------
  / Adding a comment to an existing assessment.
  / Is trigger from member Dashboard of trainer login.
  /----------------------------------------------------------------------------------*/
  addComment(request, response) {
    const userid = request.params.memberId;
    const currentMember = userStore.getUserById(userid);
    
    logger.info("memberdashboard Add Comment rendering", userid);
    
    let assessment = assessmentStore.getAssessment(request.params.id);
    assessment.comment = request.body.comment;
    assessmentStore.removeAssessment(request.params.id);
    assessmentStore.addAssessment(assessment);

    logger.info("about to redirect to memberDashboard for user: ", userid);
    response.redirect("/trainerdashboard/member/" + userid);
  }
};

module.exports = memberdashboard;
