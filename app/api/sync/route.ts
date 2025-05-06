"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Ensure you have these environment variables set.
const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;
const s3Bucket = process.env.AWS_S3_BUCKET as string;
const s3Region = process.env.AWS_REGION as string;

if (!uri) {
  throw new Error("Missing environment variable: MONGODB_URI");
}
if (!dbName) {
  throw new Error("Missing environment variable: MONGODB_DB");
}
if (!s3Bucket) {
  throw new Error("Missing environment variable: AWS_S3_BUCKET");
}
if (!s3Region) {
  throw new Error("Missing environment variable: AWS_REGION");
}

// Initialize S3 client
const s3Client = new S3Client({ region: s3Region });

async function uploadImageToS3(imageData: string, sessionId: string): Promise<string> {
  // Convert base64 to buffer
  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');

  // Generate a unique filename
  const filename = `drawings/${sessionId}-${Date.now()}.png`;

  // Upload to S3
  await s3Client.send(new PutObjectCommand({
    Bucket: s3Bucket,
    Key: filename,
    Body: buffer,
    ContentType: 'image/png',
  }));

  // Return the URL
  return `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${filename}`;
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

    // Process each session
    for (const session of sessionsWithSyncTime) {
      // If there's a drawing image, upload it to S3
      if (session.drawingData?.drawingImageUrl) {
        const imageUrl = await uploadImageToS3(
          session.drawingData.drawingImageUrl,
          session.sessionId
        );
        // Update the session with the S3 URL
        session.drawingData.drawingImageUrl = imageUrl;
      }
    }

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