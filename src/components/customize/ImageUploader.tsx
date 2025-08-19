import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  RotateCcw, 
  Move,
  RotateCw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { CustomizationImage, IMAGE_CUSTOMIZATION_OPTIONS } from '@/types/customization.types';
import { useCustomization } from '@/hooks/useCustomization';

interface ImageUploaderProps {
  onImageUpload: (file: File, position: { x: number; y: number }) => Promise<void>;
}

export function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { pricing } = useCustomization();

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!IMAGE_CUSTOMIZATION_OPTIONS.allowedTypes.includes(file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/svg+xml')) {
      alert('Please select a valid image file (JPEG, PNG, WebP, or SVG)');
      return;
    }

    // Validate file size
    if (file.size > IMAGE_CUSTOMIZATION_OPTIONS.maxFileSize) {
      alert(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) is too large. Please try a smaller image.`);
      return;
    }

    // Default position (center of canvas) - this will be scaled by the parent component
    const position = { x: 300, y: 250 };
    
    try {
      await onImageUpload(file, position);
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image. Please try again.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <ImageIcon className="w-4 h-4" />
          <div>
            <div>Add Images</div>
            {pricing.imagePrice > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Image customization fee: ${pricing.imagePrice.toFixed(2)}
              </p>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Drag and drop an image here, or click to browse
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
            Supported formats: JPEG, PNG, WebP, SVG (Max: 5MB)
          </p>
          <Button 
            onClick={handleClick} 
            variant="outline" 
            size="sm"
          >
            Choose File
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_CUSTOMIZATION_OPTIONS.allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
          <div>• Maximum file size: 5MB</div>
          <div>• Supported formats: JPEG, PNG, WebP, SVG</div>
          <div>• Images will be positioned on the canvas</div>
          <div>• You can resize and move images after adding</div>
          <div>• Images are stored locally for design preview</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ImageEditorProps {
  image: CustomizationImage;
  onUpdate: (updates: Partial<CustomizationImage>) => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

export function ImageEditor({ 
  image, 
  onUpdate, 
  onDelete, 
  onSelect,
  isSelected 
}: ImageEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSizeChange = (axis: 'width' | 'height', value: number) => {
    onUpdate({
      size: {
        ...image.size,
        [axis]: value,
      },
    });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onUpdate({
      position: {
        ...image.position,
        [axis]: value,
      },
    });
  };

  const handleRotationChange = (rotation: number) => {
    onUpdate({ rotation });
  };

  const handleOpacityChange = (opacity: number) => {
    onUpdate({ opacity });
  };

  const resetRotation = () => {
    onUpdate({ rotation: 0 });
  };

  const resetSize = () => {
    onUpdate({
      size: { width: 100, height: 100 },
    });
  };

  return (
    <Card 
      className={`transition-all duration-200 ${
        isSelected 
          ? 'ring-2 ring-blue-500 shadow-lg' 
          : 'hover:shadow-md'
      }`}
      onClick={onSelect}
    >
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4" />
            <span className="truncate max-w-[150px]">
              Image Element
            </span>
            {/* Removed upload status indicators since images are kept locally only */}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <Separator />
          
          {/* Image Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded-lg p-2 bg-gray-50 dark:bg-gray-800">
              <img
                src={image.url}
                alt="Customization preview"
                className="w-full h-24 object-contain"
              />
            </div>
          </div>

          {/* Size Controls */}
          <div className="space-y-2">
            <Label>Size</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Width: {image.size.width}px</Label>
                <Slider
                  value={[image.size.width]}
                  onValueChange={([value]) => handleSizeChange('width', value)}
                  min={IMAGE_CUSTOMIZATION_OPTIONS.minSize.width}
                  max={IMAGE_CUSTOMIZATION_OPTIONS.maxSize.width}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Height: {image.size.height}px</Label>
                <Slider
                  value={[image.size.height]}
                  onValueChange={([value]) => handleSizeChange('height', value)}
                  min={IMAGE_CUSTOMIZATION_OPTIONS.minSize.height}
                  max={IMAGE_CUSTOMIZATION_OPTIONS.maxSize.height}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSize}
              className="w-full"
            >
              Reset Size
            </Button>
          </div>

          {/* Opacity Control */}
          <div className="space-y-2">
            <Label className="text-xs">Opacity: {Math.round(image.opacity * 100)}%</Label>
            <Slider
              value={[image.opacity]}
              onValueChange={([value]) => handleOpacityChange(value)}
              min={IMAGE_CUSTOMIZATION_OPTIONS.minOpacity}
              max={IMAGE_CUSTOMIZATION_OPTIONS.maxOpacity}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Position Controls */}
          <div className="space-y-2">
            <Label>Position</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">X Position</Label>
                <Input
                  type="number"
                  value={image.position.x}
                  onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Y Position</Label>
                <Input
                  type="number"
                  value={image.position.y}
                  onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Rotation Control */}
          <div className="space-y-2">
            <Label className="text-xs">Rotation: {image.rotation}°</Label>
            <div className="flex gap-2">
              <Slider
                value={[image.rotation]}
                onValueChange={([value]) => handleRotationChange(value)}
                min={-180}
                max={180}
                step={1}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={resetRotation}
                className="h-8 w-8 p-0"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
