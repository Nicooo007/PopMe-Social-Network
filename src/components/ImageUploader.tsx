import { useState } from 'react';

interface ImageUploaderProps {
  onImageSelect: (base64: string) => void;
  currentImage?: string;
}

export default function ImageUploader({ onImageSelect, currentImage }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onImageSelect(base64String);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div 
        className="w-full aspect-[2/3] rounded-xl border-2 border-dashed border-gray-700 overflow-hidden bg-[#1B1B1F] flex items-center justify-center cursor-pointer hover:border-[#FFC267] transition"
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center">
            <i className="bx bx-image-add text-5xl text-gray-600 mb-2"></i>
            <p className="text-sm text-gray-400">Click to upload</p>
          </div>
        )}
      </div>
      
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <p className="text-xs text-gray-400 text-center">
        PNG, JPG up to 5MB
      </p>
    </div>
  );
}