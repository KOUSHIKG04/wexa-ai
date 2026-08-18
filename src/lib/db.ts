import neo4j, { Driver } from "neo4j-driver";

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("Missing COGNODB_URI, COGNODB_USERNAME, or COGNODB_PASSWORD");
}

/*
 * During development, Next.js reloads modules frequently.
 * Keeping the driver on globalThis prevents unnecessary connections.
 */
const globalForNeo4j = globalThis as unknown as {
  cognoDriver?: Driver;
};

export const driver =
  globalForNeo4j.cognoDriver ??
  neo4j.driver(uri, neo4j.auth.basic(username, password), {
    maxConnectionPoolSize: 5,
    maxTransactionRetryTime: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForNeo4j.cognoDriver = driver;
}

export async function verifyDatabaseConnection(): Promise<void> {
  await driver.verifyConnectivity();
}
