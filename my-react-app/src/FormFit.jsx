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

  // Presets
  const presets = {
    passport: { width: 413, height: 531, kb: 50, name: 'Passport Photo' },
    profile: { width: 400, height: 400, kb: 100, name: 'Social Media Profile' },
    email: { width: 800, height: 600, kb: 100, name: 'Email Attachment' },
    whatsapp: { width: 1024, height: 768, kb: 500, name: 'WhatsApp Share' },
    hd: { width: 1920, height: 1080, kb: 1000, name: 'HD Image' },
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
    <div className={`w-full max-w-6xl mt-4 container-card rounded-xl p-6 md:p-10 transition-colors duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      {/* Header with Dark Mode Toggle */}
      <header className="text-center mb-8 relative">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`absolute right-0 top-0 p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          title="Toggle Dark Mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <h1 className={`text-4xl font-extrabold ${darkMode ? 'text-white' : 'text-gray-800'}`}>PixelPerfect</h1>
        <p className="text-xl text-emerald-600 font-medium mt-1">The Image Compliance Tool</p>
        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-500'} mt-2`}>Resize and compress images to meet exact document and application requirements.</p>
        <div className={`mt-3 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>
          💡 Tip: Ctrl+V to paste, Enter to process, Ctrl+S to download
        </div>
      </header>

      {/* Upload Area */}
      <div
        ref={uploadZoneRef}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-emerald-500 transition duration-150 mb-8 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current.click()}
      >
        <svg className={`mx-auto h-12 w-12 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Drag & drop or click to upload image</p>
        {originalFileName && (
          <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>File selected: {originalFileName}</p>
        )}
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
          <h3 className={`text-lg font-semibold mb-3 text-center ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>⚡ Quick Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => {
                  if (uploadedImage) applyPreset(key);
                  else displayStatus('Please upload an image first', 'bg-yellow-50 border-yellow-200 text-yellow-700');
                }}
                disabled={!uploadedImage}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  uploadedImage 
                    ? darkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-emerald-600 hover:text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-emerald-500 hover:text-white'
                    : darkMode
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Control Panel */}
      {showControlPanel && (
        <div>
          <div className="flex justify-center mb-6 gap-2">
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition duration-150 ${
                currentMode === 'resize'
                  ? 'text-white bg-emerald-600 shadow-md'
                  : darkMode
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => handleModeChange('resize')}
            >
              📐 Resize
            </button>
            <button
              className={`px-6 py-2 rounded-lg font-semibold transition duration-150 ${
                currentMode === 'compress'
                  ? 'text-white bg-emerald-600 shadow-md'
                  : darkMode
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
              }`}
              onClick={() => handleModeChange('compress')}
            >
              🗜️ Compress
            </button>
          </div>

          {/* Format Selector */}
          <div className={`p-4 border rounded-lg mb-4 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'}`}>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Output Format</label>
            <div className="flex gap-3">
              {['jpeg', 'png', 'webp'].map((format) => (
                <button
                  key={format}
                  onClick={() => setOutputFormat(format)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    outputFormat === format
                      ? 'bg-emerald-600 text-white shadow-md'
                      : darkMode
                        ? 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {format.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Resize Inputs */}
          {currentMode === 'resize' && (
            <div className={`p-6 border rounded-lg mb-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Resize by Dimension (Pixels)</h3>
              
              {/* Aspect Ratio Lock */}
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="aspect-lock"
                  checked={aspectRatioLocked}
                  onChange={(e) => setAspectRatioLocked(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="aspect-lock" className={`ml-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  🔒 Lock aspect ratio {aspectRatio && `(${aspectRatio.toFixed(2)})`}
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="width-input" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Width (px)</label>
                  <input
                    type="number"
                    id="width-input"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'}`}
                  />
                </div>
                <div>
                  <label htmlFor="height-input" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Height (px)</label>
                  <input
                    type="number"
                    id="height-input"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className={`mt-1 block w-full rounded-md shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'}`}
                  />
                </div>
              </div>

              {/* Quality Slider */}
              <div className="mt-4">
                <label htmlFor="quality-slider" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  id="quality-slider"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          )}

          {/* Compress Inputs */}
          {currentMode === 'compress' && (
            <div className={`p-6 border rounded-lg mb-6 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Compress to Max Size (KB)</h3>
              <div>
                <label htmlFor="kb-limit-input" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Max File Size (KB)</label>
                <input
                  type="number"
                  id="kb-limit-input"
                  value={kbLimit}
                  onChange={(e) => setKbLimit(e.target.value)}
                  className={`mt-1 block w-full rounded-md shadow-sm p-2 border focus:ring-emerald-500 focus:border-emerald-500 ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'border-gray-300'}`}
                  placeholder="e.g., 50"
                />
              </div>
              <p className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>The tool will reduce image quality until the file size is below this limit.</p>
            </div>
          )}

          {/* Progress Bar */}
          {processing && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300" style={{width: `${progress}%`}}></div>
              </div>
              <p className={`text-center text-sm mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Processing... {progress}%</p>
            </div>
          )}

          <button
            onClick={processImage}
            disabled={processing}
            className={`w-full px-6 py-3 font-bold rounded-lg shadow-lg transition duration-200 transform mb-6 ${
              processing
                ? darkMode
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
            }`}
          >
            {processing ? '⏳ Processing...' : '✨ Process Image'}
          </button>
        </div>
      )}

      {/* Status Area */}
      {showStatus && (
        <div className={`mt-6 p-4 border rounded-lg text-sm ${statusClass}`}>
          <p>{statusMessage}</p>
        </div>
      )}

      {/* Results Area */}
      {showResults && (
        <div className="mt-8">
          <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${darkMode ? 'text-gray-200 border-gray-600' : 'text-gray-800'}`}>✅ Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className={`p-4 border rounded-lg ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50'}`}>
              <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Original Size:</p>
              <p className={`text-xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{originalSize}</p>
            </div>
            <div className={`p-4 border rounded-lg ${darkMode ? 'bg-emerald-900 border-emerald-700' : 'bg-emerald-50'}`}>
              <p className={`text-sm font-semibold ${darkMode ? 'text-emerald-200' : 'text-gray-600'}`}>Processed Size:</p>
              <p className="text-xl font-bold text-emerald-600">{finalSize}</p>
            </div>
            <div className={`p-4 border rounded-lg ${darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50'}`}>
              <p className={`text-sm font-semibold ${darkMode ? 'text-blue-200' : 'text-gray-600'}`}>Size Reduced:</p>
              <p className="text-xl font-bold text-blue-600">{compressionRatio}%</p>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="mb-6">
            <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>🔍 Before & After Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
                <div className={`px-3 py-2 font-semibold text-sm ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                  Original
                </div>
                <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800 min-h-[200px]">
                  <img src={originalImageUrl} className="max-w-full h-auto max-h-[300px] object-contain" alt="Original" />
                </div>
              </div>
              <div className={`border rounded-lg overflow-hidden ${darkMode ? 'border-emerald-600' : 'border-emerald-300'}`}>
                <div className={`px-3 py-2 font-semibold text-sm ${darkMode ? 'bg-emerald-900 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}>
                  Processed
                </div>
                <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800 min-h-[200px]">
                  <img src={processedImageUrl} className="max-w-full h-auto max-h-[300px] object-contain" alt="Processed" />
                </div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div className="text-center">
            <button
              onClick={downloadImage}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition duration-200 transform hover:scale-105 inline-flex items-center gap-2"
            >
              <span>⬇️</span>
              <span>Download Processed Image</span>
            </button>
            <p className={`text-xs mt-3 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              💾 All processing is done locally in your browser. Your images never leave your device!
            </p>
          </div>
        </div>
      )}

      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default FormFit;
