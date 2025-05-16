
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Minus } from 'lucide-react';
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Participant } from './FormTypes';

interface ParticipantsSectionProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
}

const ParticipantsSection = ({ participants, setParticipants }: ParticipantsSectionProps) => {
  const [newParticipantEmail, setNewParticipantEmail] = useState('');
  const [newParticipantName, setNewParticipantName] = useState('');

  // Add participant
  const addParticipant = () => {
    if (!newParticipantEmail || !newParticipantName) return;
    
    setParticipants([
      ...participants,
      {
        id: uuidv4(),
        name: newParticipantName,
        email: newParticipantEmail
      }
    ]);
    
    setNewParticipantEmail('');
    setNewParticipantName('');
  };

  // Remove participant
  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };
  
  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <h3 className="text-lg font-medium">Participants</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <FormLabel>Nom</FormLabel>
          <Input 
            placeholder="Nom du participant"
            value={newParticipantName}
            onChange={(e) => setNewParticipantName(e.target.value)}
          />
        </div>
        <div>
          <FormLabel>Email</FormLabel>
          <div className="flex space-x-2">
            <Input 
              placeholder="Email"
              value={newParticipantEmail}
              onChange={(e) => setNewParticipantEmail(e.target.value)}
            />
            <Button 
              type="button" 
              size="icon" 
              onClick={addParticipant}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {participants.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <ul className="space-y-2">
              {participants.map((p) => (
                <li key={p.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    <span className="text-sm text-gray-500 ml-2">{p.email}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeParticipant(p.id)}
                  >
                    <Minus className="h-4 w-4 text-red-500" />
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParticipantsSection;
