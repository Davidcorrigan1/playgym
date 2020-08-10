"use strict";

const logger = require("../utils/logger");
const assessmentStore = require("../models/assessment-store");
const userStore = require("../models/user-store");
const goalStore = require("../models/goal-store");
const uuid = require("uuid");
const accounts = require("./accounts.js");
const analytics = require("./analytics.js");

const goals = {
  /* This method will render the main goals view passing the user and assessment details
   */
  index(request, response) {
    logger.info("goals rendering");
    const loggedInUser = accounts.getCurrentUser(request);

    let calculatedBMI = analytics.calculateBMI(loggedInUser.id);
    calculatedBMI = Math.round(calculatedBMI * 100.0) / 100.0;

    let goals = goalStore.getUserGoals(loggedInUser.id);
    let assessments = assessmentStore.getUserAssessments(loggedInUser.id);
    assessments.sort(function(a, b) {
      let dateA = new Date(a.dateTime),
        dateB = new Date(b.dateTime);
      return dateB - dateA;
    });

    let latestWeight = loggedInUser.startingWeight;
    if (assessments.length > 0) {
      latestWeight = assessments[0].weight;
    }

    const calculatedBMICategory = analytics.calculateBMICategory(calculatedBMI);
    
    // add goal status to array of goals (in a new array)
    let goalsStatus = [];
    for (let t = 0; t < goals.length; t++) {
      const goalStatus = analytics.calcGoalStatus(goals[t], assessments);
      goalsStatus.push({goal: goals[t], goalStatus: goalStatus});
    }
    
    const viewData = {
      title: "Goals Dashboard",
      user: loggedInUser,
      goals: goalsStatus,
      calculatedBMI: calculatedBMI,
      bmiCategory: calculatedBMICategory,
      idealWeightIndicator: analytics.checkIdealWeight(
        loggedInUser.id,
        latestWeight
      )
    };
    logger.info("about to render goals", viewData);
    response.render("goals", viewData);
  },
  
  memberDisplay(request, response) {
    logger.info("goals rendering");
    
    const currentMember = userStore.getUserById(request.params.memberId);

    let calculatedBMI = analytics.calculateBMI(currentMember.id);
    calculatedBMI = Math.round(calculatedBMI * 100.0) / 100.0;

    let goals = goalStore.getUserGoals(currentMember.id);
    let assessments = assessmentStore.getUserAssessments(currentMember.id);
    assessments.sort(function(a, b) {
      let dateA = new Date(a.dateTime),
        dateB = new Date(b.dateTime);
      return dateB - dateA;
    });

    let latestWeight = currentMember.startingWeight;
    if (assessments.length > 0) {
      latestWeight = assessments[0].weight;
    }

    const calculatedBMICategory = analytics.calculateBMICategory(calculatedBMI);
    
    // add goal status to array of goals (in a new array)
    let goalsStatus = [];
    for (let t = 0; t < goals.length; t++) {
      const goalStatus = analytics.calcGoalStatus(goals[t], assessments);
      goalsStatus.push({goal: goals[t], goalStatus: goalStatus});
    }
    
    const viewData = {
      title: "Goals Dashboard",
      user: currentMember,
      goals: goalsStatus,
      calculatedBMI: calculatedBMI,
      bmiCategory: calculatedBMICategory,
      idealWeightIndicator: analytics.checkIdealWeight(
        currentMember.id,
        latestWeight
      )
    };
    logger.info("about to render goals", viewData);
    response.render("membergoals", viewData);
  },

  /* This method will add an goal to the goalCollection in the json file
   */
  addGoal(request, response) {
    const loggedInUser = accounts.getCurrentUser(request);
    const goals = goalStore.getUserGoals(loggedInUser.id);
    
    let currentDate = new Date();
    let formattedCurrentDate = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate();
  
    logger.info("Add Goal Request Data", request);
    
    const newGoal = {
      id: uuid.v1(),
      userid: loggedInUser.id,
      startDate: formattedCurrentDate, 
      targetDate: request.body.targetDate,
      targetMeasurement: request.body.targetMeasurement,
      measurementType: request.body.measurementType
    };
    
    logger.debug("Creating a new Goal", newGoal);
    goalStore.addGoal(newGoal);
    response.redirect("/goals");
  },
  
  /* This method will add an goal to the goalCollection in the json file
   */
  addMemberGoal(request, response) {
    const currentMember = userStore.getUserById(request.params.memberId);
    const goals = goalStore.getUserGoals(currentMember.id);
    
    let currentDate = new Date();
    let formattedCurrentDate = currentDate.getFullYear()+'-'+(currentDate.getMonth()+1)+'-'+currentDate.getDate();
  
    logger.info("Add Goal Request Data", request);
    
    const newGoal = {
      id: uuid.v1(),
      userid: currentMember.id,
      startDate: formattedCurrentDate, 
      targetDate: request.body.targetDate,
      targetMeasurement: request.body.targetMeasurement,
      measurementType: request.body.measurementType
    };
    
    logger.debug("Creating a new Goal", newGoal);
    goalStore.addGoal(newGoal);
    response.redirect("/membergoals/" + currentMember.id);
  },
  
  /*-----------------------------------------------------------------------------------
  / This method will delete a users goal from the goalCollection in the json file
  /----------------------------------------------------------------------------------*/
  deleteGoal(request, response) {
    const goalId = request.params.id;
    logger.debug(`Deleting Goal ${goalId}`);
    goalStore.removeGoal(goalId);
    response.redirect("/goals");
  },
  
  /*-----------------------------------------------------------------------------------
  / This method will delete a users goal from the goalCollection in the json file
  /----------------------------------------------------------------------------------*/
  deleteMemberGoal(request, response) {
    const currentMember = userStore.getUserById(request.params.memberId);
    const goalId = request.params.id;
    logger.debug(`Deleting Member Goal ${goalId}`);
    goalStore.removeGoal(goalId);
    response.redirect("/membergoals/" + currentMember.id);
  }
  
};

module.exports = goals;
