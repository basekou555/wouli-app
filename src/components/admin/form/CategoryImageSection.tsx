
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Upload } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormData, categories } from './FormTypes';

interface CategoryImageSectionProps {
  form: UseFormReturn<FormData>;
  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
}

const CategoryImageSection = ({ 
  form, 
  imageFile, 
  setImageFile, 
  imagePreview, 
  setImagePreview 
}: CategoryImageSectionProps) => {
  
  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h3 className="text-lg font-medium">Catégorie et image</h3>
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Catégorie</FormLabel>
            <FormControl>
              <select
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...field}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div>
        <FormLabel>Image de l'événement (optionnel)</FormLabel>
        <div className="mt-1 flex flex-col space-y-2">
          <div
            className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={() => document.getElementById('event-image')?.click()}
          >
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Cliquez pour télécharger une image</span>
            <input
              type="file"
              id="event-image"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-auto max-h-48 rounded-md object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
              >
                Supprimer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryImageSection;
