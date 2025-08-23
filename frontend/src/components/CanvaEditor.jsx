import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Download, Share2, X, Loader, Image as ImageIcon } from 'lucide-react';

const CanvaEditor = ({ 
  imageUrl, 
  onSave, 
  onClose, 
  isOpen = false 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [canvaUrl, setCanvaUrl] = useState('');
  const [designId, setDesignId] = useState('');
  const iframeRef = useRef(null);

  // Canva API configuration
  const CANVA_API_KEY = import.meta.env.VITE_CANVA_API_KEY || 'your-canva-api-key';
  const CANVA_BRAND_KIT_ID = import.meta.env.VITE_CANVA_BRAND_KIT_ID || 'your-brand-kit-id';

  useEffect(() => {
    if (isOpen && imageUrl) {
      initializeCanvaEditor();
    }
  }, [isOpen, imageUrl]);

  const initializeCanvaEditor = async () => {
    setIsLoading(true);
    try {
      // Initialize Canva Design Button API
      if (window.Canva) {
        const { openEditor } = window.Canva.DesignButton;
        
        // Create a new design from the image
        const design = await openEditor({
          type: 'IMAGE',
          brandKit: {
            id: CANVA_BRAND_KIT_ID
          },
          content: [
            {
              type: 'IMAGE',
              url: imageUrl,
              width: 1200,
              height: 1200
            }
          ],
          onDesignOpen: (design) => {
            setDesignId(design.id);
            setCanvaUrl(design.editorUrl);
          },
          onSave: async (design) => {
            await handleSave(design);
          }
        });
      } else {
        // Fallback: Open Canva in iframe
        const encodedImageUrl = encodeURIComponent(imageUrl);
        const canvaEditorUrl = `https://www.canva.com/design/DAF/edit?embed&embed_type=image&image=${encodedImageUrl}`;
        setCanvaUrl(canvaEditorUrl);
      }
    } catch (error) {
      console.error('Error initializing Canva editor:', error);
      // Fallback to iframe
      const encodedImageUrl = encodeURIComponent(imageUrl);
      const canvaEditorUrl = `https://www.canva.com/design/DAF/edit?embed&embed_type=image&image=${encodedImageUrl}`;
      setCanvaUrl(canvaEditorUrl);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (design) => {
    try {
      setIsLoading(true);
      
      // Get the edited image from Canva
      const imageData = await design.export({
        type: 'IMAGE',
        format: 'PNG',
        quality: 'HIGH'
      });

      // Convert to blob and create URL
      const blob = await imageData.blob();
      const editedImageUrl = URL.createObjectURL(blob);

      // Call the onSave callback with the edited image
      if (onSave) {
        await onSave(editedImageUrl, blob);
      }

      onClose();
    } catch (error) {
      console.error('Error saving design:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setIsLoading(true);
      
      // Trigger download from Canva
      if (window.Canva && designId) {
        const design = await window.Canva.DesignButton.getDesign(designId);
        await design.download({
          type: 'IMAGE',
          format: 'PNG',
          quality: 'HIGH'
        });
      }
    } catch (error) {
      console.error('Error downloading design:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && designId) {
        await navigator.share({
          title: 'My edited image',
          text: 'Check out this image I edited with Canva!',
          url: `https://www.canva.com/design/${designId}`
        });
      } else {
        // Fallback: copy to clipboard
        const shareUrl = `https://www.canva.com/design/${designId}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing design:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="flex items-center space-x-3">
            <ImageIcon className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Edit Image with Canva</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              disabled={isLoading || !designId}
              className="btn btn-ghost btn-sm text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
            
            <button
              onClick={handleDownload}
              disabled={isLoading || !designId}
              className="btn btn-ghost btn-sm text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
            
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Loading Canva editor...
                </p>
              </div>
            </div>
          ) : canvaUrl ? (
            <iframe
              ref={iframeRef}
              src={canvaUrl}
              className="w-full h-full border-0"
              title="Canva Editor"
              allow="camera; microphone; geolocation; encrypted-media"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Failed to load Canva editor
                </p>
                <button
                  onClick={initializeCanvaEditor}
                  className="btn btn-primary mt-4"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Edit your image using Canva's powerful design tools
            </p>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleSave()}
                disabled={isLoading || !designId}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Edit3 className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvaEditor;
