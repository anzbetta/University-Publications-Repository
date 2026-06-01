import neo4j, { Driver } from "neo4j-driver";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.NEO4J_URI;
const username = process.env.NEO4J_USERNAME;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("Neo4j environment variables are missing");
}

export const driver: Driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password),
);

export const database = process.env.NEO4J_DATABASE || "neo4j";
