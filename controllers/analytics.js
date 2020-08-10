"use strict";

const userstore = require("../models/user-store");
const assessmentStore = require("../models/assessment-store");
const userStore = require("../models/user-store");
const logger = require("../utils/logger");
const uuid = require("uuid");

const analytics = {
  
  /*-----------------------------------------------------------------------------------
  / This method will calculate the BMI for a given userId.
  /----------------------------------------------------------------------------------*/
  calculateBMI(userId) {
    logger.info("Calculate BMI Userid", userId);
    let calculatedBMI = 0;
    const assessments = assessmentStore.getUserAssessments(userId);
    const currentMember = userStore.getUserById(userId);
    if (assessments.length > 0) {
      logger.info("BMI Assessment Exists", assessments);
      calculatedBMI =
        assessments[assessments.length - 1].weight /
        Math.pow(currentMember.height, 2.0);
    } else {
      logger.info("No BMI Assessment Exists", assessments);
      calculatedBMI =
        currentMember.startingWeight / Math.pow(currentMember.height, 2.0);
    }
    return calculatedBMI;
  },

  /*-----------------------------------------------------------------------------------
  / This method will calculate the status of the goal passed in based on the assessments
  / which have been passed in.
  /----------------------------------------------------------------------------------*/
  calcGoalStatus(goal, assessments) {
    logger.info("Get goal status", goal.id);
    let goalStatus = "Open";

    if (assessments.length > 0) {
      logger.info("Assessment Exists, checking goal", assessments);
      for (let t = 0; t < assessments.length; t++) {
        if (Date.parse(goal.startDate) <= Date.parse(assessments[t].dateTime) 
            && Date.parse(goal.targetDate) < Date.parse(assessments[t].dateTime)) {
          goalStatus = "Missed";
          break;
        } else if (Date.parse(goal.startDate) <= Date.parse(assessments[t].dateTime) &&
                   Date.parse(goal.targetDate) >= Date.parse(assessments[t].dateTime)) {
          if (goal.measurementType === "weight") {
            if (assessments[t].weight <= goal.targetMeasurement) {
              goalStatus = "Achieved";
              break;
            } else {
              goalStatus = "Open";
              break;
            }
          } else if (goal.measurementType === "waist") {
            if (assessments[t].waist <= goal.targetMeasurement) {
              goalStatus = "Achieved";
              break;
            } else {
              goalStatus = "Open";
              break;
            }
          }
        } else {
          goalStatus = "Open"
          break;
        }
      }
    } else {
      logger.info("No Assessment Exists", assessments);
      goalStatus = "Open";
    }
    return goalStatus;
  },

  /*-----------------------------------------------------------------------------------
  / This method will calculate the BMI Category for a given BMI value.
  /----------------------------------------------------------------------------------*/
  calculateBMICategory(bmiValue) {
    let bmiCategory = "";
    if (bmiValue < 16) {
      bmiCategory = "SEVERELY UNDERWEIGHT";
    } else if (bmiValue >= 16 && bmiValue < 18.5) {
      bmiCategory = "UNDERWEIGHT";
    } else if (bmiValue >= 18.5 && bmiValue < 25) {
      bmiCategory = "NORMAL";
    } else if (bmiValue >= 25 && bmiValue < 30) {
      bmiCategory = "OVERWEIGHT";
    } else if (bmiValue >= 30 && bmiValue < 35) {
      bmiCategory = "MODERATELY OBESE";
    } else {
      bmiCategory = "SEVERELY OBESE";
    }
    return bmiCategory;
  },

  /*-----------------------------------------------------------------------------------
  / This method will return true or false to indicate if the weight passed in is the
  / ideal weight for the user passed in.
  /----------------------------------------------------------------------------------*/
  checkIdealWeight(userId, latestWeight) {
    let idealWeight;
    const currentMember = userStore.getUserById(userId);

    if (
      currentMember.gender.toLowerCase() === "male" ||
      currentMember.gender.toLowerCase() === "m"
    ) {
      idealWeight =
        50 + 2.3 * (this.convertMetersToInches(currentMember.height) - 60);
    } else {
      idealWeight =
        45.5 + 2.3 * (this.convertMetersToInches(currentMember.height) - 60);
    }

    if (Math.abs(latestWeight - idealWeight) < 2.0) {
      return true;
    } else {
      return false;
    }
  },

  /*-----------------------------------------------------------------------------------
  / This method converts entered meters to inches
  /----------------------------------------------------------------------------------*/
  convertMetersToInches(heightMeters) {
    return heightMeters * 39.37;
  }
};

module.exports = analytics;
