const en = {
  navbar: {
    home: "Home",
    problems: "Problems",
    howItWorks: "How It Works",
    about: "About Us",
    contact: "Contact",
    language: "हिन्दी",
    login: "Login",
  },

  hero: {
    badge: "Jharkhand's Citizen Platform",
    title: "Your Problem,",
    titleHighlight: "Our Solution",
    description:
      "Report any problem and together let's build a better Jharkhand.",
    voice: "Report by Voice",
    text: "Report by Text",
  },

  howItWorks: {
    badge: "Simple & Transparent",
    title: "How It Works",
    subtitle:
      "A simple way to report problems and find solutions.",

    step1: {
      title: "Report",
      description:
        "Tell us about your problem using voice or text.",
    },

    step2: {
      title: "Verify",
      description:
        "Our team verifies and reviews your problem.",
    },

    step3: {
      title: "Find a Solution",
      description:
        "Organizations, experts and authorities work on solutions.",
    },

    step4: {
      title: "Get It Solved",
      description:
        "The solution is implemented and you can track the progress.",
    },
  },

  footer: {
    brand: "JanSamadhan",
    tagline: "Your Problem, Our Solution",

    description:
      "Listening to every citizen of Jharkhand and connecting them with solutions.",

    platform: "Platform",
    reportProblem: "Report a Problem",
    trackProblem: "Track Your Problem",
    publicProblems: "Public Problems",

    about: "About Us",

    support: "Support",
    helpCenter: "Help Center",
    userGuide: "User Guide",
    faq: "Frequently Asked Questions",

    contact: "Contact Us",
    connect: "Connect With Us",

    address: "Ranchi, Jharkhand - 834001",
    email: "info@jansamadhan.jh.gov.in",
    phone: "1800-123-4567",

    secure: "Secure",
    trusted: "Trusted",
    transparent: "Transparent",

    publicInterest: "Committed to Public Interest",

    copyright:
      "© 2025 JanSamadhan | All Rights Reserved",
  },

  login: {
    badge: "JanSamadhan",

    title: "Welcome to",
    titleHighlight: "JanSamadhan",

    subtitle:
      "Choose how you want to continue",

    citizen: {
      title: "Citizen",
      description:
        "Report public problems and track the status of your complaints.",
      button: "Continue",
    },

    student: {
      title: "Student",
      description:
        "Report campus and student issues, share feedback, and track their resolution.",
      button: "Continue",
    },

    university: {
      title: "University",
      description:
        "Receive, review and resolve student issues across departments and campus facilities.",
      button: "Continue",
    },

    government: {
      title: "Government",
      description:
        "Review public complaints, assign departments, and monitor issue resolution.",
      button: "Continue",
    },

    bottomMessage:
      "Your voice can help build a better Jharkhand.",

    // ============================================================
    // CITIZEN LOGIN
    // ============================================================

    citizenLogin: {
      title: "Citizen Login",

      subtitle:
        "Login to report and track your problems.",

      mobile:
        "Mobile Number",

      mobilePlaceholder:
        "Enter 10-digit mobile number",

      password:
        "Password",

      passwordPlaceholder:
        "Enter your password",

      loginButton:
        "Login",

      registerButton:
        "Register",

      registerText:
        "Don't have an account?",

      loggingIn:
        "Logging in...",

      invalidMobile:
        "Enter a valid 10-digit Indian mobile number.",

      passwordRequired:
        "Password is required.",

      loginFailed:
        "Login failed. Please check your mobile number and password.",

      networkError:
        "Unable to connect to the server. Please try again.",
    },

    // ============================================================
    // CITIZEN REGISTER
    // ============================================================

    citizenRegister: {
      title: "Create Citizen Account",

      subtitle:
        "Create your account to report and track public problems.",

      name:
        "Full Name",

      namePlaceholder:
        "Enter your full name",

      mobile:
        "Mobile Number",

      mobilePlaceholder:
        "Enter 10-digit mobile number",

      email:
        "Email Address",

      emailPlaceholder:
        "Enter your email address (optional)",

      password:
        "Password",

      passwordPlaceholder:
        "Create a strong password",

      address:
        "Address",

      addressPlaceholder:
        "Enter your complete address",

      city:
        "City",

      cityPlaceholder:
        "Enter city",

      state:
        "State",

      statePlaceholder:
        "Enter state",

      pincode:
        "Pincode",

      pincodePlaceholder:
        "Enter 6-digit pincode",

      passwordRequirements:
        "Password requirements",

      passwordMin:
        "Minimum 8 characters",

      passwordUpper:
        "One uppercase letter",

      passwordLower:
        "One lowercase letter",

      passwordNumber:
        "One number",

      passwordSpecial:
        "One special character",

      registerButton:
        "Create Account",

      loginButton:
        "Login",

      alreadyAccount:
        "Already have an account?",

      loginText:
        "Login",

      registering:
        "Creating account...",

      invalidName:
        "Name must be at least 2 characters.",

      invalidMobile:
        "Enter a valid 10-digit Indian mobile number.",

      invalidEmail:
        "Enter a valid email address.",

      passwordRequired:
        "Password is required.",

      invalidAddress:
        "Address is required.",

      invalidCity:
        "City is required.",

      invalidState:
        "State is required.",

      invalidPincode:
        "Enter a valid 6-digit pincode.",

      registrationFailed:
        "Registration failed. Please check your details.",

      networkError:
        "Unable to connect to the server. Please try again.",
        district:
        "District",
        districtPlaceholder:
        "Enter the district",
    },
  },

  roleAuth: {
    roles: {
      student: "Student",
      university: "University",
      government: "Government",
    },
    fields: {
      name: { label: "Full Name", placeholder: "Enter your full name" },
      universityName: { label: "University Name", placeholder: "Enter university name" },
      email: { label: "Email Address", placeholder: "Enter your email" },
      studentId: { label: "Student ID", placeholder: "Enter your student ID" },
      universityId: { label: "University ID", placeholder: "Enter your university ID" },
      registrationNumber: { label: "Registration Number", placeholder: "Enter registration number" },
      employeeId: { label: "Employee ID", placeholder: "Enter employee ID" },
      department: { label: "Department", placeholder: "Enter your department" },
      designation: { label: "Designation", placeholder: "Enter your designation" },
      office: { label: "Office", placeholder: "Enter your office" },
      district: { label: "District", placeholder: "Enter your district" },
      state: { label: "State", placeholder: "Enter your state" },
    },
    backToRoles: "Back to roles",
    create: "Create",
    account: "Account",
    login: "Login",
    register: "Register",
    createAccount: "Create Account",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    pleaseWait: "Please wait...",
    alreadyAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    registerToAccess: "Register to access the",
    signInTo: "Sign in to continue to the",
    portal: "portal",
    emailPasswordRequired: "Email and password are required.",
    completeFields: "Please complete all the fields.",
    passwordRequired: "Password must be at least 8 characters.",
    networkError: "Unable to connect to the server. Please try again.",
  },

  dashboard: {
    role: {
      citizen: "Citizen",
      student: "Student",
      university: "University",
      government: "Government",
      user: "User",
    },
    title: "Dashboard",
    logout: "Logout",
    welcome: "Welcome back",
    accountHolder: "Account holder",
    workspace: "Your authenticated workspace is ready. Role-specific issue workflows can be added here.",
    accountDetails: "Account details",
    contact: "Email / contact",
    roleLabel: "Role",
    department: "Department",
    designation: "Designation",
    office: "Office",
    district: "District",
    state: "State",
    studentId: "Student ID",
  },

  citizen: {
    nav: {
      dashboard: "Dashboard",
      reportProblem: "Report Problem",
      myProblems: "My Problems",
      profile: "Profile",
      logout: "Logout",
    },
    dashboard: {
      title: "Citizen Dashboard",
      welcome: "Welcome back",
      subtitle: "Report civic problems easily and track their progress.",
      reportProblem: "Report a Problem",
      totalProblems: "Total Problems",
      submitted: "Submitted",
      inProgress: "In Progress",
      resolved: "Resolved",
      recentProblems: "Recent Problems",
      viewDetails: "View Details",
      noReports: "No reports yet.",
      loading: "Loading dashboard...",
    },
    report: {
      title: "Report a Problem",
      welcome: "Tell me about the civic problem you are facing. I'll help you prepare the complaint.",
      inputPlaceholder: "Describe your problem...",
      send: "Send",
      needsMoreInfo: "Could you tell me the exact location of the problem?",
      irrelevant: "This does not appear to be a civic or government issue. Please share a public service problem so I can help you prepare a complaint.",
      readyTitle: "Report Ready",
      duplicateTitle: "Similar Problem Found",
      duplicateSubtitle: "A similar problem has already been reported.",
      support: "Support This Problem",
      supported: "✓ You supported this problem",
      different: "This Is A Different Problem",
      submitReport: "Submit Report",
      continueEditing: "Continue Editing",
      attachments: "Attachments",
      loading: "Processing your message...",
      uploaded: "Media ready",
      removeAttachment: "Remove",
      networkError: "Something went wrong. Please try again.",
      welcomeBack: "Welcome back",
      draftTitle: "Review Your Report",
    },
    track: {
      title: "Track Your Problem",
      subtitle: "Enter the report ID and check the current status of your complaint.",
      placeholder: "Enter your Report ID",
      button: "Track Status",
      checking: "Checking...",
      empty: "Please enter your Report ID.",
      notFound: "No report was found with this Report ID.",
      unauthorized: "You are not authorized to view this report.",
      generic: "Unable to check the report status. Please try again.",
      reportId: "Report ID",
      problem: "Problem",
      description: "Description",
      category: "Category",
      priority: "Priority",
      location: "Location",
      submitted: "Submitted",
      currentStatus: "Current Status",
      statusHistory: "Status History",
      helpTitle: "Check your report status",
      helpText: "Enter the Report ID above to see whether your problem has been submitted, is under review, is in progress, or has been resolved.",
      example: "Example: Enter the Report ID provided when your problem was submitted.",
    },
    problems: {
      title: "My Problems",
      searchPlaceholder: "Search problems",
      filterAll: "All",
      filterDraft: "Draft",
      filterSubmitted: "Submitted",
      filterUnderReview: "Under Review",
      filterInProgress: "In Progress",
      filterResolved: "Resolved",
      filterRejected: "Rejected",
      cardTitle: "View Details",
      empty: "No problems match your current filters.",
      loading: "Loading your problems...",
      created: "Created",
    },
    details: {
      title: "Problem Details",
      description: "Description",
      category: "Category",
      priority: "Priority",
      location: "Location",
      created: "Created",
      attachments: "Attachments",
      statusTimeline: "Status Timeline",
      loading: "Loading problem details...",
      notFound: "This problem could not be found.",
    },
    profile: {
      title: "Profile",
      name: "Name",
      email: "Email",
      phone: "Phone",
      address: "Address",
      city: "City",
      district: "District",
      state: "State",
      pincode: "Pincode",
      loading: "Loading profile...",
    },
    status: {
      draft: "Draft",
      submitted: "Submitted",
      underReview: "Under Review",
      inProgress: "In Progress",
      resolved: "Resolved",
      rejected: "Rejected",
    },
  },
};

export default en;