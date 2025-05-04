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

    // Add the current sync time to each session object
    const syncTime = new Date().toISOString(); // current timestamp
    const sessionsWithSyncTime = sessions.map(session => ({ ...session, syncTime }));

    const { client, db } = await connectToDatabase();

    // Use a single minimal collection for all sync logs.
    const collection = client.db(dbName).collection<Record<string, unknown>>("session_logs");

    // Check for existing sessions with the same sessionId
    const sessionIds = sessionsWithSyncTime.map(session => session.sessionId);
    const existingSessions = await collection.find({ sessionId: { $in: sessionIds } }).toArray();
    
    if (existingSessions.length > 0) {
      console.warn(`Found ${existingSessions.length} existing sessions with the same sessionIds. Skipping these sessions.`);
      // Filter out sessions that already exist
      const newSessions = sessionsWithSyncTime.filter(
        session => !existingSessions.some(existing => existing.sessionId === session.sessionId)
      );
      
      if (newSessions.length === 0) {
        return NextResponse.json({ 
          success: true, 
          message: "All sessions already exist in database",
          skipped: existingSessions.length
        });
      }
      
      // Insert only the new sessions
      const result = await collection.insertMany(newSessions);
      return NextResponse.json({ 
        success: true, 
        insertedIds: result.insertedIds,
        skipped: existingSessions.length
      });
    }

    // If no existing sessions found, insert all sessions
    const result = await collection.insertMany(sessionsWithSyncTime);
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