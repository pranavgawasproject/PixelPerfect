# 🎨 PixelPerfect - The Image Compliance Tool

A powerful, privacy-focused web application for resizing and compressing images to meet exact document and application requirements. All processing happens locally in your browser - your images never leave your device!

![PixelPerfect](https://img.shields.io/badge/Version-1.0.0-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-7.1.9-purple?style=for-the-badge&logo=vite)

## ✨ Features

### 🔧 Core Functionality
- **📐 Image Resizing** - Resize images to exact pixel dimensions
- **🗜️ Smart Compression** - Compress images to target file sizes
- **🔒 Aspect Ratio Lock** - Maintain image proportions when resizing
- **🎯 Quality Control** - Manual quality adjustment (1-100%)

### 📁 Format Support
- **JPEG** - Perfect for photos and complex images
- **PNG** - Best for images with transparency
- **WebP** - Modern format with superior compression

### ⚡ Quick Presets
Pre-configured settings for common use cases:
- 📸 **Passport Photo** - 413×531px, <50KB
- 👤 **Social Media Profile** - 400×400px, <100KB
- 📧 **Email Attachment** - 800×600px, <100KB
- 💬 **WhatsApp Share** - 1024×768px, <500KB
- 🎬 **HD Image** - 1920×1080px, <1000KB

### 🎨 User Experience
- **🌙 Dark Mode** - Easy on the eyes
- **📊 Before/After Comparison** - Side-by-side preview
- **📈 Compression Analytics** - See size reduction percentage
- **🎯 Progress Indicator** - Real-time processing feedback
- **⌨️ Keyboard Shortcuts** - Work faster
  - `Ctrl/Cmd + V` - Paste image from clipboard
  - `Enter` - Process image
  - `Ctrl/Cmd + S` - Download processed image

### 🔐 Privacy & Security
- **100% Client-Side Processing** - Images never uploaded to servers
- **No Data Collection** - Your privacy is guaranteed
- **Secure** - All processing happens in your browser

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📖 How to Use

### Basic Workflow
1. **Upload** - Drag & drop or click to select an image
2. **Choose Mode** - Select Resize or Compress
3. **Adjust Settings** - Set dimensions, quality, or file size limits
4. **Process** - Click the "Process Image" button
5. **Compare** - View before/after comparison
6. **Download** - Save your optimized image

### Using Presets
1. Upload an image
2. Click on any preset button (Passport Photo, Social Media, etc.)
3. Click "Process Image"
4. Download your perfectly sized image

### Advanced Features
- **Aspect Ratio Lock**: Check the lock icon to maintain proportions
- **Format Selection**: Choose JPEG, PNG, or WebP output
- **Quality Slider**: Fine-tune compression quality (Resize mode)
- **Target Size**: Set exact file size limits (Compress mode)

## 🛠️ Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **HTML5 Canvas** - Image processing
- **FileReader API** - Local file handling

## 📊 Use Cases

### Personal
- Resize photos for social media profiles
- Compress images for email attachments
- Create passport/ID photos
- Optimize images for WhatsApp

### Professional
- Prepare images for job applications
- Resize graphics for presentations
- Compress screenshots for documentation
- Format images for web upload

### Educational
- Prepare assignment submissions
- Resize images for online forms
- Compress portfolio images
- Format photos for student IDs

## 💡 Tips & Tricks

1. **Best Quality**: Use PNG for images with text or sharp edges
2. **Smallest Size**: Use JPEG at 70-85% quality for photos
3. **Modern Browsers**: Use WebP for best compression with good quality
4. **Aspect Ratio**: Keep it locked for professional-looking results
5. **Compression**: Start with 80% quality and adjust as needed

---

Made with ❤️ by Pranav Gawas

**Remember: All processing is done locally in your browser. Your privacy is our priority! 🔒**
