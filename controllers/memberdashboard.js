"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const userStore = require("../models/user-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const analytics = require("./analytics.js");

const memberdashboard = {
  index(request, response) {
    logger.info("trainerboard member rendering");
    const currentMember = userStore.getUserById(request.params.id);
    
    // Sort the assessments by date/time decreasing before sending to the memberDashboard view.
    let assessments = assessmentStore.getUserAssessments(request.params.id);
    assessments.sort(function(a, b) {
      let dateA = new Date(a.dateTime), dateB = new Date(b.dateTime);
      return dateB - dateA;
    });  
    
    const currentUser = userStore.getUserById(request.params.id);
    
    let latestWeight = currentUser.startingWeight;
    if (assessments.length > 0) {
      latestWeight = assessments[0].weight;
    }
    
    
    let calculatedBMI = analytics.calculateBMI(request.params.id);
    calculatedBMI = Math.round(calculatedBMI * 100.0 ) / 100.0;
    
    const calculatedBMICategory = analytics.calculateBMICategory(calculatedBMI);
    
    const memberAssessments = {
      memberId: request.params.id,
      assessments: assessments
    };

    const viewData = {
      title: "Member Assessment Dashboard",
      user: currentUser,
      memberAssessments: memberAssessments,
      calculatedBMI: calculatedBMI,
      bmiCategory: calculatedBMICategory,
      idealWeightIndicator: analytics.checkIdealWeight(
        currentUser.id,
        latestWeight
      )
    };
    logger.info("about to render", memberAssessments);
    response.render("memberdashboard", viewData);
  },
  
  /*   
  / Adding a comment to an existing assessment.
  / Is trigger from member Dashboard of trainer login.
  */
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
