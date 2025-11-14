import dotenv from 'dotenv';

dotenv.config();

export const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
export const MONGO_DB = process.env.MONGO_DB || "formio-ce";
export const PORT = process.env.PORT || 3050;