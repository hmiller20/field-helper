"use server";

console.log("Loaded env variables:");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "SET" : "NOT SET");
console.log("MONGODB_DB:", process.env.MONGODB_DB);
console.log("AWS_S3_BUCKET:", process.env.AWS_S3_BUCKET);
console.log("AWS_REGION:", process.env.AWS_REGION);
console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "SET" : "NOT SET");
console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "SET" : "NOT SET");


/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { MongoClient, Db } from "mongodb";
import { S3Client, PutObjectCommand, S3 } from "@aws-sdk/client-s3";

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
if (!process.env.AWS_ACCESS_KEY_ID) {
  throw new Error("Missing environment variable: AWS_ACCESS_KEY_ID");
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error("Missing environment variable: AWS_SECRET_ACCESS_KEY");
}

// Initialize S3 client
const s3Client = new S3Client({ 
  region: s3Region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function uploadImageToS3(imageData: string, sessionId: string): Promise<string> {
  try {
    console.log(`Attempting to upload image for session: ${sessionId}`);
    
    // Validate that we have a base64 image
    if (!imageData.startsWith('data:image/')) {
      console.error(`Invalid image data format for session ${sessionId}:`, imageData.substring(0, 100));
      throw new Error('Invalid image data format');
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate a unique filename
    const filename = `drawings/${sessionId}-${Date.now()}.png`;
    
    console.log(`Uploading to S3: ${filename} (${buffer.length} bytes)`);

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: s3Bucket,
      Key: filename,
      Body: buffer,
      ContentType: 'image/png',
    });
    
    const result = await s3Client.send(command);
    console.log(`S3 upload successful for ${filename}:`, result);

    // Return the URL
    const s3Url = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${filename}`;
    console.log(`Generated S3 URL: ${s3Url}`);
    
    return s3Url;
  } catch (error) {
    console.error(`Failed to upload image to S3 for session ${sessionId}:`, error);
    // Return the original base64 data as fallback so the sync doesn't fail completely
    console.warn(`Falling back to base64 data for session ${sessionId}`);
    return imageData;
  }
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
    // Ensure data is an array of session objects.
    // If a single session object is received, wrap it in an array.
    const sessions = Array.isArray(data) ? data : [data];

    // Add the current sync time to each session object
    const syncTime = new Date().toISOString(); // current timestamp
    const sessionsWithSyncTime = sessions.map(session => ({ ...session, syncTime }));

    // Process each session
    for (const session of sessionsWithSyncTime) {
      console.log(`Processing session: ${session.id}`);
      
      // Process drawings from blocks array
      if (session.blocks && Array.isArray(session.blocks)) {
        console.log(`Found ${session.blocks.length} blocks for session ${session.id}`);
        for (let i = 0; i < session.blocks.length; i++) {
          const block = session.blocks[i];
          if (block.drawing?.pngUrl) {
            console.log(`Processing drawing for block ${i} (${block.blockType}) in session ${session.id}`);
            const originalUrl = block.drawing.pngUrl;
            const imageUrl = await uploadImageToS3(
              block.drawing.pngUrl,
              session.id
            );
            // Update the block with the S3 URL
            block.drawing.pngUrl = imageUrl;
            console.log(`Updated block ${i} pngUrl from ${originalUrl.substring(0, 50)}... to ${imageUrl}`);
          } else {
            console.log(`No drawing data found for block ${i} in session ${session.id}`);
          }
        }
      } else {
        console.log(`No blocks array found for session ${session.id}`);
      }
      
      // Also handle legacy drawingData format if it exists
      if (session.drawingData?.drawingImageUrl) {
        console.log(`Processing legacy drawingData for session ${session.id}`);
        const originalUrl = session.drawingData.drawingImageUrl;
        const imageUrl = await uploadImageToS3(
          session.drawingData.drawingImageUrl,
          session.id
        );
        session.drawingData.drawingImageUrl = imageUrl;
        console.log(`Updated legacy drawingImageUrl from ${originalUrl.substring(0, 50)}... to ${imageUrl}`);
      }
    }

    const { client, db } = await connectToDatabase();

    // Use a single minimal collection for all sync logs.
    const collection = db.collection<Record<string, unknown>>("session_logs");

    // Check for existing sessions with the same id
    const sessionIds = sessionsWithSyncTime.map(session => session.id);
    const existingSessions = await collection.find({ id: { $in: sessionIds } }).toArray();
    
    if (existingSessions.length > 0) {
      console.warn(`Found ${existingSessions.length} existing sessions with the same ids. Skipping these sessions.`);
      // Filter out sessions that already exist
      const newSessions = sessionsWithSyncTime.filter(
        session => !existingSessions.some(existing => existing.id === session.id)
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