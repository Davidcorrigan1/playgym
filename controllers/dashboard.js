"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const analytics = require("./analytics.js");

const dashboard = {
  
  /*-----------------------------------------------------------------------------------
  / This method will render the main dashboard view passing the user and assessment details
  /----------------------------------------------------------------------------------*/
  index(request, response) {
    logger.info("dashboard rendering");
    const loggedInUser = accounts.getCurrentUser(request);
    
    // Calculate the BMI data for the analytics part of the page
    let calculatedBMI = analytics.calculateBMI(loggedInUser.id);
    calculatedBMI = Math.round(calculatedBMI * 100.0 ) / 100.0;
    const calculatedBMICategory = analytics.calculateBMICategory(calculatedBMI);
    
    // Retrieve tge users assessments and sort by date decending.
    let assessments = assessmentStore.getUserAssessments(loggedInUser.id);
    assessments.sort(function(a, b) {
      let dateA = new Date(a.dateTime), dateB = new Date(b.dateTime);
      return dateB - dateA;
    });  
    
    // Latest weight is the assessment in position [0] or the starting weight if no assessments
    let latestWeight = loggedInUser.startingWeight;
    if (assessments.length > 0) {
      latestWeight = assessments[0].weight;
    }

    // Create an object of data to send to the dashboard and then render the page.
    const viewData = {
      title: "Assessment Dashboard",
      user: loggedInUser,
      assessments: assessments,
      calculatedBMI: calculatedBMI,
      bmiCategory: calculatedBMICategory,
      idealWeightIndicator: analytics.checkIdealWeight(
        loggedInUser.id,
        latestWeight
      )
    };
    logger.info("about to render dashboard", viewData);
    response.render("dashboard", viewData);
  },

  /*-----------------------------------------------------------------------------------
  / This method will delete an assessment to the assessmentCollection in the json file
  /----------------------------------------------------------------------------------*/
  deleteAssessment(request, response) {
    const assessmentId = request.params.id;
    logger.debug(`Deleting Assessment ${assessmentId}`);
    assessmentStore.removeAssessment(assessmentId);
    response.redirect("/dashboard");
  },

  /*-----------------------------------------------------------------------------------
  / This method will add an assessment to the assessmentCollection in the json file
  /----------------------------------------------------------------------------------*/
  addAssessment(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const assessments = assessmentStore.getUserAssessments(loggedInUser.id);
    let previousWeight = 0;
    let weightIncrease = false;

    if (assessments.length > 0) {
      previousWeight = assessments[assessments.length - 1].weight;
    } else {
      previousWeight = loggedInUser.startingWeight;
    }

    if (request.body.weight > previousWeight) {
      weightIncrease = true;
    } else {
      weightIncrease = false;
    }

    let currentDate = new Date();
    let formattedCurrentDate = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate();
    let formattedTime = currentDate.getHours() + ":" + currentDate.getMinutes() + ":" + currentDate.getSeconds();
    let dateTime = formattedCurrentDate+' '+formattedTime;
    
    const newAssessment = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      dateTime: dateTime,
      weight: request.body.weight,
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
      comment: "",
      weightIncrease: weightIncrease
    };
    logger.debug("Creating a new Assessment", newAssessment);
    
    // If all the required data is entered then update the json with the new assessment.
    if ((request.body.weight !== null && request.body.weight !== "") &&
        (request.body.chest !== null && request.body.chest !== "") &&
        (request.body.thigh !== null && request.body.thigh !== "") &&
        (request.body.upperArm !== null && request.body.upperArm !== "") &&
        (request.body.waist !== null && request.body.waist !== "") &&
        (request.body.hips !== null && request.body.hips !== "")) {
           
           assessmentStore.addAssessment(newAssessment);
         };
    
    // Display the dashboard
    response.redirect("/dashboard");
  }
};

module.exports = dashboard;
