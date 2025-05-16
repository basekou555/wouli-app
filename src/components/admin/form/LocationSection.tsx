
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormData } from './FormTypes';

interface LocationSectionProps {
  form: UseFormReturn<FormData>;
}

const LocationSection = ({ form }: LocationSectionProps) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h3 className="text-lg font-medium">Lieu</h3>
      
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom du lieu</FormLabel>
            <FormControl>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input className="pl-10" placeholder="Restaurant, bar, salle..." {...field} />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Adresse complète</FormLabel>
            <FormControl>
              <Input placeholder="123 Rue de Paris, 75001 Paris" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default LocationSection;
