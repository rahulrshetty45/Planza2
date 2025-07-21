import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import axios from 'axios';
import { io as SocketIOClient } from 'socket.io-client';

// 🚀 MANUS AI AUTOMATION - Next.js Integration
// Integrated from complete_manus_automation_final.js with multi-file support

const CONFIG = {
  JWT_TOKEN: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIyNTc4Y2NhOWQ4YmI0Y2IwYThjNTUzMjFmMDQ5NmFiOCIsImlhdCI6MTc1MzAxODQzMywidXNlcl9pZCI6IjMxMDUxOTY2MzA3Njk1NjI1MyIsIm5hbWUiOiJCZW5qYW1pbiBJYW4gQ2hlbiIsImVtYWlsIjoiaW5mb0Bib3VsZXZhcmRsZWdhY3kuY29tIiwiZ2l2ZW5fbmFtZSI6bnVsbCwiZmFtaWx5X25hbWUiOm51bGwsIm5pY2tuYW1lIjoiQmVuamFtaW4gSWFuIENoZW4iLCJhdmF0YXIiOiIifQ.rtfdpJ9i09-aq7KLB6e-SGTqQIUEu7Ak1aB6pxIN1JI",
  CLIENT_ID: "A4v1WaH0OgLagMi1tJypFM",
  USER_ID: "310519663076956253"
};

class ManusAutomationService {
  private headers: Record<string, string>;
  public sessionId: string | null;
  private socket: any;
  public responseBuffer: string;
  private fileUrls: Array<{url: string; type: string; description: string; timestamp: number}>;
  public downloadedFiles: Array<{fileName: string; filePath: string; fileSize: number; type: string; description: string; downloadUrl: string}>;
  private aiComplete: boolean;
  private uploadedFiles: Array<{signedCdnUrl: string; fileName: string; fileSize: number; originalName: string}>;
  private progressCallback: ((progress: any) => void) | null;

  constructor() {
    this.headers = {
      'authorization': `Bearer ${CONFIG.JWT_TOKEN}`,
      'content-type': 'application/json',
      'x-client-id': CONFIG.CLIENT_ID,
      'x-client-locale': 'en',
      'x-client-timezone': 'Asia/Calcutta',
      'x-client-timezone-offset': '-330',
      'x-client-type': 'web',
      'connect-protocol-version': '1',
      'accept': '*/*',
      'origin': 'https://manus.im',
      'referer': 'https://manus.im/',
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    };
    
    this.sessionId = null;
    this.socket = null;
    this.responseBuffer = '';
    this.fileUrls = [];
    this.downloadedFiles = [];
    this.aiComplete = false;
    this.uploadedFiles = [];
    this.progressCallback = null;
  }

  setProgressCallback(callback) {
    this.progressCallback = callback;
  }

  sendProgress(stage, progress, message, details = {}) {
    if (this.progressCallback) {
      this.progressCallback({
        stage,
        progress,
        message,
        timestamp: Date.now(),
        ...details
      });
    }
  }

  generateId(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async activateAgentMode() {
    this.sendProgress('uploading', 5, 'Activating AI agent mode...');
    
    try {
      await axios.post(
        'https://api.manus.im/api/user_behavior/batch_create_event_v2',
        {
          events: [{
            event_name: "home_agent_click",
            source: "2",
            ext_data: { url: "https://manus.im/app" },
            event_at: new Date().toISOString()
          }],
          user_info: { plan: 2, knowledge_entry_count: 0, session_count: 0 },
          client_info: {
            client_id: CONFIG.CLIENT_ID,
            client_type: "web",
            client_locale: "en",
            product_name: "Manus",
            timezone: "Asia/Calcutta",
            timezone_offset: -330,
            tm_token: "25b2139e15b22108ab581e9112551948"
          }
        },
        {
          headers: {
            'content-type': 'text/plain;charset=UTF-8',
            'cookie': `session_id=${CONFIG.JWT_TOKEN}`,
            'origin': 'https://manus.im',
            'referer': 'https://manus.im/',
            'user-agent': this.headers['user-agent']
          }
        }
      );

      this.sendProgress('uploading', 10, 'Agent mode activated successfully');
      return true;
    } catch (error) {
      throw new Error(`Agent Mode activation failed: ${error.message}`);
    }
  }

  async uploadFiles(fileBuffers) {
    this.sendProgress('uploading', 15, `Uploading ${fileBuffers.length} documents...`);
    
    this.sessionId = this.generateId(22);
    
    const uploadPromises = fileBuffers.map(async (fileInfo, index) => {
      const fileName = `takeoff-${Date.now()}-${index}.pdf`;
      
      try {
        // Step 1: Get presigned upload URL
        const presignedResponse = await axios.post(
          'https://api.manus.im/api/chat/getPresignedUploadUrl',
          {
            filename: fileName,
            fileType: fileInfo.contentType,
            fileSize: fileInfo.buffer.length,
            sessionId: this.sessionId
          },
          { headers: this.headers }
        );

        const { uploadUrl, id: fileId } = presignedResponse.data.data;

        // Step 2: Upload to S3
        await axios.put(uploadUrl, fileInfo.buffer, {
          headers: {
            'Content-Type': fileInfo.contentType,
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            'Content-Length': fileInfo.buffer.length.toString()
          }
        });

        // Step 3: Notify upload completion
        const completeResponse = await axios.post(
          'https://api.manus.im/api/chat/uploadComplete',
          { filename: fileName, fileSize: fileInfo.buffer.length, id: fileId },
          { headers: this.headers }
        );

        return {
          signedCdnUrl: completeResponse.data.data.fileUrl,
          fileName,
          fileSize: fileInfo.buffer.length,
          originalName: fileInfo.name
        };

      } catch (error) {
        throw new Error(`File upload failed for ${fileInfo.name}: ${error.message}`);
      }
    });
    
    this.uploadedFiles = await Promise.all(uploadPromises);
    this.sendProgress('uploading', 25, `${this.uploadedFiles.length} documents uploaded successfully`);
    
    return this.uploadedFiles;
  }

  async connectAndProcess(prompt) {
    this.sendProgress('reading', 30, 'Connecting to AI processor...');

    this.socket = SocketIOClient('wss://api.manus.im/', {
      query: {
        token: CONFIG.JWT_TOKEN,
        locale: 'en',
        tz: 'Asia/Calcutta',
        clientType: 'web'
      },
      transports: ['websocket'],
      forceNew: true
    });

    await new Promise<void>(resolve => {
      this.socket.on('connect', () => {
        this.sendProgress('reading', 35, 'Connected to AI processor');
        resolve();
      });
    });

    // Setup WebSocket handlers
    this.setupWebSocketHandlers();

    // Create attachments array for all uploaded files (multi-file support from multi_file_automation.js)
    const attachments = this.uploadedFiles.map((fileInfo) => ({
      filename: fileInfo.fileName,
      id: this.generateId(22),
      type: "file",
      url: fileInfo.signedCdnUrl,
      contentType: "application/pdf",
      contentLength: fileInfo.fileSize
    }));

    // Send the AI processing request
    const message = {
      id: this.generateId(22),
      timestamp: Date.now(),
      messageStatus: "pending",
      type: "user_message",
      sessionId: this.sessionId,
      content: prompt,
      taskMode: "agent",
      attachments: attachments, // Multi-file support
      extData: { mode: "lite" },
      countryIsoCode: "IN"
    };

    this.socket.emit("message", message);
    this.sendProgress('reading', 40, 'Enhanced AI analysis started - comprehensive data extraction in progress...');

    // Wait for completion with file capture
    return this.waitForCompletionAndFiles();
  }

  setupWebSocketHandlers() {
    this.socket.onAny((eventName, ...args) => {
      if (eventName === 'message' && args[0]) {
        const data = args[0];
        this.handleMessage(data);
      }

      // Scan for file URLs in all messages
      this.scanForFileUrls(args);
    });
  }

  handleMessage(data) {
    // Handle chat responses
    if (data?.event?.type === 'chat' && data?.event?.sender === 'assistant') {
      const content = data.event.content;
      this.responseBuffer += content;
      
      // Update progress based on response length
      const progressPercent = Math.min(50 + (this.responseBuffer.length / 100), 70);
      this.sendProgress('reading', progressPercent, 'AI analyzing documents...', {
        responseLength: this.responseBuffer.length
      });
    }
    
    // Handle live status updates
    if (data?.event?.type === 'liveStatus') {
      const status = data.event.text;
      
      if (status?.includes('Reading') || status?.includes('Viewing')) {
        this.sendProgress('reading', 50, `Phase 1: Document Analysis - ${status}`);
      } else if (status?.includes('Creating file') || status?.includes('Editing file')) {
        this.sendProgress('detecting', 75, 'Phase 2: Multi-Pass Data Extraction - Generating comprehensive CSV...');
      } else if (status?.includes('writing') || status?.includes('generating')) {
        this.sendProgress('estimating', 85, 'Phase 3: Verification & Consolidation - Finalizing results...');
      }
    }
    
    // Handle status updates and completion detection
    if (data?.event?.type === 'statusUpdate') {
      const status = data.event.brief || data.event.text;
      
      if (status?.includes('finished working') || status?.includes('stopped')) {
        this.sendProgress('estimating', 90, 'AI processing completed');
        this.aiComplete = true;
      }
    }

    // CRITICAL: Handle tool usage events (where file URLs are found)
    if (data?.event?.type === 'toolUsed' && data?.event?.status === 'success') {
      this.handleToolUsed(data.event);
    }
  }

  handleToolUsed(toolEvent) {
    if (toolEvent?.detail?.textEditor?.url) {
      const fileUrl = toolEvent.detail.textEditor.url;
      const fileName = toolEvent.description || 'Generated File';
      
      // Extract file type
      let fileType = 'txt';
      if (fileUrl.includes('.csv') || fileName.includes('.csv')) fileType = 'csv';
      else if (fileUrl.includes('.md') || fileName.includes('.md')) fileType = 'md';
      else if (fileUrl.includes('.json') || fileName.includes('.json')) fileType = 'json';
      
      const fileInfo = {
        url: fileUrl,
        type: fileType,
        description: fileName,
        timestamp: Date.now()
      };

      // Check for duplicates
      if (!this.fileUrls.some(f => f.url === fileUrl)) {
        this.fileUrls.push(fileInfo);
        this.sendProgress('estimating', 80, `Generated ${fileType.toUpperCase()} file: ${fileName}`);
        
        // Auto-download immediately
        setTimeout(() => this.downloadFile(fileInfo), 1000);
      }
    }
  }

  scanForFileUrls(args) {
    const dataStr = JSON.stringify(args);
    const urlMatches = dataStr.match(/https:\/\/private-us-east-1\.manuscdn\.com\/sessionFile\/[^"]+/g);
    
    if (urlMatches) {
      urlMatches.forEach(url => {
        if (!this.fileUrls.some(f => f.url === url)) {
          let fileType = 'file';
          if (url.includes('.csv')) fileType = 'csv';
          else if (url.includes('.md')) fileType = 'md';
          else if (url.includes('.json')) fileType = 'json';
          
          const fileInfo = {
            url: url,
            type: fileType,
            description: `Generated ${fileType} file`,
            timestamp: Date.now()
          };
          
          this.fileUrls.push(fileInfo);
          setTimeout(() => this.downloadFile(fileInfo), 2000);
        }
      });
    }
  }

  async downloadFile(fileInfo) {
    try {
      const response = await axios.get(fileInfo.url, {
        headers: {
          'accept': '*/*',
          'origin': 'https://manus.im',
          'referer': 'https://manus.im/',
          'user-agent': this.headers['user-agent']
        },
        timeout: 30000
      });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
      const fileName = `takeoff_${timestamp}_${this.sessionId.substring(0, 8)}.${fileInfo.type}`;
      
      // Save to temp directory
      const tempDir = path.join(process.cwd(), 'tmp', 'takeoffs', this.sessionId);
      if (!existsSync(tempDir)) {
        await mkdir(tempDir, { recursive: true });
      }
      
      const filePath = path.join(tempDir, fileName);
      await writeFile(filePath, response.data);
      
      const downloadInfo = {
        fileName,
        filePath,
        fileSize: response.data.length,
        type: fileInfo.type,
        description: fileInfo.description,
        downloadUrl: `/api/download/${this.sessionId}/${fileName}`
      };
      
      this.downloadedFiles.push(downloadInfo);
      this.sendProgress('estimating', 85 + (this.downloadedFiles.length * 5), 
        `Downloaded ${fileInfo.type.toUpperCase()} file`, { 
          fileName,
          fileSize: response.data.length 
        });
      
      return downloadInfo;
      
    } catch (error) {
      console.error(`Download failed for ${fileInfo.type}: ${error.message}`);
      return null;
    }
  }

  async waitForCompletionAndFiles() {
    return new Promise<void>(resolve => {
      const startTime = Date.now();
      const maxWaitTime = 1200000; // 20 minutes for enhanced processing
      
      const checkStatus = () => {
        const elapsed = Date.now() - startTime;
        
        // Send periodic progress updates
        if (elapsed > 600000) { // After 10 minutes
          this.sendProgress('estimating', 85, 'AI still processing comprehensive data extraction...');
        } else if (elapsed > 300000) { // After 5 minutes  
          this.sendProgress('detecting', 75, 'AI performing detailed material analysis...');
        }
        
        if (elapsed >= maxWaitTime) {
          this.sendProgress('estimating', 95, 'Processing timeout reached - delivering available results');
          resolve();
          return;
        }
        
        // More robust completion detection - wait for CSV file specifically
        const hasCsvFile = this.downloadedFiles.some(file => file.type === 'csv') || 
                          this.fileUrls.some(file => file.type === 'csv');
        
        if (this.aiComplete && hasCsvFile) {
          // Wait extra time for all files to be generated and downloaded
          setTimeout(() => {
            this.sendProgress('estimating', 100, 'Processing completed successfully');
            resolve();
          }, 8000); // Wait for file downloads to complete
          return;
        }
        
        // Fallback: if AI is complete and we have any files after extended time
        if (this.aiComplete && this.fileUrls.length > 0 && elapsed > 900000) { // After 15 minutes
          setTimeout(() => {
            this.sendProgress('estimating', 100, 'Processing completed with available files');
            resolve();
          }, 3000);
          return;
        }
        
        // Check more frequently for better responsiveness
        setTimeout(checkStatus, 3000);
      };
      
      // Start checking after initial setup
      setTimeout(checkStatus, 8000);
    });
  }

  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  let automationService: ManusAutomationService | null = null;

  const stream = new ReadableStream({
    start(controller) {
      automationService = new ManusAutomationService();
      
      // Set up progress callback for Server-Sent Events
      automationService.setProgressCallback((progress) => {
        const data = `data: ${JSON.stringify(progress)}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      // Process the request
      processRequest(request, automationService, controller, encoder);
    },
    
    cancel() {
      if (automationService) {
        automationService.cleanup();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function processRequest(
  request: NextRequest, 
  service: ManusAutomationService, 
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const propertyName = formData.get('propertyName') as string;
    const scope = formData.get('scope') as string;
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    // Convert files to buffers
    const fileBuffers = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        buffer: Buffer.from(await file.arrayBuffer()),
        contentType: file.type || 'application/pdf'
      }))
    );

         // Enhanced Construction Data Extraction Prompt (Version 2.0)
     const prompt = `Enhanced Construction Data Extraction Prompt (Version 2.0)
CRITICAL DIRECTIVE: You are Manus, an AI agent tasked with performing a forensic-level extraction of all data from the provided construction documents. Your primary directive is 100% accuracy and 100% completeness of all specified information. The output will be used for detailed cost estimation, where every single specified material, no matter how small, is critical. Failure to extract a specified item is a critical error.
CORE PRINCIPLES
ABSOLUTE ACCURACY: Every piece of data extracted must be a direct, verifiable transcription from the source documents. There is zero tolerance for estimation, assumption, or fabrication.
TOTAL COMPLETENESS: You must identify and extract every single specified item. This includes materials, fixtures, fasteners, adhesives, finishes, and any item with a manufacturer, model number, or specific description. If it's on the drawings, it must be in the output.
FORENSIC TRACEABILITY: Every extracted data point must be meticulously referenced to its exact source (Page, Drawing Title, and specific location like a note, table, or detail callout).
SYSTEMATIC EXTRACTION METHODOLOGY
PHASE 1: DEEP DOCUMENT ANALYSIS & INDEXING
Before any data extraction, perform and present a full analysis of the document set.
Comprehensive Document Inventory:
List every page number and its corresponding Drawing Title.
For each page, identify and list all distinct sections present (e.g., "Floor Plan," "Elevations," "Details," "Schedules," "General Notes," "Demolition Notes," "Keyed Notes").
Material & Specification Keyword Scan:
Perform a scan of all text across all documents to identify keywords related to materials, manufacturers, model numbers, and specifications (e.g., "Laticrete," "Benjamin Moore," "Bottega," "UL U419," "ASTM," "GFCI," "wood blocking," "acoustical sealant"). This is to ensure no specified item is overlooked during the detailed extraction phase.
Cross-Reference Mapping:
Identify all detail callouts, section cuts, and elevation tags. Map them from the parent plan to the child drawing to establish a clear relational link for verification (e.g., "Detail 9/A-500 is called out on Kitchen Elevation 3/A-200").
PHASE 2: MULTI-PASS DATA EXTRACTION
You will perform a multi-pass extraction to ensure no data is missed.
PASS 1: SCHEDULE & TABLE EXTRACTION
Extract every row and column from every schedule and table present (e.g., Finishes, Appliances, Plumbing, Millwork, Window, Drawing List). This is the foundational data set.
PASS 2: ANNOTATION & KEYED NOTE EXTRACTION
Go through every page, one by one. Transcribe every single keyed note, general note, demolition note, and any other annotation present on the drawings. Link these notes to the items they describe on the plans.
PASS 3: VISUAL & DETAIL EXTRACTION
Scrutinize all plans, elevations, sections, and details. Extract all items that are visually represented and labeled but may not appear in a schedule. This is critical for capturing items like:
Sub-components: Sealants, membranes (e.g., "Laticrete 9235 Waterproofing Membrane"), insulation (e.g., "Roxul AFB Insulation"), fasteners, substrates (e.g., "5/8" cement board"), and structural members (e.g., "3 5/8" MTL. STUDS 22 GA.").
Implicit Materials: If a detail shows a specific assembly (e.g., "UL U419 Partition"), extract all components that make up that assembly as described in the detail.
Labor-Related Items: Identify all notes that imply a specific action or labor cost, such as "REMOVE," "RELOCATE," "RE-INSTALL," "PROTECT/SALVAGE," "SKIM, SAND AND PAINT," or "VERIFY IN FIELD (V.I.F.)."
PHASE 3: VERIFICATION & CONSOLIDATION
Data Consolidation: Merge the data from all three passes. For example, the "Panasonic FV0511VKS3S" exhaust fan mentioned in the Appliance Schedule (Pass 1) should be linked to the keyed note on the Construction Plan that calls for its installation (Pass 2).
Discrepancy Report: Actively search for and report any discrepancies. For instance, "Appliance schedule lists dishwasher as Miele, but a note on the plan points to a different brand." If none are found, state "No discrepancies were identified."
Completeness Checklist: Before finalizing, re-check against the initial keyword scan. Has every identified material and manufacturer been extracted and categorized?
OUTPUT REQUIREMENTS
The final output must be structured, comprehensive, and easy to use.
Executive Summary: Brief overview of the project and a summary of the extraction's scope and findings.
Source Document Index: The complete inventory of all pages and their contents, as detailed in Phase 1.
Master Bill of Materials & Actions: This is the primary deliverable. Organize all extracted data into a single, detailed table with the following columns:
Category: (e.g., Finishes, Appliances, Plumbing, Electrical, Framing, Demolition, Millwork, Waterproofing, Insulation).
Item/Action: (e.g., "Paint," "Dishwasher," "Toilet," "Exhaust Fan," "GFCI Outlet," "Metal Stud Wall," "Remove Kitchen Cabinetry").
Specification/Description: A detailed description. For a material, this includes color, finish, size, etc. (e.g., "Super White / Matte"). For an action, it describes the task (e.g., "Remove and cap plumbing as required").
Manufacturer: (e.g., "Benjamin Moore," "Miele," "Toto"). State "EXISTING" or "NOT SPECIFIED" if applicable.
Model #: (e.g., "G5482SCVI," "MS624124CEFG 01").
Quantity: ONLY if explicitly stated in the documents. Otherwise, leave this field as "NOT SPECIFIED."
Unit: (e.g., "EA," "SF," "LF").
Source Page(s): List all pages where this item is mentioned (e.g., "A-110.00, A-600.00").
Source Location(s): Pinpoint the exact location(s) (e.g., "Finishes Materials List," "Appliance Schedule," "Construction Key Note #35").
Missing Information Report: Explicitly list any information that a cost estimator would typically need but is not present in the documents (e.g., "No comprehensive door schedule was provided," "No quantities for bulk materials like paint or drywall are specified"). This manages expectations for the end-user.
Mainly i'd want one final csv that has everything , this is really important.

Property: ${propertyName}
Scope: ${scope}`;

    service.sendProgress('uploading', 0, 'Starting takeoff processing...');

    // Phase 1: Agent Mode
    await service.activateAgentMode();
    
    // Phase 2: File Upload
    await service.uploadFiles(fileBuffers);
    
         // Phase 3: CDN Propagation
     service.sendProgress('reading', 25, 'Preparing documents for AI analysis...');
     await new Promise<void>(resolve => setTimeout(resolve, 3000));

    // Phase 4: AI Processing & File Capture
    await service.connectAndProcess(prompt);

    // Phase 5: Final Results
    const result = {
      success: true,
      sessionId: service.sessionId,
      filesDownloaded: service.downloadedFiles.length,
      files: service.downloadedFiles,
      summary: {
        totalFiles: service.downloadedFiles.length,
        responseLength: service.responseBuffer.length,
        processingTime: Date.now()
      }
    };

    // Send final success message
    const successData = `data: ${JSON.stringify({
      stage: 'complete',
      progress: 100,
      message: 'Takeoff processing completed successfully!',
      result,
      timestamp: Date.now()
    })}\n\n`;
    
    controller.enqueue(encoder.encode(successData));
    controller.close();

  } catch (error) {
    console.error('Takeoff processing failed:', error);
    
    const errorData = `data: ${JSON.stringify({
      stage: 'error',
      progress: 0,
      message: `Processing failed: ${error.message}`,
      error: error.message,
      timestamp: Date.now()
    })}\n\n`;
    
    controller.enqueue(encoder.encode(errorData));
    controller.close();
  } finally {
    if (service) {
      service.cleanup();
    }
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Planza Takeoff Processing API',
    timestamp: new Date().toISOString()
  })
} 