"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

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

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  // Connect to the database
  const client = new MongoClient(uri);
  try {
    await client.connect();
  } catch (connErr) {
    console.error("MongoDB connection error:", connErr);
    throw connErr;
  }
  const db = client.db(dbName);
  return { client, db };
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    // Ensure data is an array of sessionData objects.
    // If a single sessionData object is received, wrap it in an array.
    const sessions = Array.isArray(data) ? data : [data];

    const { client } = await connectToDatabase();

    // Use a single minimal collection for all sync logs.
    const collection = client.db(dbName).collection<Record<string, unknown>>("session_logs");

    // Insert all sessions as separate documents.
    const result = await collection.insertMany(sessions);

    return NextResponse.json({ success: true, insertedIds: result.insertedIds });
  } catch (error) {
    console.error("Error syncing session data:", error);
    let errorMessage = "Failed to sync session data";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(error.stack);
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 