import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    if (!params.path || params.path.length < 2) {
      return new NextResponse('Invalid path', { status: 400 });
    }

    const [sessionId, fileName] = params.path;
    
    // Construct file path
    const filePath = path.join(
      process.cwd(), 
      'tmp', 
      'takeoffs', 
      sessionId, 
      fileName
    );

    // Security check - ensure path is within our temp directory
    const safePath = path.resolve(filePath);
    const safeRoot = path.resolve(process.cwd(), 'tmp', 'takeoffs');
    
    if (!safePath.startsWith(safeRoot)) {
      return new NextResponse('Access denied', { status: 403 });
    }

    // Check if file exists
    if (!existsSync(safePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Read file
    const fileBuffer = await readFile(safePath);
    
    // Determine content type based on file extension
    const ext = path.extname(fileName).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.csv': 'text/csv',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.txt': 'text/plain',
      '.pdf': 'application/pdf'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    
    // Set appropriate headers
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': fileBuffer.length.toString(),
      'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
    });

    return new NextResponse(fileBuffer, { headers });

  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 