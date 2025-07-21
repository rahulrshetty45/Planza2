const axios = require('axios');
const io = require('socket.io-client');
const fs = require('fs');

// 🚀 MULTI-FILE MANUS AI AUTOMATION
// Modified version to support multiple PDF uploads in one request

const CONFIG = {
  JWT_TOKEN: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIyNTc4Y2NhOWQ4YmI0Y2IwYThjNTUzMjFmMDQ5NmFiOCIsImlhdCI6MTc1MzAxODQzMywidXNlcl9pZCI6IjMxMDUxOTY2MzA3Njk1NjI1MyIsIm5hbWUiOiJCZW5qYW1pbiBJYW4gQ2hlbiIsImVtYWlsIjoiaW5mb0Bib3VsZXZhcmRsZWdhY3kuY29tIiwiZ2l2ZW5fbmFtZSI6bnVsbCwiZmFtaWx5X25hbWUiOm51bGwsIm5pY2tuYW1lIjoiQmVuamFtaW4gSWFuIENoZW4iLCJhdmF0YXIiOiIifQ.rtfdpJ9i09-aq7KLB6e-SGTqQIUEu7Ak1aB6pxIN1JI",
  CLIENT_ID: "A4v1WaH0OgLagMi1tJypFM",
  USER_ID: "310519663076956253"
};

class MultiFileManusAutomation {
  constructor(pdfPaths, prompt, options = {}) {
    this.pdfPaths = Array.isArray(pdfPaths) ? pdfPaths : [pdfPaths];
    this.prompt = prompt;
    this.options = {
      waitTime: options.waitTime || 300000, // 5 minutes default
      downloadPath: options.downloadPath || './',
      verbose: options.verbose !== false,
      saveCapture: options.saveCapture || false
    };
    
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
    this.rawMessages = [];
    this.uploadedFiles = [];
  }

  log(message, level = 'info') {
    if (!this.options.verbose && level === 'debug') return;
    
    const timestamp = new Date().toISOString().substring(11, 19);
    const prefix = {
      'info': '✅',
      'error': '❌',
      'debug': '🔍',
      'success': '🎉',
      'process': '🔄'
    }[level] || 'ℹ️';
    
    console.log(`${timestamp} ${prefix} ${message}`);
  }

  async activateAgentMode() {
    this.log("Activating Agent Mode...", 'process');
    
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

      this.log("Agent Mode activated successfully");
      return true;
    } catch (error) {
      this.log(`Agent Mode activation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async uploadMultipleFiles() {
    this.log(`Starting upload of ${this.pdfPaths.length} files...`, 'process');
    
    this.sessionId = this.generateId(22);
    this.log(`Created session: ${this.sessionId}`, 'debug');
    
    const uploadPromises = this.pdfPaths.map(async (pdfPath, index) => {
      this.log(`Uploading file ${index + 1}/${this.pdfPaths.length}: ${pdfPath.split('/').pop()}`, 'process');
      
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`File not found: ${pdfPath}`);
      }
      
      const fileBuffer = fs.readFileSync(pdfPath);
      const fileName = `manus-automation-${Date.now()}-${index}.pdf`;
      
      try {
        // Step 1: Get presigned upload URL
        const presignedResponse = await axios.post(
          'https://api.manus.im/api/chat/getPresignedUploadUrl',
          {
            filename: fileName,
            fileType: "application/pdf",
            fileSize: fileBuffer.length,
            sessionId: this.sessionId
          },
          { headers: this.headers }
        );

        const { uploadUrl, id: fileId } = presignedResponse.data.data;
        this.log(`Got presigned URL for file: ${fileName}`, 'debug');

        // Step 2: Upload to S3
        await axios.put(uploadUrl, fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            'Content-Length': fileBuffer.length.toString()
          }
        });

        this.log(`Uploaded ${(fileBuffer.length / 1024).toFixed(2)}KB to S3`, 'debug');

        // Step 3: Notify upload completion
        const completeResponse = await axios.post(
          'https://api.manus.im/api/chat/uploadComplete',
          { filename: fileName, fileSize: fileBuffer.length, id: fileId },
          { headers: this.headers }
        );

        const fileInfo = {
          signedCdnUrl: completeResponse.data.data.fileUrl,
          fileName,
          fileSize: fileBuffer.length,
          originalPath: pdfPath
        };
        
        this.log(`File ${index + 1} upload completed: ${fileName}`, 'success');
        return fileInfo;

      } catch (error) {
        this.log(`File upload failed for ${fileName}: ${error.message}`, 'error');
        throw error;
      }
    });
    
    this.uploadedFiles = await Promise.all(uploadPromises);
    this.log(`All ${this.uploadedFiles.length} files uploaded successfully!`, 'success');
    
    return this.uploadedFiles;
  }

  async connectAndProcess() {
    this.log("Connecting to WebSocket...", 'process');

    this.socket = io('wss://api.manus.im/', {
      query: {
        token: CONFIG.JWT_TOKEN,
        locale: 'en',
        tz: 'Asia/Calcutta',
        clientType: 'web'
      },
      transports: ['websocket'],
      forceNew: true
    });

    await new Promise(resolve => {
      this.socket.on('connect', () => {
        this.log("WebSocket connected successfully");
        resolve();
      });
    });

    // Setup enhanced message handlers
    this.setupWebSocketHandlers();

    // Create attachments array for all uploaded files
    const attachments = this.uploadedFiles.map((fileInfo, index) => ({
      filename: fileInfo.fileName,
      id: this.generateId(22),
      type: "file",
      url: fileInfo.signedCdnUrl,
      contentType: "application/pdf",
      contentLength: fileInfo.fileSize
    }));

    // Send the AI processing request with multiple attachments
    const message = {
      id: this.generateId(22),
      timestamp: Date.now(),
      messageStatus: "pending",
      type: "user_message",
      sessionId: this.sessionId,
      content: this.prompt,
      taskMode: "agent",
      attachments: attachments, // Multiple files!
      extData: { mode: "lite" },
      countryIsoCode: "IN"
    };

    this.socket.emit("message", message);
    this.log(`AI processing request sent with ${attachments.length} files`, 'process');
    this.log(`Files included: ${this.uploadedFiles.map(f => f.fileName).join(', ')}`, 'debug');
    this.log(`Monitoring for ${this.options.waitTime/1000} seconds...`, 'debug');

    // Wait for completion with file capture
    return this.waitForCompletionAndFiles();
  }

  setupWebSocketHandlers() {
    this.socket.onAny((eventName, ...args) => {
      // Store raw messages if capture is enabled
      if (this.options.saveCapture) {
        this.rawMessages.push({
          timestamp: Date.now(),
          eventName,
          args: args,
          raw: JSON.stringify(args, null, 2)
        });
      }

      // Handle different event types
      if (eventName === 'message' && args[0]) {
        const data = args[0];
        this.handleMessage(data);
      }

      // Handle any other event types that might contain file URLs
      this.scanForFileUrls(args);
    });
  }

  handleMessage(data) {
    // Handle chat responses
    if (data?.event?.type === 'chat' && data?.event?.sender === 'assistant') {
      const content = data.event.content;
      this.responseBuffer += content;
      this.log(`AI Response: ${content.substring(0, 100)}...`, 'debug');
    }
    
    // Handle live status updates
    if (data?.event?.type === 'liveStatus') {
      const status = data.event.text;
      this.log(`Status: ${status}`, 'debug');
      
      if (status?.includes('Creating file') || status?.includes('Editing file')) {
        this.log("File creation activity detected!", 'info');
      }
    }
    
    // Handle status updates and completion detection
    if (data?.event?.type === 'statusUpdate') {
      const status = data.event.brief || data.event.text;
      this.log(`Update: ${status}`, 'debug');
      
      if (status?.includes('finished working') || status?.includes('stopped')) {
        this.log("AI processing completed!", 'success');
        this.aiComplete = true;
      }
    }

    // CRITICAL: Handle tool usage events (where file URLs are found)
    if (data?.event?.type === 'toolUsed' && data?.event?.status === 'success') {
      this.handleToolUsed(data.event);
    }
  }

  handleToolUsed(toolEvent) {
    // This is where we find the file URLs!
    if (toolEvent?.detail?.textEditor?.url) {
      const fileUrl = toolEvent.detail.textEditor.url;
      const fileName = toolEvent.description || 'Generated File';
      
      // Extract file type from URL or description
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
        this.log(`New ${fileType.toUpperCase()} file detected: ${fileName}`, 'success');
        
        // Auto-download immediately
        setTimeout(() => this.downloadFile(fileInfo), 1000);
      }
    }
  }

  scanForFileUrls(args) {
    // Additional scan for any URLs in the data
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
            description: `Detected ${fileType} file`,
            timestamp: Date.now()
          };
          
          this.fileUrls.push(fileInfo);
          this.log(`Detected ${fileType.toUpperCase()} file from scan`, 'info');
          
          // Auto-download
          setTimeout(() => this.downloadFile(fileInfo), 2000);
        }
      });
    }
  }

  async downloadFile(fileInfo) {
    this.log(`Downloading ${fileInfo.type.toUpperCase()}: ${fileInfo.description}`, 'process');
    
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
      const fileName = `manus_multifile_${timestamp}_${this.sessionId.substring(0, 8)}.${fileInfo.type}`;
      const filePath = this.options.downloadPath + fileName;
      
      fs.writeFileSync(filePath, response.data);
      
      const fileSize = response.data.length;
      this.log(`Downloaded: ${fileName} (${fileSize.toLocaleString()} bytes)`, 'success');
      
      // Log file content preview
      if (typeof response.data === 'string' && fileSize > 0) {
        const lines = response.data.split('\n').length - 1;
        this.log(`File contains ${lines} lines`, 'debug');
        
        if (fileInfo.type === 'csv' && response.data.includes(',')) {
          const firstLine = response.data.split('\n')[0];
          const columns = firstLine.split(',').length;
          this.log(`CSV: ${lines} rows, ${columns} columns`, 'info');
        }
      }
      
      this.downloadedFiles.push({
        fileName,
        filePath,
        fileSize,
        type: fileInfo.type,
        description: fileInfo.description
      });
      
      return fileName;
      
    } catch (error) {
      this.log(`Download failed for ${fileInfo.type}: ${error.message}`, 'error');
      return null;
    }
  }

  async waitForCompletionAndFiles() {
    this.log("Waiting for AI completion and file generation...", 'process');
    
    return new Promise(resolve => {
      const startTime = Date.now();
      
      const checkStatus = () => {
        const elapsed = Date.now() - startTime;
        
        // Check if we should continue waiting
        if (elapsed >= this.options.waitTime) {
          this.log("Wait time reached - finishing with current results", 'info');
          resolve();
          return;
        }
        
        // Check if AI is complete and we have files
        if (this.aiComplete && this.fileUrls.length > 0) {
          // Wait a bit more for any final files
          setTimeout(() => {
            this.log("AI complete and files captured - finishing", 'success');
            resolve();
          }, 5000);
          return;
        }
        
        // Continue waiting
        setTimeout(checkStatus, 2000);
      };
      
      // Start checking after initial delay
      setTimeout(checkStatus, 5000);
    });
  }

  generateId(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('🎉 MULTI-FILE MANUS AI AUTOMATION COMPLETE');
    console.log('='.repeat(70));
    console.log(`📋 Session ID: ${this.sessionId}`);
    console.log(`📁 Input Files: ${this.uploadedFiles.length}`);
    this.uploadedFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.originalPath.split('/').pop()} (${(file.fileSize/1024).toFixed(2)}KB)`);
    });
    console.log(`📄 Response Length: ${this.responseBuffer.length.toLocaleString()} characters`);
    console.log(`📁 Files Detected: ${this.fileUrls.length}`);
    console.log(`📥 Files Downloaded: ${this.downloadedFiles.length}`);
    
    if (this.downloadedFiles.length > 0) {
      console.log('\n📁 Downloaded Files:');
      this.downloadedFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.fileName} (${file.type.toUpperCase()}) - ${file.fileSize.toLocaleString()} bytes`);
      });
    }
    
    // Save AI response
    const responseFile = `manus_multifile_response_${this.sessionId.substring(0, 8)}.txt`;
    if (this.responseBuffer.length > 0) {
      fs.writeFileSync(responseFile, this.responseBuffer);
      console.log(`\n💾 AI Response saved: ${responseFile}`);
    }
    
    console.log('\n🚀 Multi-file automation cycle completed successfully!');
    console.log('='.repeat(70) + '\n');
  }

  async run() {
    const startTime = Date.now();
    
    console.log('🚀 STARTING MULTI-FILE MANUS AI AUTOMATION');
    console.log('==========================================');
    console.log(`📁 Files (${this.pdfPaths.length}):`);
    this.pdfPaths.forEach((path, index) => {
      console.log(`   ${index + 1}. ${path.split('/').pop()}`);
    });
    console.log(`📋 Prompt: ${this.prompt.substring(0, 100)}...`);
    console.log(`⏱️ Wait Time: ${this.options.waitTime/1000} seconds`);
    console.log('==========================================\n');

    try {
      // Phase 1: Agent Mode
      await this.activateAgentMode();
      
      // Phase 2: Multiple File Upload
      await this.uploadMultipleFiles();
      
      // Phase 3: CDN Propagation
      this.log("Waiting for CDN propagation...", 'debug');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Phase 4: AI Processing & File Capture
      await this.connectAndProcess();

      // Phase 5: Cleanup & Summary
      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      this.printSummary();
      
      console.log(`⏱️ Total execution time: ${totalTime} seconds`);
      
      return {
        success: true,
        sessionId: this.sessionId,
        inputFiles: this.uploadedFiles.length,
        filesDownloaded: this.downloadedFiles.length,
        responseLength: this.responseBuffer.length,
        executionTime: totalTime
      };

    } catch (error) {
      this.log(`Automation failed: ${error.message}`, 'error');
      console.error('\n💥 Full error details:', error.stack);
      
      return {
        success: false,
        error: error.message,
        sessionId: this.sessionId
      };
    } finally {
      if (this.socket) {
        this.socket.disconnect();
        this.log("WebSocket disconnected", 'debug');
      }
    }
  }
}

// Test with multiple files
async function main() {
  const files = [
    "/Users/rahullabterminal/Planza/2406 130 BARROW ST APT 215_FREDRICKS ISSUE FOR BID.pdf",
    "/Users/rahullabterminal/Planza/UEG Quotation for 130 Barrow st #215 - Finish materials.pdf"
  ];
  
  const prompt = "Analyze both documents and create a comprehensive CSV combining construction specifications from the first document and material costs from the second document. Include columns: Item, Location, Specification, Material_Type, Unit_Cost, Total_Cost where available. Generate at least 20 rows combining data from both documents.";
  
  const automation = new MultiFileManusAutomation(files, prompt, {
    waitTime: 360000, // 6 minutes for more complex processing
    verbose: true,
    saveCapture: false
  });
  
  const result = await automation.run();
  
  if (result.success) {
    console.log('✅ Multi-file automation completed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Multi-file automation failed!');
    process.exit(1);
  }
}

// Export for use as module
module.exports = MultiFileManusAutomation;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 