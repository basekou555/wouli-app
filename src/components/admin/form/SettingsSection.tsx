
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { FormData } from './FormTypes';

interface SettingsSectionProps {
  form: UseFormReturn<FormData>;
}

const SettingsSection = ({ form }: SettingsSectionProps) => {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h3 className="text-lg font-medium">Paramètres</h3>
      
      <FormField
        control={form.control}
        name="privacy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confidentialité</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <label htmlFor="private" className="cursor-pointer">Privé</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="friends" id="friends" />
                  <label htmlFor="friends" className="cursor-pointer">Amis</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <label htmlFor="public" className="cursor-pointer">Public</label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="maxParticipants"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre maximum de participants (optionnel)</FormLabel>
            <FormControl>
              <Input type="number" min="1" placeholder="Laisser vide si illimité" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="allowPlusOne"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-4">
              <div>
                <FormLabel>Autoriser les +1</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="requireApproval"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-4">
              <div>
                <FormLabel>Approbation requise</FormLabel>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default SettingsSection;
