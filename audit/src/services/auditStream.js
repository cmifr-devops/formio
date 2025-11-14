import { getDB } from "../db.js";

  function setAuditInfo(auditEntry, metadata) {
    auditEntry.updatedBy = typeof metadata?.auditInfo?.updatedBy !== 'undefined' ?
      metadata.auditInfo?.updatedBy :
      'desconocido';
  }

export function startAuditStream() {
  const db = getDB();
  const submissions = db.collection("submissions");
  const audit = db.collection("submissions_audit");

  const changeStream = submissions.watch();

  console.log("Escuchando cambios en submissions...");

  changeStream.on("change", async (change) => {

    const auditEntry = {
      documentId: change.documentKey._id,
      timestamp: new Date(),
      operationType: change.operationType
    };

    if (change.operationType === "update") {
      auditEntry.data = change.updateDescription.updatedFields.data;
      setAuditInfo(auditEntry, change.updateDescription.updatedFields.metadata);
      auditEntry.removedFields = change.updateDescription.removedFields;
    }
    else if (change.operationType === "insert") {
      auditEntry.data = change.fullDocument.data;
      setAuditInfo(auditEntry, change.fullDocument.metadata);
    }
    else if (change.operationType === "delete") {
      // formio usa soft deletes, por lo que esta rama nunca se ejecuta
      auditEntry.deletedDocumentId = change.documentKey._id;
    }

    try {
      await audit.insertOne(auditEntry);
      console.log(`[AUDIT] ${auditEntry.operationType} on ${auditEntry.documentId}`);
    } catch (err) {
      console.error("Error guardando auditoría:", err);
    }
  });

  return changeStream;
}