"use strict";

const express = require("express");
const router = express.Router();

const dashboard = require("./controllers/dashboard.js");
const about = require("./controllers/about.js");
const goals = require("./controllers/goals.js");
const accounts = require("./controllers/accounts.js");
const trainerdashboard = require("./controllers/trainerdashboard.js");
const memberdashboard = require("./controllers/memberdashboard.js");

router.get("/", accounts.login);
router.get("/login", accounts.login);
router.get("/signup", accounts.signup);
router.get("/logout", accounts.logout);
router.get("/settings", accounts.settings);
router.get("/dashboard/deleteassessment/:id", dashboard.deleteAssessment);
router.get("/dashboard", dashboard.index);
router.get("/goals", goals.index);
router.get("/membergoals/:memberId", goals.memberDisplay);
router.get("/trainerdashboard", trainerdashboard.index);
router.get("/trainerdashboard/member/:id", memberdashboard.index);
router.get("/trainerdashboard/deletemember/:id", trainerdashboard.deleteMember);
router.get("/goals/deletegoal/:id", goals.deleteGoal);
router.get("/goals/deletemembergoal/:memberId/:id", goals.deleteMemberGoal);

router.post("/register", accounts.register);
router.post("/authenticate", accounts.authenticate);
router.post("/settings/:id", accounts.settingsUpdate);

router.post("/dashboard/addassessment", dashboard.addAssessment);
router.post("/goals/addgoal", goals.addGoal);
router.post("/goals/addmembergoal/:memberId", goals.addMemberGoal);
router.post("/memberdashboard/addcomment/:memberId/:id", memberdashboard.addComment);

router.get("/about", about.index);

module.exports = router;
