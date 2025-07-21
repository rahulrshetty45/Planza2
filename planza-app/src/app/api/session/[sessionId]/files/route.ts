import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Construct session directory path
    const sessionDir = path.join(
      process.cwd(), 
      'tmp', 
      'takeoffs', 
      sessionId
    );

    // Check if session directory exists
    if (!existsSync(sessionDir)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Read all files in the session directory
    const files = await readdir(sessionDir);
    
    const fileList = await Promise.all(
      files.map(async (fileName) => {
        const filePath = path.join(sessionDir, fileName);
        const stats = await stat(filePath);
        
        // Determine file type from extension
        const ext = path.extname(fileName).toLowerCase();
        let fileType = 'file';
        if (ext === '.csv') fileType = 'csv';
        else if (ext === '.md') fileType = 'md';
        else if (ext === '.json') fileType = 'json';
        else if (ext === '.txt') fileType = 'txt';
        
        return {
          fileName,
          fileSize: stats.size,
          type: fileType,
          downloadUrl: `/api/download/${sessionId}/${fileName}`,
          createdAt: stats.ctime.toISOString()
        };
      })
    );

    return NextResponse.json(fileList);

  } catch (error) {
    console.error('Error fetching session files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 