import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/rating/StarRating';
import { Calendar, MapPin, Edit3, Save, X } from 'lucide-react';
import { UnifiedEvent } from '@/types/unified';

interface UserMemory extends UnifiedEvent {
  userRating?: number;
  userComment?: string;
  ratedAt?: string;
  canModifyRating?: boolean;
}

interface MemoryCardProps {
  memory: UserMemory;
  onRatingUpdate: (eventId: string, rating: number, comment?: string) => void;
}

export const MemoryCard = ({ memory, onRatingUpdate }: MemoryCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(memory.userRating || 0);
  const [editComment, setEditComment] = useState(memory.userComment || '');

  const handleSave = () => {
    onRatingUpdate(memory.id, editRating, editComment.trim() || undefined);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditRating(memory.userRating || 0);
    setEditComment(memory.userComment || '');
    setIsEditing(false);
  };

  const canEdit = memory.canModifyRating && memory.ratedAt;
  const hasRating = memory.userRating && memory.userRating > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {memory.image_url && (
              <img 
                src={memory.image_url} 
                alt={memory.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            
            <div className="flex-1">
              <h3 className="font-semibold mb-2">{memory.title}</h3>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(memory.date).toLocaleDateString('fr-FR')}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{memory.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="capitalize">
                  {memory.category?.replace('-', ' ')}
                </Badge>
                {memory.ratedAt && (
                  <Badge variant="secondary">
                    Noté le {new Date(memory.ratedAt).toLocaleDateString('fr-FR')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {canEdit && !isEditing && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {hasRating ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">Votre note:</span>
              {isEditing ? (
                <StarRating 
                  value={editRating}
                  onChange={setEditRating}
                  size="sm"
                />
              ) : (
                <StarRating 
                  value={memory.userRating!}
                  readonly
                  size="sm"
                />
              )}
            </div>

            {(memory.userComment || isEditing) && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Votre commentaire:</span>
                {isEditing ? (
                  <Textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    placeholder="Partagez votre expérience..."
                    maxLength={300}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm italic p-3 bg-muted rounded-lg">
                    "{memory.userComment}"
                  </p>
                )}
              </div>
            )}

            {isEditing && (
              <div className="flex items-center space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={editRating === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancel}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">Notez cet événement:</span>
              <StarRating 
                value={editRating}
                onChange={setEditRating}
                size="sm"
              />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium">Commentaire (optionnel):</span>
              <Textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                placeholder="Partagez votre expérience..."
                maxLength={300}
                rows={3}
              />
            </div>

            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={editRating === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Noter l'événement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};