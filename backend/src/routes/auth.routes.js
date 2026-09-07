import express from "express";


import {
  registerCitizen,
  loginCitizen,

  registerUniversity,
  loginUniversity,

  registerStudent,
  loginStudent,

  registerGovernment,
  loginGovernment,

  getMe,
} from "../controllers/auth.controller.js";


import { protect } from "../middleware/auth.middleware.js";


import { validate } from "../middleware/validate.middleware.js";


import {
  citizenRegisterSchema,
  citizenLoginSchema,

  universityRegisterSchema,
  universityLoginSchema,

  studentRegisterSchema,
  studentLoginSchema,

  governmentRegisterSchema,
  governmentLoginSchema,
} from "../validators/auth.validator.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| CITIZEN
|--------------------------------------------------------------------------
*/

router.post(
  "/citizen/register",
  validate(citizenRegisterSchema),
  registerCitizen
);


router.post(
  "/citizen/login",
  validate(citizenLoginSchema),
  loginCitizen
);


/*
|--------------------------------------------------------------------------
| UNIVERSITY
|--------------------------------------------------------------------------
*/

router.post(
  "/university/register",
  validate(universityRegisterSchema),
  registerUniversity
);


router.post(
  "/university/login",
  validate(universityLoginSchema),
  loginUniversity
);


/*
|--------------------------------------------------------------------------
| STUDENT
|--------------------------------------------------------------------------
*/

router.post(
  "/student/register",
  validate(studentRegisterSchema),
  registerStudent
);


router.post(
  "/student/login",
  validate(studentLoginSchema),
  loginStudent
);


/*
|--------------------------------------------------------------------------
| GOVERNMENT
|--------------------------------------------------------------------------
*/

router.post(
  "/government/register",
  validate(governmentRegisterSchema),
  registerGovernment
);


router.post(
  "/government/login",
  validate(governmentLoginSchema),
  loginGovernment
);


/*
|--------------------------------------------------------------------------
| CURRENT USER
|--------------------------------------------------------------------------
*/

router.get(
  "/me",
  protect,
  getMe
);


export default router;