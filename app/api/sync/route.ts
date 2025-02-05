"use server";

import { NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";

// Ensure you have these environment variables set.
const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

if (!uri) {
  throw new Error("Missing environment variable: MONGODB_URI");
}
if (!dbName) {
  throw new Error("Missing environment variable: MONGODB_DB");
}

// Use a cached connection object to improve performance.
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Optionally wrap connect() in try/catch to log connection errors.
  const client = new MongoClient(uri);
  try {
    await client.connect();
  } catch (connErr) {
    console.error("MongoDB connection error:", connErr);
    throw connErr;
  }
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export async function POST(request: Request) {
  try {
    // Parse and log the session data from the request body.
    const sessionData = await request.json();
    console.log("API /sync POST: received session data:", sessionData);

    if (!sessionData || typeof sessionData !== "object") {
      return NextResponse.json({ error: "Invalid session data" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Use a single minimal collection for all sync logs.
    const collection = db.collection("session_logs");

    // Add a category and timestamp for better organization.
    const newRecord = {
      category: "session_sync",
      ...sessionData,
      syncDate: new Date(),
    };

    const result = await collection.insertOne(newRecord);

    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (error: unknown) {
    console.error("Error syncing session data:", error);
    let errorMessage = "Failed to sync session data";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(error.stack);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 