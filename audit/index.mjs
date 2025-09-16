import { MongoClient } from "mongodb";

let mongoClient

async function run() {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017";
  mongoClient = new MongoClient(uri);
  await mongoClient.connect();

  const db = mongoClient.db();
  const submissions = db.collection("submissions");
  const audit = db.collection("submissions_audit");

const changeStream = submissions.watch();

function setAuditInfo(auditEntry, metadata) {
  auditEntry.updatedBy = typeof metadata?.auditInfo?.updatedBy !== 'undefined' ? 
    metadata.auditInfo?.updatedBy :
    'desconocido';
}

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
}

process.on("SIGINT", async () => {
  await mongoClient.close();
  console.log("MongoClient cerrado.");
  process.exit();
});

run().catch(console.error);
