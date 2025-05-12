
import React, { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Key, Lock, Bell, Eye, LogOut } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from "@/firebase.config";

interface ProfileSettingsProps {
  userProfile: {
    name: string;
    username: string;
    avatar: string;
    bio: string;
    isPublic: boolean;
    stats: {
      events: number;
      friends: number;
      photos: number;
      organized: number;
      participated: number;
    };
  };
}

const ProfileSettings = ({ userProfile }: ProfileSettingsProps) => {
  const [isPublic, setIsPublic] = useState(userProfile?.isPublic);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handlePrivacyToggle = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isPublic: !isPublic
      });
      
      setIsPublic(!isPublic);
      toast({
        description: `Your profile is now ${!isPublic ? 'public' : 'private'}.`,
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to update privacy settings.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        description: "You have been signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="mr-2 h-5 w-5" />
            Privacy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="public-profile" className="font-medium">Public Profile</Label>
              <p className="text-sm text-gray-500">
                Allow others to find and view your profile
              </p>
            </div>
            <Switch 
              id="public-profile" 
              checked={isPublic} 
              onCheckedChange={handlePrivacyToggle}
              disabled={isSaving}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications about events via email
              </p>
            </div>
            <Switch 
              id="email-notifications" 
              checked={emailNotifications} 
              onCheckedChange={setEmailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications on your device
              </p>
            </div>
            <Switch 
              id="push-notifications" 
              checked={pushNotifications} 
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start">
            <Lock className="mr-2 h-4 w-4" />
            Change Password
          </Button>
          
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
