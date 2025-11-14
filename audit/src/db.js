import { MongoClient } from "mongodb";
import { MONGO_URI } from './config.js';

let mongoClient;
let db;

export async function connectDB() {
  mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  db = mongoClient.db();
  console.log("Conectado a MongoDB");
  return db;
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
}

export async function closeDB() {
  if (mongoClient) {
    await mongoClient.close();
    console.log("MongoClient cerrado.");
  }
}