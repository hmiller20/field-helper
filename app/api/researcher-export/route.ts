import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Create a data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'data')
    try {
      await mkdir(dataDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, ignore error
    }
    
    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `researcher-hours-${timestamp}.json`
    const filepath = join(dataDir, filename)
    
    // Write the data to file
    await writeFile(filepath, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: `Data exported to ${filename}`,
      filename 
    })
  } catch (error) {
    console.error('Error exporting researcher data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Use POST to export researcher time tracking data' 
  })
} 