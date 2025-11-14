import express from "express";
import { PORT } from './config.js'
import { connectDB, closeDB } from './db.js';
import { loggerMiddleware } from './middleware/logger.js';
import auditRoutes from './routes/audit.js';
import { startAuditStream } from './services/auditStream.js';
import cors from 'cors';

let changeStream

async function run() {

  await connectDB();

  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(loggerMiddleware);
 
  app.use("/", auditRoutes);

  app.listen(PORT, () => {
    console.log(`Servidor Express escuchando en puerto ${PORT}`);
  });

  changeStream = startAuditStream();
}

process.on("SIGINT", async () => {
  if (changeStream) {
    await changeStream.close();
  }

  await closeDB();
  process.exit();
});

run().catch(console.error);
