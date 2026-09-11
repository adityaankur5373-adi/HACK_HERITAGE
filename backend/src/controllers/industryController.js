import prisma from "../config/prisma.js";
import { storeIndustryVector } from "../services/ai.service.js";

async function syncVector(industry) {
  const capabilities = await prisma.industryCapability.findMany({ where: { industryId: industry.id } });
  try { await storeIndustryVector({ industryId: industry.id, industry: { ...industry, capabilities } }); return "READY"; }
  catch (error) { console.error("Industry vector sync error:", error.response?.data || error.message); return "PENDING"; }
}
export async function getIndustryProfile(req, res) { return res.json({ success: true, industry: req.industry }); }
export async function updateIndustryProfile(req, res) {
  const allowed = ["name", "description", "address", "area", "city", "district", "state", "pincode", "phone", "website"];
  const data = Object.fromEntries(allowed.filter((key) => typeof req.body[key] === "string").map((key) => [key, req.body[key].trim() || null]));
  try { const industry = await prisma.industry.update({ where: { id: req.industry.id }, data }); const vectorStatus = await syncVector(industry); return res.json({ success: true, industry, vectorStatus }); }
  catch (error) { console.error("Industry profile update error:", error); return res.status(500).json({ success: false, message: "Unable to update industry profile" }); }
}
export async function getIndustryCapabilities(req, res) { try { return res.json({ success: true, capabilities: await prisma.industryCapability.findMany({ where: { industryId: req.industry.id }, orderBy: { type: "asc" } }) }); } catch { return res.status(500).json({ success:false, message:"Unable to load capabilities" }); } }
export async function saveIndustryCapabilities(req, res) {
  const capabilities = Array.isArray(req.body.capabilities) ? req.body.capabilities.filter((item) => typeof item?.type === "string" && typeof item?.value === "string" && item.type.trim() && item.value.trim()).map((item) => ({ industryId: req.industry.id, type: item.type.trim().toUpperCase(), value: item.value.trim() })) : [];
  if (!capabilities.length) return res.status(400).json({ success:false, message:"Provide at least one capability" });
  try { await prisma.$transaction(async (tx) => { await tx.industryCapability.deleteMany({ where:{ industryId:req.industry.id } }); await tx.industryCapability.createMany({ data: capabilities }); }); const vectorStatus = await syncVector(req.industry); return res.json({ success:true, capabilities, vectorStatus }); }
  catch (error) { console.error("Industry capabilities error:", error); return res.status(500).json({ success:false, message:"Unable to save capabilities" }); }
}
