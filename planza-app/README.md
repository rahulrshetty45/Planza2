# 🏗️ Planza - AI-Powered Construction Takeoff Platform

A modern web application that automates construction document analysis and takeoff generation using AI, built with Next.js and integrated with Manus AI.

## ✨ Features

- **📄 Multi-file Upload**: Support for PDF, XLSX, and CSV files up to 250MB
- **🤖 AI-Powered Analysis**: Automated construction document processing using Manus AI
- **📊 Comprehensive Takeoffs**: Generate detailed CSV files with quantities, costs, and specifications
- **📋 Analysis Reports**: Create markdown reports with project summaries and recommendations
- **🎯 Real-time Processing**: Live status updates during AI analysis
- **💾 Instant Downloads**: Automatic file generation and download capabilities
- **🎨 Pixel-Perfect UI**: Designed to match Figma specifications exactly

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Manus AI account with API access

### 1. Clone and Setup

```bash
# Navigate to the app directory
cd planza-app

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### 2. Configure Environment

Edit `.env.local` with your configuration:

```env
# Manus AI Configuration
MANUS_JWT_TOKEN=your_manus_jwt_token_here
MANUS_CLIENT_ID=your_client_id_here
MANUS_USER_ID=your_user_id_here

# App Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Setup Manus AI Integration

Make sure the following files are in your project root (parent directory):
- `complete_manus_automation_final.js`
- `multi_file_automation.js` 

These contain the AI automation scripts that power the document processing.

### 4. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build && npm start
```

Visit `http://localhost:3000` to access the application.

## 🏗️ Architecture

### Frontend (Next.js + React)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom Figma-based design system
- **File Upload**: React Dropzone for drag-and-drop functionality
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks for local state

### Backend (Next.js API Routes)
- **File Processing**: Handles multi-file uploads and temporary storage
- **AI Integration**: Interfaces with Manus AI automation scripts
- **Download Service**: Secure file serving with proper content types
- **Error Handling**: Comprehensive error management and logging

### AI Processing (Manus AI)
- **Single File**: Uses `CompleteManusAutomation` for individual documents
- **Multi-file**: Uses `MultiFileManusAutomation` for batch processing
- **WebSocket Monitoring**: Real-time progress tracking
- **Auto-download**: Automatic capture of generated files

## 📋 API Reference

### Process Takeoff
```typescript
POST /api/process-takeoff

FormData:
- propertyName: string
- scope?: string  
- files: File[]

Response:
{
  success: boolean
  sessionId: string
  generatedFiles: Array<{
    name: string
    type: string
    size: number
    downloadUrl: string
  }>
}
```

### Download Files
```typescript
GET /api/download/[sessionId]/[filename]

Response: File download with appropriate headers
```

## 🎨 Design System

The application uses a custom design system based on the Figma specifications:

### Colors
- **Background**: `rgb(242, 246, 249)` - Light blue-gray
- **Text**: `rgb(85, 85, 85)` - Dark gray
- **Border**: `rgb(238, 238, 238)` - Light border
- **Primary**: `rgb(79, 172, 254)` - Blue accent
- **Success**: `rgb(34, 197, 94)` - Green
- **Warning**: `rgb(251, 146, 60)` - Orange

### Typography
- **Font Family**: Inter (fallback to system fonts)
- **Base Size**: 14px with 14px line height
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- **Component Padding**: 7px (exact Figma specification)
- **Item Spacing**: 6px between elements
- **Border Radius**: 4px for cards and buttons

## 📝 Usage Workflow

1. **Enter Property Name**: Provide a descriptive name for the project
2. **Upload Documents**: Drag & drop or select PDF/XLSX construction documents
3. **Specify Scope** (Optional): Add custom scope requirements or use sample categories
4. **Process Documents**: Click "Add Takeoff" to start AI analysis
5. **Monitor Progress**: Watch real-time status updates during processing
6. **Download Results**: Access generated CSV and markdown files immediately

## 🔧 Development

### Project Structure
```
planza-app/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Main interface
│   └── components/        # Reusable components (future)
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── postcss.config.js      # PostCSS configuration
└── package.json           # Dependencies
```

### Key Components

- **Main Interface** (`page.tsx`): Complete takeoff creation interface
- **File Upload**: Drag-and-drop with preview and validation
- **Processing Status**: Real-time AI progress tracking
- **Results Display**: Generated file preview and download
- **Sample Scope**: Interactive category examples

### Customization

The design system is fully customizable through `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'planza-bg': 'rgb(242, 246, 249)',
      'planza-gray': 'rgb(85, 85, 85)',
      // ... more colors
    }
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker
```bash
# Build image
docker build -t planza-app .

# Run container
docker run -p 3000:3000 planza-app
```

### Environment Variables for Production
- `MANUS_JWT_TOKEN`: Your Manus AI authentication token
- `MANUS_CLIENT_ID`: Manus AI client identifier
- `NEXT_PUBLIC_API_URL`: Full URL to your API endpoints

## 🔍 Troubleshooting

### Common Issues

**File Upload Fails**
- Check file size limits (250MB max)
- Ensure supported file types (PDF, XLSX, CSV)
- Verify temporary directory permissions

**AI Processing Errors**
- Validate Manus AI credentials
- Check automation scripts are present
- Monitor API rate limits

**Download Issues**
- Ensure files exist in temporary directory
- Check file path security restrictions
- Verify content-type headers

### Debug Mode

Enable verbose logging by setting environment variable:
```env
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Manus AI** for the powerful document processing capabilities
- **Figma Community** for the design inspiration and specifications
- **Next.js Team** for the excellent React framework
- **Tailwind CSS** for the utility-first styling approach

---

**Built with ❤️ for construction professionals who want to automate their takeoff process and focus on what matters most - building amazing projects.** 