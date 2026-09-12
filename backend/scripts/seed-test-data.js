import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

const baseUrl = (process.env.SEED_API_URL || `http://127.0.0.1:${process.env.PORT || 5000}`).replace(/\/$/, "");
const password = "Test@12345";
const report = { startedAt: new Date().toISOString(), baseUrl, created: {}, reused: {}, skipped: [], failures: [], verification: {} };

const citizens = [
  ["garbage", "TEST Citizen Ranchi Garbage", "9876543201", "Lalpur Main Road", "834001", "Irregular Garbage Collection in Lalpur", "GARBAGE / WASTE", "HIGH"],
  ["segregation", "TEST Citizen Ranchi Waste Segregation", "9876543202", "Kanke Road", "834008", "Improper Waste Segregation in Kanke Road", "WASTE", "MEDIUM"],
  ["bins", "TEST Citizen Ranchi Overflowing Bins", "9876543203", "Doranda Main Road", "834002", "Overflowing Community Garbage Bins in Doranda", "GARBAGE / WASTE", "HIGH"],
  ["dumping", "TEST Citizen Ranchi Open Dumping", "9876543204", "Bariatu Road", "834009", "Open Garbage Dumping in Bariatu", "GARBAGE / WASTE", "HIGH"],
  ["school", "TEST Citizen Ranchi School Waste", "9876543205", "Ashok Nagar", "834002", "Garbage Accumulation Near School in Ashok Nagar", "GARBAGE / SANITATION", "HIGH"],
].map(([key, name, mobile, address, pincode, title, category, priority]) => ({
  key,
  name,
  mobile,
  address,
  pincode,
  title,
  category,
  priority,
  email: `test.citizen.ranchi.${key}@jansamadhan.test`,
}));

const universities = [
  ["iot", "TEST Ranchi Institute of Technology", "TEST-UNI-RNC-001", "BIT Mesra Academic Campus", "835215", { technologies: ["Internet of Things", "Artificial Intelligence", "Data Analytics"], researchAreas: ["Waste Management", "Environmental Engineering"], skills: ["Smart Waste Monitoring", "IoT Sensors", "Waste Collection Optimization", "Route Optimization"] }],
  ["engineering", "TEST Ranchi University of Engineering", "TEST-UNI-RNC-002", "Morabadi Academic Campus", "834008", { technologies: ["Artificial Intelligence", "Machine Learning", "Data Analytics"], researchAreas: ["Environmental Engineering", "Smart Cities"], skills: ["Computer Vision", "Data Analytics", "Optimization", "Waste Classification"] }],
  ["environment", "TEST Ranchi Environmental Science University", "TEST-UNI-RNC-003", "Kokar Academic Campus", "834001", { technologies: ["Data Analytics", "IoT"], researchAreas: ["Environmental Engineering", "Waste Management", "Environmental Science"], skills: ["Waste Management", "Waste Classification", "Recycling Systems", "Environmental Monitoring"] }],
  ["cs", "TEST Ranchi Institute of Computer Science", "TEST-UNI-RNC-004", "Harmu Academic Campus", "834002", { technologies: ["Artificial Intelligence", "Machine Learning", "Internet of Things", "Cloud Computing"], researchAreas: ["Smart Cities"], skills: ["Route Optimization", "Mobile Applications", "Data Analytics", "IoT Integration"] }],
  ["civil", "TEST Ranchi Institute of Civil Engineering", "TEST-UNI-RNC-005", "Bariatu Academic Campus", "834009", { technologies: ["Data Analytics"], researchAreas: ["Civil Engineering", "Environmental Engineering", "Waste Management"], skills: ["Urban Infrastructure", "Waste Collection Planning", "Municipal Systems", "Infrastructure Planning"] }],
  ["smartcity", "TEST Ranchi Smart City Research University", "TEST-UNI-RNC-006", "Namkum Research Campus", "834010", { technologies: ["Internet of Things", "Artificial Intelligence", "Data Analytics"], researchAreas: ["Smart Cities", "Waste Management"], skills: ["Smart Infrastructure", "Waste Monitoring", "Route Optimization", "Urban Analytics"] }],
].map(([key, name, registrationNumber, address, pincode, capabilities]) => ({ key, name, registrationNumber, address, pincode, capabilities, email: `test.university.ranchi.${key}@jansamadhan.test` }));

const industries = [
  ["waste", "TEST Ranchi WasteTech Solutions", "TEST-IND-RNC-001", "Industrial Area", "834001", [["TECHNOLOGY", "Internet of Things"], ["TECHNOLOGY", "Artificial Intelligence"], ["TECHNOLOGY", "Data Analytics"], ["DOMAIN", "Waste Management"], ["DOMAIN", "Environmental Management"], ["SKILL", "Smart Waste Monitoring"], ["SKILL", "IoT Sensors"], ["SKILL", "Route Optimization"], ["SKILL", "Waste Collection Optimization"]]],
  ["infrastructure", "TEST Ranchi Smart Infrastructure", "TEST-IND-RNC-002", "Namkum Industrial Area", "834010", [["TECHNOLOGY", "IoT"], ["TECHNOLOGY", "Cloud Computing"], ["DOMAIN", "Smart Cities"], ["DOMAIN", "Infrastructure"], ["SKILL", "Smart Sensors"], ["SKILL", "Monitoring Systems"], ["SKILL", "IoT Deployment"]]],
  ["ai", "TEST Ranchi AI Analytics", "TEST-IND-RNC-003", "Harmu Industrial Area", "834002", [["TECHNOLOGY", "Artificial Intelligence"], ["TECHNOLOGY", "Machine Learning"], ["TECHNOLOGY", "Data Analytics"], ["DOMAIN", "Smart Cities"], ["SKILL", "Computer Vision"], ["SKILL", "Predictive Analytics"], ["SKILL", "Route Optimization"]]],
  ["environment", "TEST Ranchi Environmental Solutions", "TEST-IND-RNC-004", "Kokar Industrial Area", "834001", [["DOMAIN", "Waste Management"], ["DOMAIN", "Environmental Management"], ["DOMAIN", "Recycling"], ["TECHNOLOGY", "Data Analytics"], ["SKILL", "Waste Processing"], ["SKILL", "Waste Segregation"], ["SKILL", "Recycling Systems"]]],
  ["smartcity", "TEST Ranchi Smart City Systems", "TEST-IND-RNC-005", "Tatisilwai Industrial Area", "835103", [["TECHNOLOGY", "Internet of Things"], ["TECHNOLOGY", "Artificial Intelligence"], ["TECHNOLOGY", "Cloud Computing"], ["DOMAIN", "Smart Cities"], ["DOMAIN", "Waste Management"], ["SKILL", "Smart Infrastructure"], ["SKILL", "IoT Deployment"], ["SKILL", "Waste Monitoring"], ["SKILL", "Data Analytics"]]],
].map(([key, name, registrationNumber, address, pincode, capabilities]) => ({ key, name, registrationNumber, address, pincode, capabilities, email: `test.industry.ranchi.${key}@jansamadhan.test` }));

async function request(method, endpoint, body, token) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.SEED_REQUEST_TIMEOUT_MS || 15000));
  let response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, { method, headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body === undefined ? undefined : JSON.stringify(body), signal: controller.signal });
  } catch (error) {
    return { response: { ok: false, status: 0 }, data: { message: error.name === "AbortError" ? "request timeout" : error.message } };
  } finally {
    clearTimeout(timer);
  }
  let data = {};
  try { data = await response.json(); } catch { data = { message: await response.text() }; }
  return { response, data };
}

async function registerOrLogin(kind, payload, loginPayload, resultKey) {
  const registered = await request("POST", `/api/auth/${kind}/register`, payload);
  if (registered.response.ok) { report.created[resultKey] = (report.created[resultKey] || 0) + 1; return registered.data.token; }
  if (registered.response.status !== 409) throw new Error(`${kind} registration failed (${registered.response.status}): ${registered.data.message || "unknown error"}`);
  const loggedIn = await request("POST", `/api/auth/${kind}/login`, loginPayload);
  if (!loggedIn.response.ok) {
    report.skipped.push({ type: kind, key: payload.email, reason: "Existing @jansamadhan.test record could not be logged in; it was not modified", status: loggedIn.response.status });
    return null;
  }
  report.reused[resultKey] = (report.reused[resultKey] || 0) + 1;
  return loggedIn.data.token;
}

async function createFallbackDraft(prisma, citizen, description) {
  const existing = await prisma.report.findFirst({
    where: {
      citizenId: citizen.id,
      title: citizen.title,
    },
    select: { id: true, status: true },
  });

  if (existing) {
    return existing;
  }

  const conversation = await prisma.reportConversation.create({
    data: {
      citizenId: citizen.id,
      status: "ACTIVE",
      messages: {
        create: {
          role: "user",
          content: description,
        },
      },
    },
  });

  return prisma.report.create({
    data: {
      citizenId: citizen.id,
      conversationId: conversation.id,
      title: citizen.title,
      description,
      category: citizen.category,
      priority: citizen.priority,
      address: citizen.address,
      city: "Ranchi",
      district: "Ranchi",
      state: "Jharkhand",
      pincode: citizen.pincode,
      status: "DRAFT",
    },
    select: { id: true, status: true },
  });
}

async function main() {
  const health = await request("GET", "/");
  if (!health.response.ok) throw new Error(`Backend unavailable at ${baseUrl}`);

  await registerOrLogin("government", { name: "TEST Ranchi Sanitation Department", email: "test.gov.sanitation.ranchi@jansamadhan.test", password, employeeId: "GOV-SANITATION-RNC-001", department: "Sanitation Department", designation: "Sanitation Officer", office: "Ranchi Municipal Sanitation Office", district: "Ranchi", state: "Jharkhand" }, { email: "test.gov.sanitation.ranchi@jansamadhan.test", password }, "government");

  const citizenTokens = {};
  for (const citizen of citizens) {
    citizenTokens[citizen.key] = await registerOrLogin("citizen", { name: citizen.name, mobile: citizen.mobile, email: citizen.email, password, address: citizen.address, city: "Ranchi", district: "Ranchi", state: "Jharkhand", pincode: citizen.pincode }, { mobile: citizen.mobile, password }, "citizens");
  }

  const universityTokens = {};
  const universityIds = {};
  for (const university of universities) {
    universityTokens[university.key] = await registerOrLogin("university", { name: university.name, email: university.email, password, registrationNumber: university.registrationNumber, address: university.address, city: "Ranchi", district: "Ranchi", state: "Jharkhand", pincode: university.pincode }, { email: university.email, password }, "universities");
    if (!universityTokens[university.key]) continue;
    const me = await request("GET", "/api/auth/me", undefined, universityTokens[university.key]);
    universityIds[university.key] = me.data.user?.university?.id || me.data.user?.id;
    const groups = university.capabilities;
    const caps = await request("POST", "/api/university/capabilities", groups, universityTokens[university.key]);
    if (!caps.response.ok) throw new Error(`Capabilities failed for ${university.email}: ${caps.data.message || caps.response.status}`);
  }

  for (let u = 0; u < universities.length; u++) for (let n = 1; n <= 3; n++) {
    const university = universities[u];
    if (!universityTokens[university.key]) {
      report.skipped.push({ type: "student", key: `u${u + 1}.0${n}`, reason: "Parent university could not be authenticated" });
      continue;
    }
    await registerOrLogin("student", { name: `TEST Student RNC U${u + 1} 0${n}`, email: `test.student.rnc.u${u + 1}.0${n}@jansamadhan.test`, password, studentId: `TEST-STU-RNC-U${u + 1}-00${n}`, universityId: university.registrationNumber }, { email: `test.student.rnc.u${u + 1}.0${n}@jansamadhan.test`, password }, "students");
  }

  for (const industry of industries) {
    const token = await registerOrLogin("industry", { name: industry.name, email: industry.email, password, registrationNumber: industry.registrationNumber, address: industry.address, area: industry.address, city: "Ranchi", district: "Ranchi", state: "Jharkhand", pincode: industry.pincode }, { email: industry.email, password }, "industries");
    if (!token) continue;
    const caps = await request("PUT", "/api/industry/capabilities", { capabilities: industry.capabilities.map(([type, value]) => ({ type, value })) }, token);
    if (!caps.response.ok) throw new Error(`Industry capabilities failed for ${industry.email}: ${caps.data.message || caps.response.status}`);
  }

  const { default: prisma } = await import("../src/config/prisma.js");
  for (const citizen of citizens) {
    const description = `${citizen.title}. This test problem has continued for several months and affects nearby households.`;
    const draft = await request("POST", "/api/citizen/report", { message: `${description} Location: ${citizen.address}, Ranchi, Ranchi, Jharkhand, ${citizen.pincode}` }, citizenTokens[citizen.key]);
    let reportId = draft.data.reportId;
    if (!draft.response.ok || !reportId) {
      const citizenRecord = await prisma.citizen.findFirst({
        where: { email: citizen.email },
        select: { id: true },
      });
      if (!citizenRecord) {
        report.failures.push({ type: "report", key: citizen.key, detail: "Citizen record was not found for fallback report creation" });
        continue;
      }
      const fallback = await createFallbackDraft(
        prisma,
        { ...citizen, id: citizenRecord.id },
        description
      );
      reportId = fallback.id;
      report.created.fallbackReports = (report.created.fallbackReports || 0) + (fallback.status === "DRAFT" ? 1 : 0);
    }
    if (!reportId) {
      report.failures.push({ type: "report", key: citizen.key, detail: "Report ID was not available after API and fallback creation" });
      continue;
    }
    const submitted = await request("POST", `/api/citizen/report/${reportId}/submit`, undefined, citizenTokens[citizen.key]);
    if (!submitted.response.ok && submitted.response.status !== 404) {
      report.failures.push({ type: "report-submit", key: citizen.key, status: submitted.response.status, detail: submitted.data.message });
    }
  }

  const targetGovernmentEmail = "test.gov.sanitation.ranchi@jansamadhan.test";
  const testReportIds = [];
  for (const citizen of citizens) {
    const testReport = await prisma.report.findFirst({
      where: {
        citizen: { email: citizen.email },
        title: citizen.title,
      },
      select: { id: true, status: true },
    });
    if (!testReport) {
      report.failures.push({
        type: "report",
        key: citizen.key,
        detail: "Expected test report was not found after submission",
      });
      continue;
    }
    testReportIds.push(testReport.id);
    if (testReport.status === "DRAFT") {
      report.failures.push({
        type: "report",
        key: citizen.key,
        detail: "Expected report to be submitted before routing",
      });
      continue;
    }
    // Use a category supported by the existing sanitation routing map.
    await prisma.report.update({
      where: { id: testReport.id },
      data: { category: "WASTE" },
    });
    const { routeReportToGovernment } = await import("../src/controllers/governmentReportController.js");
    const routingResult = await routeReportToGovernment(testReport.id);
    if (
      !routingResult.assigned ||
      routingResult.government?.email !== targetGovernmentEmail
    ) {
      report.failures.push({
        type: "routing",
        key: citizen.key,
        detail: "Report did not route to the target sanitation government",
        routingResult,
      });
    }
  }

  try {
    const emailFilter = { contains: "@jansamadhan.test", endsWith: "@jansamadhan.test" };
    const [citizenCount, universityCount, studentCount, industryCount, governmentCount, testReports, assignments] = await Promise.all([
      prisma.citizen.count({ where: { email: emailFilter } }),
      prisma.university.count({ where: { email: emailFilter } }),
      prisma.student.count({ where: { email: emailFilter } }),
      prisma.industry.count({ where: { email: emailFilter } }),
      prisma.government.count({ where: { email: emailFilter } }),
      prisma.report.findMany({ where: { citizen: { email: emailFilter } }, select: { id: true, status: true, title: true, governmentAssignment: { select: { department: true, government: { select: { email: true, district: true, state: true } } } } } }),
      prisma.governmentReportAssignment.count({ where: { government: { email: emailFilter } } }),
    ]);
    const targetAssignments = testReports.filter(
      (item) =>
        item.governmentAssignment?.government?.email ===
        targetGovernmentEmail
    );
    report.verification = {
      counts: {
        governments: governmentCount,
        citizens: citizenCount,
        universities: universityCount,
        students: studentCount,
        industries: industryCount,
        reports: testReports.length,
        assignments,
      },
      reports: testReports,
      routing: {
        targetGovernmentEmail,
        assignedToTarget: targetAssignments.length,
        allFiveAssignedToTarget:
          targetAssignments.length >= 5 &&
          testReports.length >= 5,
      },
    };
    await prisma.$disconnect();
  } catch (error) {
    report.verification = { unavailable: `Database verification failed: ${error.message}` };
  }
  report.completedAt = new Date().toISOString();
  const artifact = process.env.SEED_REPORT_PATH || path.join(process.cwd(), "seed-test-data-report.json");
  fs.writeFileSync(artifact, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => { report.failures.push({ type: "fatal", detail: error.message }); report.completedAt = new Date().toISOString(); console.error(JSON.stringify(report, null, 2)); process.exitCode = 1; });
