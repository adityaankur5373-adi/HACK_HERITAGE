import bcrypt from "bcrypt";

import prisma from "../config/prisma.js";

import { generateToken } from "../utils/token.js";


/*
|--------------------------------------------------------------------------
| CITIZEN REGISTER
|--------------------------------------------------------------------------
*/

export async function registerCitizen(req, res) {
  
  try {
    const {
      name,
      mobile,
      email,
      password,
      address,
      city,
      district,
      state,
      pincode,
    } = req.body;


    // Check if mobile already exists
    const existingCitizen = await prisma.citizen.findUnique({
      where: {
        mobile,
      },
    });

    if (existingCitizen) {
      return res.status(409).json({
        success: false,
        message: "Mobile number is already registered",
      });
    }


    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);


    // Create User + Citizen
    const user = await prisma.user.create({
      data: {
        passwordHash,
        role: "CITIZEN",

        citizen: {
          create: {
            name,
            mobile,
            email: email || null,
            address,
            city,
            district,
            state,
            pincode,
          },
        },
      },

      include: {
        citizen: true,
      },
    });


    // Generate JWT
    const token = generateToken(user);


    return res.status(201).json({
      success: true,
      message: "Citizen registered successfully",

      token,

      user: {
        id: user.id,
        role: user.role,

        name: user.citizen.name,
        mobile: user.citizen.mobile,
        email: user.citizen.email,

        address: user.citizen.address,
        city: user.citizen.city,
        district: user.citizen.district,
        state: user.citizen.state,
        pincode: user.citizen.pincode,
      },
    });

  } catch (error) {
    console.error("Citizen Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register citizen",
    });
  }
}


/*
|--------------------------------------------------------------------------
| CITIZEN LOGIN
|--------------------------------------------------------------------------
*/

export async function loginCitizen(req, res) {
  try {
    const {
      mobile,
      password,
    } = req.body;


    // Find citizen
    const citizen = await prisma.citizen.findUnique({
      where: {
        mobile,
      },

      include: {
        user: true,
      },
    });


    // Don't reveal whether mobile exists
    if (!citizen) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile or password",
      });
    }


    // Check account status
    if (!citizen.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }


    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      citizen.user.passwordHash
    );


    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile or password",
      });
    }


    // Generate JWT
    const token = generateToken(citizen.user);


    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: citizen.user.id,
        role: citizen.user.role,

        name: citizen.name,
        mobile: citizen.mobile,
        email: citizen.email,

        address: citizen.address,
        city: citizen.city,
        district: citizen.district,
        state: citizen.state,
        pincode: citizen.pincode,
      },
    });

  } catch (error) {
    console.error("Citizen Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
}


/*
|--------------------------------------------------------------------------
| UNIVERSITY REGISTER
|--------------------------------------------------------------------------
*/

export async function registerUniversity(req, res) {
  try {
    const {
      name,
      email,
      password,
      registrationNumber,
      address,
      city,
      district,
      state,
      pincode,
    } = req.body;


    // Check email
    const existingEmail = await prisma.university.findUnique({
      where: {
        email,
      },
    });


    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "University email is already registered",
      });
    }


    // Check registration number
    const existingRegistration =
      await prisma.university.findUnique({
        where: {
          registrationNumber,
        },
      });


    if (existingRegistration) {
      return res.status(409).json({
        success: false,
        message: "Registration number is already registered",
      });
    }


    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);


    // Create User + University
    const user = await prisma.user.create({
      data: {
        passwordHash,
        role: "UNIVERSITY",

        university: {
          create: {
            name,
            email,
            registrationNumber,
            address: address?.trim() || null,
            city: city?.trim() || null,
            district: district?.trim() || null,
            state: state?.trim() || null,
            pincode: pincode?.trim() || null,
          },
        },
      },

      include: {
        university: true,
      },
    });


    const token = generateToken(user);


    return res.status(201).json({
      success: true,
      message: "University registered successfully",

      token,

      user: {
        id: user.id,
        role: user.role,

        name: user.university.name,
        email: user.university.email,
        registrationNumber:
          user.university.registrationNumber,
        address: user.university.address,
        city: user.university.city,
        district: user.university.district,
        state: user.university.state,
        pincode: user.university.pincode,
      },
    });

  } catch (error) {
    console.error("University Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register university",
    });
  }
}


/*
|--------------------------------------------------------------------------
| UNIVERSITY LOGIN
|--------------------------------------------------------------------------
*/

export async function loginUniversity(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;


    const university =
      await prisma.university.findUnique({
        where: {
          email,
        },

        include: {
          user: true,
        },
      });


    if (!university) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    if (!university.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }


    const passwordMatch = await bcrypt.compare(
      password,
      university.user.passwordHash
    );


    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    const token = generateToken(university.user);


    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: university.user.id,
        role: university.user.role,

        name: university.name,
        email: university.email,
        registrationNumber:
          university.registrationNumber,
        address: university.address,
        city: university.city,
        district: university.district,
        state: university.state,
        pincode: university.pincode,
      },
    });

  } catch (error) {
    console.error("University Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
}


/*
|--------------------------------------------------------------------------
| STUDENT REGISTER
|--------------------------------------------------------------------------
*/

export async function registerStudent(req, res) {
  try {
    const {
      name,
      email,
      password,
      studentId,
      universityId,
    } = req.body;


    // Check student email
    const existingEmail = await prisma.student.findUnique({
      where: {
        email,
      },
    });


    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Student email is already registered",
      });
    }


    // Check student ID
    const existingStudentId =
      await prisma.student.findUnique({
        where: {
          studentId,
        },
      });


    if (existingStudentId) {
      return res.status(409).json({
        success: false,
        message: "Student ID is already registered",
      });
    }


    /*
    |--------------------------------------------------------------------------
    | Check University
    |--------------------------------------------------------------------------
    */

    const university =
      await prisma.university.findUnique({
        where: {
           registrationNumber: universityId,
        },
      });


    if (!university) {
      return res.status(404).json({
        success: false,
        message: "University is not registered",
      });
    }


    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);


    // Create User + Student
    const user = await prisma.user.create({
      data: {
        passwordHash,
        role: "STUDENT",

        student: {
          create: {
            name,
            email,
            studentId,
            universityId: university.id,
          },
        },
      },

      include: {
        student: {
          include: {
            university: true,
          },
        },
      },
    });


    const token = generateToken(user);


    return res.status(201).json({
      success: true,
      message: "Student registered successfully",

      token,

      user: {
        id: user.id,
        role: user.role,

        name: user.student.name,
        email: user.student.email,
        studentId: user.student.studentId,

        university:
          user.student.university.name,
      },
    });

  } catch (error) {
    console.error("Student Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register student",
    });
  }
}


/*
|--------------------------------------------------------------------------
| STUDENT LOGIN
|--------------------------------------------------------------------------
*/

export async function loginStudent(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;


    const student =
      await prisma.student.findUnique({
        where: {
          email,
        },

        include: {
          user: true,
          university: true,
        },
      });


    if (!student) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    if (!student.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }


    const passwordMatch = await bcrypt.compare(
      password,
      student.user.passwordHash
    );


    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    const token = generateToken(student.user);


    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: student.user.id,
        role: student.user.role,

        name: student.name,
        email: student.email,
        studentId: student.studentId,

        university:
          student.university.name,
      },
    });

  } catch (error) {
    console.error("Student Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GOVERNMENT REGISTER
|--------------------------------------------------------------------------
*/

export async function registerGovernment(req, res) {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      department,
      designation,
      office,
      district,
      state,
    } = req.body;


    // Check email
    const existingEmail =
      await prisma.government.findUnique({
        where: {
          email,
        },
      });


    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Government email is already registered",
      });
    }


    // Check employee ID
    const existingEmployee =
      await prisma.government.findUnique({
        where: {
          employeeId,
        },
      });


    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee ID is already registered",
      });
    }


    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);


    // Create User + Government
    const user = await prisma.user.create({
      data: {
        passwordHash,
        role: "GOVERNMENT",

        government: {
          create: {
            name,
            email,
            employeeId,
            department,
            designation,
            office,
            district,
            state,
          },
        },
      },

      include: {
        government: true,
        industry: true,

        industry: true,
      },
    });


    const token = generateToken(user);


    return res.status(201).json({
      success: true,
      message: "Government account registered successfully",

      token,

      user: {
        id: user.id,
        role: user.role,

        name: user.government.name,
        email: user.government.email,
        employeeId: user.government.employeeId,
        department: user.government.department,
        designation: user.government.designation,
        office: user.government.office,
        district: user.government.district,
        state: user.government.state,
      },
    });

  } catch (error) {
    console.error("Government Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to register government account",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GOVERNMENT LOGIN
|--------------------------------------------------------------------------
*/

export async function loginGovernment(req, res) {
  try {
    const {
      email,
      password,
    } = req.body;


    const government =
      await prisma.government.findUnique({
        where: {
          email,
        },

        include: {
          user: true,
        },
      });


    if (!government) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    if (!government.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled",
      });
    }


    const passwordMatch = await bcrypt.compare(
      password,
      government.user.passwordHash
    );


    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    const token = generateToken(government.user);


    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: government.user.id,
        role: government.user.role,

        name: government.name,
        email: government.email,
        employeeId: government.employeeId,
        department: government.department,
        designation: government.designation,
        office: government.office,
        district: government.district,
        state: government.state,
      },
    });

  } catch (error) {
    console.error("Government Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to login",
    });
  }
}


/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
*/
export async function getMe(req, res) {
  try {
    // Make sure authentication middleware provided the user ID
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User authentication information missing",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },

      include: {
        citizen: true,

        student: {
          include: {
            university: true,
          },
        },

        university: true,

        government: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    const { passwordHash, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      user: safeUser,
    });

  } catch (error) {
    console.error("Get Me Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
}

export async function registerIndustry(req, res) {
  try {
    const {
      name,
      email,
      password,
      registrationNumber,
      address,
      area,
      city,
      district,
      state,
      pincode,
    } = req.body;
    if (![name, email, password, registrationNumber].every((value) => typeof value === "string" && value.trim())) return res.status(400).json({ success: false, message: "Name, email, password and registration number are required" });
    if (await prisma.industry.findFirst({ where: { OR: [{ email: email.trim() }, { registrationNumber: registrationNumber.trim() }] } })) return res.status(409).json({ success: false, message: "Industry email or registration number is already registered" });
    const user = await prisma.user.create({
      data: {
        passwordHash: await bcrypt.hash(password, 12),
        role: "INDUSTRY",
        industry: {
          create: {
            name: name.trim(),
            email: email.trim(),
            registrationNumber: registrationNumber.trim(),
            address: address?.trim() || null,
            area: area?.trim() || null,
            city: city?.trim() || null,
            district: district?.trim() || null,
            state: state?.trim() || null,
            pincode: pincode?.trim() || null,
          },
        },
      },
      include: { industry: true },
    });
    return res.status(201).json({
      success: true,
      message: "Industry registered successfully",
      token: generateToken(user),
      user: {
        id: user.id,
        role: user.role,
        name: user.industry.name,
        email: user.industry.email,
        registrationNumber: user.industry.registrationNumber,
        address: user.industry.address,
        area: user.industry.area,
        city: user.industry.city,
        district: user.industry.district,
        state: user.industry.state,
        pincode: user.industry.pincode,
      },
    });
  } catch (error) { console.error("Industry Register Error:", error); return res.status(500).json({ success: false, message: "Failed to register industry" }); }
}
export async function loginIndustry(req, res) {
  try {
    const { email, password } = req.body;
    const industry = await prisma.industry.findUnique({ where: { email: String(email || "").trim() }, include: { user: true } });
    if (!industry || !industry.user.isActive || !(await bcrypt.compare(String(password || ""), industry.user.passwordHash))) return res.status(401).json({ success: false, message: "Invalid email or password" });
    return res.json({ success: true, message: "Login successful", token: generateToken(industry.user), user: { id: industry.userId, role: industry.user.role, name: industry.name, email: industry.email, registrationNumber: industry.registrationNumber } });
  } catch (error) { console.error("Industry Login Error:", error); return res.status(500).json({ success: false, message: "Failed to login" }); }
}
