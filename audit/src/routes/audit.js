import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db.js";

const router = Router();

router.get("/submissions/:submissionId/summary", async (req, res) => {
  try {
    const { submissionId } = req.params;
    const includeAnonymous = req.query.includeAnonymous === "true";

    if (!ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: "Invalid submissionId format" });
    }

    const db = getDB();
    const audit = db.collection("submissions_audit");

    const filter = { documentId: new ObjectId(submissionId) };

    if (!includeAnonymous) {
      filter.updatedBy = { $ne: null };
    }

    const lastAuditEntry = await audit
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(1)
      .toArray();

    if (!lastAuditEntry || lastAuditEntry.length === 0) {
      return res.status(404).json({
        error: "No audit entries found for this submissionId"
      });
    }

    const { timestamp, updatedBy } = lastAuditEntry[0];

    return res.json({
      submissionId,
      updatedBy: updatedBy,
      updatedAt: timestamp
    });

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/submissions/:submissionId", async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!ObjectId.isValid(submissionId)) {
      return res.status(400).json({ error: "Invalid submissionId format" });
    }

    const db = getDB();
    const audit = db.collection("submissions_audit");

    const auditHistory = await audit
      .find({ documentId: new ObjectId(submissionId) })
      .toArray();

    return res.json(auditHistory);

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;