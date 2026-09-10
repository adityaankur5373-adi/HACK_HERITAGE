import { z } from "zod";

/*
|--------------------------------------------------------------------------
| Common Password Validation
|--------------------------------------------------------------------------
*/

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter"
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter"
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number"
  )
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );


/*
|--------------------------------------------------------------------------
| Citizen
|--------------------------------------------------------------------------
*/

export const citizenRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must not exceed 50 characters"),

  mobile: z
    .string()
    .trim()
    .regex(
      /^[6-9][0-9]{9}$/,
      "Enter a valid 10-digit Indian mobile number"
    ),

  password: passwordSchema,

  email: z
    .string()
    .trim()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .min(1, "Address is required")
    .max(250, "Address must not exceed 250 characters"),

  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(100, "City must not exceed 100 characters"),

  district: z
    .string()
    .trim()
    .min(1, "District is required")
    .max(100, "District must not exceed 100 characters"),

  state: z
    .string()
    .trim()
    .min(1, "State is required")
    .max(100, "State must not exceed 100 characters"),

  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
});


export const citizenLoginSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(
      /^[6-9][0-9]{9}$/,
      "Enter a valid 10-digit Indian mobile number"
    ),

  password: z
    .string()
    .min(1, "Password is required"),
});


/*
|--------------------------------------------------------------------------
| University
|--------------------------------------------------------------------------
*/

export const universityRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "University name must be at least 3 characters")
    .max(150, "University name must not exceed 150 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: passwordSchema,

  registrationNumber: z
    .string()
    .trim()
    .min(3, "Registration number must be at least 3 characters")
    .max(50, "Registration number must not exceed 50 characters"),
});


export const universityLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});


/*
|--------------------------------------------------------------------------
| Student
|--------------------------------------------------------------------------
*/

export const studentRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: passwordSchema,

  studentId: z
    .string()
    .trim()
    .min(3, "Student ID must be at least 3 characters")
    .max(50, "Student ID must not exceed 50 characters"),

  universityId: z
    .string()
    .trim()
    .min(1, "University ID is required"),
});


export const studentLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});


/*
|--------------------------------------------------------------------------
| Government
|--------------------------------------------------------------------------
*/

export const governmentRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),

  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: passwordSchema,

  employeeId: z
    .string()
    .trim()
    .min(3, "Employee ID must be at least 3 characters")
    .max(50, "Employee ID must not exceed 50 characters"),

  department: z
    .string()
    .trim()
    .min(2, "Department is required")
    .max(100, "Department must not exceed 100 characters"),

  designation: z
    .string()
    .trim()
    .min(2, "Designation is required")
    .max(100, "Designation must not exceed 100 characters"),

  office: z
    .string()
    .trim()
    .min(2, "Office is required")
    .max(150, "Office must not exceed 150 characters"),

  district: z
    .string()
    .trim()
    .min(2, "District is required")
    .max(100, "District must not exceed 100 characters"),

  state: z
    .string()
    .trim()
    .min(2, "State is required")
    .max(100, "State must not exceed 100 characters"),
});


export const governmentLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),

  password: z
    .string()
    .min(1, "Password is required"),
});