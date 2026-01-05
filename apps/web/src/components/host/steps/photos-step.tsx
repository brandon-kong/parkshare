"use client";

import { Star, Upload, X } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";

export interface PhotoFile {
  id: string;
  file: File;
  previewUrl: string;
  order: number;
}

interface PhotosStepProps {
  photos: PhotoFile[];
  onPhotosChange: (photos: PhotoFile[]) => void;
  errors?: {
    photos?: string;
  };
}

export function PhotosStep({
  photos,
  onPhotosChange,
  errors,
}: PhotosStepProps) {
  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const newPhotos: PhotoFile[] = Array.from(files).map((file, index) => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        order: photos.length + index,
      }));

      onPhotosChange([...photos, ...newPhotos].slice(0, 10));
    },
    [photos, onPhotosChange],
  );

  const handleRemovePhoto = useCallback(
    (id: string) => {
      const photo = photos.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      const updatedPhotos = photos
        .filter((p) => p.id !== id)
        .map((p, index) => ({ ...p, order: index }));
      onPhotosChange(updatedPhotos);
    },
    [photos, onPhotosChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleFilesSelected(e.dataTransfer.files);
    },
    [handleFilesSelected],
  );

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h3">Add photos of your spot</Typography>
        <p className="text-muted-foreground mt-1">
          Guests want to see what they're booking. Add at least 1 photo.
        </p>
      </div>

      {/* Upload Zone */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop zone handled by nested input */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="relative border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-foreground/30 transition-colors"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => handleFilesSelected(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload photos"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
            <Upload size={24} className="text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Drag photos here or click to browse</p>
            <p className="text-sm text-muted-foreground mt-1">
              JPG, PNG, WEBP (max 10MB each)
            </p>
          </div>
        </div>
      </div>

      {errors?.photos && (
        <p className="text-sm text-destructive">{errors.photos}</p>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            Your photos ({photos.length}/10)
          </p>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-accent group"
              >
                {/* biome-ignore lint/performance/noImgElement: blob URLs cannot use Next Image */}
                <img
                  src={photo.previewUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Cover badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-md bg-black/70 text-white text-xs">
                    <Star size={12} />
                    Cover
                  </div>
                )}
                {/* Remove button */}
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Remove photo ${index + 1}`}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
