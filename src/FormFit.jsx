import { useState, useRef, useEffect } from 'react';

const FormFit = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [originalFileName, setOriginalFileName] = useState('');
  const [currentMode, setCurrentMode] = useState('resize');
  const [showControlPanel, setShowControlPanel] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusClass, setStatusClass] = useState('');
  const [showStatus, setShowStatus] = useState(false);
  
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [kbLimit, setKbLimit] = useState(50);
  const [quality, setQuality] = useState(92);
  const [outputFormat, setOutputFormat] = useState('jpeg');
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [originalSize, setOriginalSize] = useState('-');
  const [finalSize, setFinalSize] = useState('-');
  const [processedImageUrl, setProcessedImageUrl] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [compressionRatio, setCompressionRatio] = useState('');
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const uploadZoneRef = useRef(null);

  // Presets - Enhanced for Banking & Competitive Exams
  const presets = {
    passport: { width: 413, height: 531, kb: 50, name: 'Passport Photo', icon: '🎫' },
    bankingExam: { width: 200, height: 230, kb: 50, name: 'Banking Exam (IBPS/SBI)', icon: '🏦' },
    upsc: { width: 300, height: 400, kb: 40, name: 'UPSC/Civil Services', icon: '📜' },
    ssc: { width: 300, height: 300, kb: 50, name: 'SSC/Railway Exam', icon: '🚂' },
    profile: { width: 400, height: 400, kb: 100, name: 'Social Media Profile', icon: '👤' },
    email: { width: 800, height: 600, kb: 100, name: 'Email Attachment', icon: '✉️' },
    whatsapp: { width: 1024, height: 768, kb: 500, name: 'WhatsApp Share', icon: '💬' },
    hd: { width: 1920, height: 1080, kb: 1000, name: 'HD Image', icon: '🎬' },
  };

  const bytesToKB = (bytes) => (bytes / 1024).toFixed(2) + ' KB';

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Ctrl/Cmd + V to paste image
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        navigator.clipboard.read().then(items => {
          for (let item of items) {
            for (let type of item.types) {
              if (type.startsWith('image/')) {
                item.getType(type).then(blob => {
                  const file = new File([blob], 'pasted-image.png', { type });
                  handleFile(file);
                });
              }
            }
          }
        }).catch(() => {});
      }
      // Enter to process
      if (e.key === 'Enter' && uploadedImage && !processing) {
        processImage();
      }
      // Ctrl/Cmd + S to download
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && processedImageUrl) {
        e.preventDefault();
        downloadImage();
      }
    };
    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [uploadedImage, processing, processedImageUrl]);

  const applyPreset = (presetKey) => {
    const preset = presets[presetKey];
    setWidth(preset.width);
    setHeight(preset.height);
    setKbLimit(preset.kb);
    setCurrentMode('compress');
    displayStatus(`Preset applied: ${preset.name}`, 'bg-blue-50 border-blue-200 text-blue-700');
  };

  const displayStatus = (message, classes) => {
    setStatusMessage(message);
    setStatusClass(classes);
    setShowStatus(true);
  };

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      displayStatus('Error: Please upload a valid image file (JPEG, PNG, etc.).', 'bg-red-50 border-red-200 text-red-700');
      return;
    }

    setOriginalFileName(file.name);
    setShowControlPanel(true);
    setShowResults(false);
    displayStatus('Image uploaded. Select processing options and click "Process Image".', 'bg-blue-50 border-blue-200 text-blue-700');

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setUploadedImage(img);
        setOriginalImageUrl(e.target.result);
        setOriginalSize(bytesToKB(file.size));
        const ratio = img.naturalWidth / img.naturalHeight;
        setAspectRatio(ratio);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    uploadZoneRef.current.classList.remove('border-emerald-500');
    
    if (e.dataTransfer.items) {
      if (e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].kind === 'file') {
        handleFile(e.dataTransfer.items[0].getAsFile());
      }
    } else if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = () => {
    uploadZoneRef.current.classList.add('border-emerald-500');
  };

  const handleDragLeave = () => {
    uploadZoneRef.current.classList.remove('border-emerald-500');
  };

  const handleModeChange = (mode) => {
    setCurrentMode(mode);
  };

  const handleWidthChange = (newWidth) => {
    setWidth(newWidth);
    if (aspectRatioLocked && aspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    if (aspectRatioLocked && aspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const getFormatMimeType = () => {
    switch(outputFormat) {
      case 'png': return 'image/png';
      case 'webp': return 'image/webp';
      default: return 'image/jpeg';
    }
  };

  const getFormatExtension = () => {
    return outputFormat === 'jpeg' ? 'jpg' : outputFormat;
  };

  const resizeImage = (targetWidth, targetHeight) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(uploadedImage, 0, 0, targetWidth, targetHeight);
    
    const qualityValue = quality / 100;
    const mimeType = getFormatMimeType();
    const processedDataUrl = canvas.toDataURL(mimeType, qualityValue);
    updateResults(processedDataUrl, `Resized to ${targetWidth}x${targetHeight}`);
  };

  const compressImage = async (kbLimit) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const maxBytes = kbLimit * 1024;
    const mimeType = getFormatMimeType();

    canvas.width = uploadedImage.naturalWidth;
    canvas.height = uploadedImage.naturalHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(uploadedImage, 0, 0);

    let lowQuality = 0.1;
    let highQuality = 1.0;
    let currentQuality = 0.8;
    let processedDataUrl = '';
    let attempts = 0;
    const maxAttempts = 15;

    displayStatus('Compressing... this may take a moment for large images.', 'bg-yellow-50 border-yellow-200 text-yellow-700');

    while (attempts < maxAttempts) {
      currentQuality = Math.max(lowQuality, Math.min(highQuality, currentQuality));
      
      setProgress(Math.round((attempts / maxAttempts) * 100));
      await new Promise(resolve => setTimeout(resolve, 50));
      
      processedDataUrl = canvas.toDataURL(mimeType, currentQuality);
      const currentSize = processedDataUrl.length * 0.75;

      if (currentSize <= maxBytes) {
        lowQuality = currentQuality;
      } else {
        highQuality = currentQuality;
      }

      const newQuality = (lowQuality + highQuality) / 2;

      if (Math.abs(currentQuality - newQuality) < 0.005 || currentQuality === lowQuality) {
        break;
      }
      
      currentQuality = newQuality;
      attempts++;
    }

    processedDataUrl = canvas.toDataURL(mimeType, lowQuality);
    setProgress(100);
    updateResults(processedDataUrl, `Compressed to max ${kbLimit} KB`);
  };

  const updateResults = (dataUrl, message) => {
    setProcessedImageUrl(dataUrl);
    
    const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
    const sizeInBytes = base64Length * 0.75;
    
    setFinalSize(bytesToKB(sizeInBytes));
    
    // Calculate compression ratio
    const origSizeNum = parseFloat(originalSize);
    const finalSizeNum = sizeInBytes / 1024;
    if (!isNaN(origSizeNum) && origSizeNum > 0) {
      const ratio = ((1 - finalSizeNum / origSizeNum) * 100).toFixed(1);
      setCompressionRatio(ratio);
    }
    
    setShowResults(true);
    setProcessing(false);
    setProgress(0);
    displayStatus(`Processing complete: ${message}`, 'bg-emerald-50 border-emerald-200 text-emerald-700');
  };

  const processImage = async () => {
    if (!uploadedImage) {
      displayStatus('Error: Please upload an image first.', 'bg-red-50 border-red-200 text-red-700');
      return;
    }

    setShowResults(false);
    setProcessing(true);
    setProgress(0);
    displayStatus('Processing image, please wait...', 'bg-yellow-50 border-yellow-200 text-yellow-700');

    try {
      if (currentMode === 'resize') {
        const targetWidth = parseInt(width);
        const targetHeight = parseInt(height);

        if (isNaN(targetWidth) || isNaN(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
          throw new Error("Invalid width or height specified.");
        }

        resizeImage(targetWidth, targetHeight);
        setProcessing(false);
      } else if (currentMode === 'compress') {
        const limit = parseFloat(kbLimit);

        if (isNaN(limit) || limit <= 0) {
          throw new Error("Invalid KB limit specified.");
        }

        await compressImage(limit);
      }
      
      setShowStatus(false);
    } catch (error) {
      console.error("Processing error:", error);
      setProcessing(false);
      setProgress(0);
      displayStatus(`Error during processing: ${error.message}`, 'bg-red-50 border-red-200 text-red-700');
    }
  };

  const downloadImage = () => {
    if (!processedImageUrl) {
      displayStatus('Error: No processed image available for download.', 'bg-red-50 border-red-200 text-red-700');
      return;
    }

    const link = document.createElement('a');
    const modeName = currentMode === 'resize' ? 'resized' : 'compressed';
    const cleanName = originalFileName.replace(/\.[^/.]+$/, "");
    const extension = getFormatExtension();
    link.download = `${cleanName}_${modeName}_PixelPerfect.${extension}`;
    link.href = processedImageUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`w-full max-w-6xl mt-4 rounded-2xl p-6 md:p-10 transition-all duration-300 ${darkMode ? 'glass-effect-dark' : 'glass-effect'}`}>
      {/* Header with Dark Mode Toggle */}
      <header className="text-center mb-8 relative">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute right-0 top-0 p-3 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12 ${darkMode ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg'}`}
          title="Toggle Dark Mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        
        {/* Animated Logo/Icon */}
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 p-4 rounded-full">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold gradient-text mb-2 tracking-tight">
          PixelPerfect
        </h1>
        <div className="inline-block">
          <p className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent mb-3">
            ✨ The Ultimate Image Tool ✨
          </p>
        </div>
        <p className={`text-base md:text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'} max-w-2xl mx-auto leading-relaxed`}>
          Resize and compress images with precision. Perfect for documents, social media, and professional applications.
        </p>
        <div className={`mt-4 inline-block px-4 py-2 rounded-full text-xs md:text-sm font-medium ${darkMode ? 'bg-purple-900/50 text-purple-200 border border-purple-500/50' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
          💡 Pro Tips: Ctrl+V to paste • Enter to process • Ctrl+S to download
        </div>
      </header>

      {/* Upload Area */}
      <div
        ref={uploadZoneRef}
        className={`group border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 transform hover:scale-[1.02] ${
          darkMode 
            ? 'border-purple-500/50 bg-gradient-to-br from-gray-800/50 to-gray-900/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/30' 
            : 'border-purple-300 bg-gradient-to-br from-white/80 to-purple-50/50 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-300/50'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current.click()}
      >
        <div className="relative">
          {/* Animated upload icon */}
          <div className="mb-4 inline-block relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className={`relative p-4 rounded-full transform group-hover:scale-110 transition-transform duration-300 ${
              darkMode ? 'bg-gradient-to-br from-purple-600 to-pink-600' : 'bg-gradient-to-br from-purple-500 to-pink-500'
            }`}>
              <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
          </div>
          
          <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
            Drag & Drop Your Image Here
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            or click to browse • Supports JPG, PNG, WebP
          </p>
          
          {originalFileName && (
            <div className="mt-4 inline-block">
              <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                darkMode 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
              }`}>
                ✓ {originalFileName}
              </div>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />
      </div>

      {/* Quick Presets */}
      {!showControlPanel && (
        <div className="mb-8">
          <h3 className={`text-2xl font-bold mb-5 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <span className="inline-block transform hover:scale-110 transition-transform">⚡</span> Quick Presets for Exams & Documents
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => {
                  if (uploadedImage) applyPreset(key);
                  else displayStatus('Please upload an image first', 'bg-yellow-50 border-yellow-200 text-yellow-700');
                }}
                disabled={!uploadedImage}
                className={`group relative p-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                  uploadedImage 
                    ? darkMode 
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-400/50 hover:shadow-2xl'
                    : darkMode
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                }`}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-2xl mb-1">{preset.icon}</div>
                  <div className="text-xs leading-tight">{preset.name}</div>
                </div>
              </button>
            ))}
          </div>
          
          {/* Trust Badge */}
          <div className={`mt-6 text-center p-4 rounded-xl ${darkMode ? 'bg-emerald-900/30 border border-emerald-700/50' : 'bg-emerald-50 border border-emerald-200'}`}>
            <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
              <span className="text-2xl">🔒</span>
              <span>100% Private - Your photos never leave your device</span>
            </div>
            <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Perfect for Banking Exams (IBPS, SBI, RBI) • UPSC • SSC • Railway • Passport Applications
            </p>
          </div>
        </div>
      )}

      {/* Main Control Panel */}
      {showControlPanel && (
        <div>
          <div className="flex justify-center mb-8 gap-3">
            <button
              className={`group relative px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                currentMode === 'resize'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/50'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg border-2 border-gray-200'
              }`}
              onClick={() => handleModeChange('resize')}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">📐</span>
                <span>Resize</span>
              </div>
            </button>
            <button
              className={`group relative px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                currentMode === 'compress'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-500/50'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-lg border-2 border-gray-200'
              }`}
              onClick={() => handleModeChange('compress')}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🗜️</span>
                <span>Compress</span>
              </div>
            </button>
          </div>

          {/* Format Selector */}
          <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200 shadow-lg'}`}>
            <label className={`block text-base font-bold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              🎨 Output Format
            </label>
            <div className="flex gap-3 flex-wrap">
              {['jpeg', 'png', 'webp'].map((format) => (
                <button
                  key={format}
                  onClick={() => setOutputFormat(format)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    outputFormat === format
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xl shadow-emerald-500/50'
                      : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Resize Inputs */}
          {currentMode === 'resize' && (
            <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-700/50' : 'bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-lg'}`}>
              <h3 className={`text-xl font-bold mb-5 ${darkMode ? 'text-purple-200' : 'text-purple-800'}`}>
                📏 Resize by Dimension
              </h3>
              
              {/* Aspect Ratio Lock */}
              <div className="flex items-center mb-5">
                <input
                  type="checkbox"
                  id="aspect-lock"
                  checked={aspectRatioLocked}
                  onChange={(e) => setAspectRatioLocked(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="aspect-lock" className={`ml-3 text-base font-semibold cursor-pointer ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  🔒 Lock aspect ratio {aspectRatio && `(${aspectRatio.toFixed(2)})`}
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="width-input" className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Width (pixels)
                  </label>
                  <input
                    type="number"
                    id="width-input"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className={`w-full rounded-lg shadow-md p-3 border-2 text-lg font-semibold focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
                <div>
                  <label htmlFor="height-input" className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                    Height (pixels)
                  </label>
                  <input
                    type="number"
                    id="height-input"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className={`w-full rounded-lg shadow-md p-3 border-2 text-lg font-semibold focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                    }`}
                  />
                </div>
              </div>

              {/* Quality Slider */}
              <div className="mt-6">
                <label htmlFor="quality-slider" className={`block text-sm font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  ⭐ Quality: <span className="text-purple-600 dark:text-purple-400 text-lg">{quality}%</span>
                </label>
                <input
                  type="range"
                  id="quality-slider"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full h-3 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  style={{
                    background: `linear-gradient(to right, #9333ea 0%, #9333ea ${quality}%, ${darkMode ? '#374151' : '#d1d5db'} ${quality}%, ${darkMode ? '#374151' : '#d1d5db'} 100%)`
                  }}
                />
              </div>
            </div>
          )}

          {/* Compress Inputs */}
          {currentMode === 'compress' && (
            <div className={`p-6 rounded-xl mb-6 ${darkMode ? 'bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 shadow-lg'}`}>
              <h3 className={`text-xl font-bold mb-5 ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                🗜️ Compress to Target Size
              </h3>
              <div>
                <label htmlFor="kb-limit-input" className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  Maximum File Size (KB)
                </label>
                <input
                  type="number"
                  id="kb-limit-input"
                  value={kbLimit}
                  onChange={(e) => setKbLimit(e.target.value)}
                  className={`w-full rounded-lg shadow-md p-3 border-2 text-lg font-semibold focus:ring-4 focus:ring-blue-500/50 focus:border-blue-500 transition-all ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'
                  }`}
                  placeholder="e.g., 50"
                />
              </div>
              <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                <p className={`text-sm font-medium ${darkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                  💡 The app will automatically optimize image quality to stay under this limit
                </p>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {processing && (
            <div className="mb-6">
              <div className={`w-full rounded-full h-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} overflow-hidden shadow-inner`}>
                <div 
                  className="h-4 rounded-full transition-all duration-300 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 shadow-lg relative overflow-hidden"
                  style={{width: `${progress}%`}}
                >
                  <div className="absolute inset-0 shimmer"></div>
                </div>
              </div>
              <p className={`text-center text-base font-semibold mt-3 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                ⚡ Processing... {progress}%
              </p>
            </div>
          )}

          <button
            onClick={processImage}
            disabled={processing}
            className={`w-full px-6 py-4 font-bold text-lg rounded-xl shadow-2xl transition-all duration-300 transform mb-6 ${
              processing
                ? darkMode
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 hover:scale-[1.02] hover:shadow-purple-500/50'
            }`}
          >
            {processing ? '⏳ Processing Magic...' : '✨ Transform Image Now'}
          </button>
        </div>
      )}

      {/* Status Area */}
      {showStatus && (
        <div className={`mt-6 p-5 rounded-xl text-sm font-medium shadow-lg border-l-4 ${statusClass} animate-pulse`}>
          <p className="flex items-center gap-2">
            <span>📢</span>
            <span>{statusMessage}</span>
          </p>
        </div>
      )}

      {/* Results Area */}
      {showResults && (
        <div className="mt-8 animate-fadeIn">
          <div className="text-center mb-6">
            <div className="inline-block">
              <h2 className="text-4xl font-extrabold gradient-text mb-2">
                🎉 Success!
              </h2>
              <div className="h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className={`p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300 ${
              darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'
            }`}>
              <div className="text-3xl mb-2">📦</div>
              <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Original Size</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{originalSize}</p>
            </div>
            <div className="p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm font-semibold mb-1 text-emerald-100">New Size</p>
              <p className="text-2xl font-bold">{finalSize}</p>
            </div>
            <div className="p-6 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
              <div className="text-3xl mb-2">📊</div>
              <p className="text-sm font-semibold mb-1 text-blue-100">Space Saved</p>
              <p className="text-2xl font-bold">{compressionRatio}%</p>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="mb-8">
            <h3 className={`text-2xl font-bold mb-5 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              🔍 Before & After Comparison
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`rounded-2xl overflow-hidden shadow-2xl border-2 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                <div className={`px-4 py-3 font-bold text-base ${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
                  📷 Original
                </div>
                <div className={`p-6 flex items-center justify-center min-h-[300px] ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
                  <img src={originalImageUrl} className="max-w-full h-auto max-h-[400px] object-contain rounded-lg shadow-lg" alt="Original" />
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500">
                <div className="px-4 py-3 font-bold text-base bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  ✨ Processed
                </div>
                <div className={`p-6 flex items-center justify-center min-h-[300px] ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}`}>
                  <img src={processedImageUrl} className="max-w-full h-auto max-h-[400px] object-contain rounded-lg shadow-lg" alt="Processed" />
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="text-center">
            <button
              onClick={downloadImage}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300 transform inline-flex items-center gap-3"
            >
              <span className="text-2xl">⬇️</span>
              <span>Download Your Masterpiece</span>
            </button>
            <div className={`mt-5 inline-block px-5 py-3 rounded-full ${darkMode ? 'bg-gray-800/50 border border-gray-700' : 'bg-white/80 border border-gray-200'}`}>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                � 100% Private • All processing happens locally in your browser
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default FormFit;
