import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  RotateCcw, 
  Trash2,
  Type,
  Palette,
  Move,
  RotateCw
} from 'lucide-react';
import { CustomizationText, FONT_FAMILIES, TEXT_COLORS } from '@/types/customization.types';
import { useCustomization } from '@/hooks/useCustomization';

interface TextEditorProps {
  text: CustomizationText;
  onUpdate: (updates: Partial<CustomizationText>) => void;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

export function TextEditor({ 
  text, 
  onUpdate, 
  onDelete, 
  onSelect,
  isSelected 
}: TextEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTextChange = (value: string) => {
    onUpdate({ text: value });
  };

  const handleFontFamilyChange = (fontFamily: string) => {
    onUpdate({ fontFamily });
  };

  const handleFontSizeChange = (fontSize: number) => {
    onUpdate({ fontSize });
  };

  const handleColorChange = (color: string) => {
    onUpdate({ color });
  };

  const handlePositionChange = (axis: 'x' | 'y', value: number) => {
    onUpdate({
      position: {
        ...text.position,
        [axis]: value,
      },
    });
  };

  const handleRotationChange = (rotation: number) => {
    onUpdate({ rotation });
  };

  const toggleBold = () => {
    onUpdate({ fontWeight: text.fontWeight === 'bold' ? 'normal' : 'bold' });
  };

  const toggleItalic = () => {
    onUpdate({ fontStyle: text.fontStyle === 'italic' ? 'normal' : 'italic' });
  };

  const toggleUnderline = () => {
    onUpdate({ textDecoration: text.textDecoration === 'underline' ? 'none' : 'underline' });
  };

  const resetRotation = () => {
    onUpdate({ rotation: 0 });
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
            <Type className="w-4 h-4" />
            <span className="truncate max-w-[150px]">
              {text.text || 'Text Element'}
            </span>
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
          
          {/* Text Input */}
          <div className="space-y-2">
            <Label htmlFor={`text-${text.id}`}>Text Content</Label>
            <Input
              id={`text-${text.id}`}
              value={text.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your text..."
              className="text-sm"
            />
          </div>

          {/* Font Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`font-family-${text.id}`}>Font</Label>
              <Select value={text.fontFamily} onValueChange={handleFontFamilyChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => {
                    if (font === '---') {
                      return (
                        <SelectItem key="separator" value="---" disabled>
                          ─────────────────────────
                        </SelectItem>
                      );
                    }
                    
                    const isArabic = font.toLowerCase().includes('arabic') || 
                                   ['Amiri', 'Scheherazade New', 'Lateef', 'Reem Kufi', 'Cairo', 
                                    'Tajawal', 'Almarai', 'IBM Plex Sans Arabic', 'Alkalami', 
                                    'Noto Kufi Arabic', 'Noto Naskh Arabic', 'Noto Nastaliq Urdu', 
                                    'Harmattan', 'Markazi Text', 'Rubik'].includes(font);
                    
                    return (
                      <SelectItem key={font} value={font}>
                        <span className={isArabic ? 'font-arabic' : 'font-english'}>
                          {font} {isArabic ? '(Ar)' : '(En)'}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`font-size-${text.id}`}>Size: {text.fontSize}px</Label>
              <Slider
                id={`font-size-${text.id}`}
                value={[text.fontSize]}
                onValueChange={([value]) => handleFontSizeChange(value)}
                min={8}
                max={72}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          {/* Text Styling */}
          <div className="space-y-2">
            <Label>Text Styling</Label>
            <div className="flex gap-2">
              <Button
                variant={text.fontWeight === 'bold' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleBold}
                className="flex-1"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                variant={text.fontStyle === 'italic' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleItalic}
                className="flex-1"
              >
                <Italic className="w-4 h-4" />
              </Button>
              <Button
                variant={text.textDecoration === 'underline' ? 'default' : 'outline'}
                size="sm"
                onClick={toggleUnderline}
                className="flex-1"
              >
                <Underline className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Text Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {TEXT_COLORS.map((color) => {
                // Helper function to get hex color (same as in CustomizeProduct)
                const getColorHex = (colorName: string): string => {
                  const colorMap: Record<string, string> = {
                    'black': '#000000', 'white': '#FFFFFF', 'red': '#FF0000', 'blue': '#0000FF',
                    'green': '#00FF00', 'yellow': '#FFFF00', 'orange': '#FFA500', 'purple': '#800080',
                    'pink': '#FFC0CB', 'brown': '#A52A2A', 'gray': '#808080', 'navy': '#000080',
                    'lightblue': '#87CEEB', 'rose': '#FF007F', 'beige': '#F5F5DC', 'lime': '#32CD32',
                    'darkgreen': '#006400', 'offwhite': '#F5F5F5', 'cyan': '#00FFFF', 'magenta': '#FF00FF',
                    'gold': '#FFD700', 'silver': '#C0C0C0', 'maroon': '#800000', 'olive': '#808000',
                    'teal': '#008080', 'indigo': '#4B0082', 'violet': '#EE82EE', 'coral': '#FF7F50',
                    'salmon': '#FA8072', 'turquoise': '#40E0D0', 'lavender': '#E6E6FA', 'plum': '#DDA0DD',
                    'tan': '#D2B48C', 'khaki': '#F0E68C', 'crimson': '#DC143C'
                  };
                  return colorMap[colorName.toLowerCase()] || '#808080';
                };

                return (
                  <Button
                    key={color}
                    variant={text.color === color ? 'default' : 'outline'}
                    className="h-8 w-8 p-0 rounded-full border-2"
                    style={{ backgroundColor: getColorHex(color) }}
                    onClick={() => handleColorChange(color)}
                    aria-label={`Select color ${color}`}
                  >
                    {text.color === color && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Position Controls */}
          <div className="space-y-2">
            <Label>Position & Rotation</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">X Position: {text.position.x}px</Label>
                <Input
                  type="number"
                  value={text.position.x}
                  onChange={(e) => handlePositionChange('x', Number(e.target.value))}
                  className="text-sm"
                  min={0}
                  max={400}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Y Position: {text.position.y}px</Label>
                <Input
                  type="number"
                  value={text.position.y}
                  onChange={(e) => handlePositionChange('y', Number(e.target.value))}
                  className="text-sm"
                  min={0}
                  max={500}
                  step={1}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Rotation: {text.rotation}°</Label>
              <div className="flex gap-2">
                <Slider
                  value={[text.rotation]}
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
          </div>
        </CardContent>
      )}
    </Card>
  );
}
