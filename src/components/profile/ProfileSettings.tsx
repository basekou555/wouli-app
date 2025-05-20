
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Lock, Bell, Shield, Eye, Palette, Globe, Settings } from 'lucide-react';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { useAuth } from '../../context/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
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
}

interface ProfileSettingsProps {
  userProfile: UserProfile;
}

type PrivacyFormValues = {
  profileVisibility: "public" | "private";
  eventVisibility: "public" | "friends" | "participants";
};

type NotificationFormValues = {
  newMessages: boolean;
  eventReminders: boolean;
  friendRequests: boolean;
  eventInvites: boolean;
  appUpdates: boolean;
};

type AppearanceFormValues = {
  theme: "light" | "dark" | "system";
  language: "fr" | "en";
};

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userProfile }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("privacy");
  const [savingSettings, setSavingSettings] = useState(false);
  const { user } = useAuth();

  const privacyForm = useForm<PrivacyFormValues>({
    defaultValues: {
      profileVisibility: userProfile.isPublic ? "public" : "private",
      eventVisibility: "friends",
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    defaultValues: {
      newMessages: true,
      eventReminders: true,
      friendRequests: true,
      eventInvites: true,
      appUpdates: false,
    },
  });

  const appearanceForm = useForm<AppearanceFormValues>({
    defaultValues: {
      theme: "light",
      language: "fr",
    },
  });

  const onSubmitPrivacy = async (data: PrivacyFormValues) => {
    if (!user) return;
    
    setSavingSettings(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        isPublic: data.profileVisibility === "public",
        eventVisibility: data.eventVisibility
      });
      
      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres de confidentialité ont été enregistrés avec succès.",
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement des paramètres.",
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const onSubmitNotifications = async (data: NotificationFormValues) => {
    if (!user) return;
    
    setSavingSettings(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        notificationSettings: data
      });
      
      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres de notification ont été enregistrés avec succès.",
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement des paramètres.",
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  const onSubmitAppearance = async (data: AppearanceFormValues) => {
    if (!user) return;
    
    setSavingSettings(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        appearanceSettings: data
      });
      
      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres d'apparence ont été enregistrés avec succès.",
      });
    } catch (error) {
      console.error('Error saving appearance settings:', error);
      toast({
        title: "Erreur", 
        description: "Une erreur s'est produite lors de l'enregistrement des paramètres.",
        variant: "destructive"
      });
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <Card className="animate-fade-down">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Paramètres de l'application
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="privacy" className="flex items-center">
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Confidentialité</span>
              <span className="inline sm:hidden">Privé</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="inline sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Palette className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Apparence</span>
              <span className="inline sm:hidden">Style</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="privacy" className="space-y-6">
            <Form {...privacyForm}>
              <form onSubmit={privacyForm.handleSubmit(onSubmitPrivacy)} className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Statut du profil</h3>
                  <FormField
                    control={privacyForm.control}
                    name="profileVisibility"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="flex flex-col sm:flex-row gap-4"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="public" id="public-profile" />
                          <div className="grid gap-1">
                            <FormLabel htmlFor="public-profile" className="font-medium">
                              Public <Globe className="h-3 w-3 inline ml-1" />
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Visible par tous les utilisateurs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="private" id="private-profile" />
                          <div className="grid gap-1">
                            <FormLabel htmlFor="private-profile" className="font-medium">
                              Privé <Shield className="h-3 w-3 inline ml-1" />
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Visible uniquement par vos amis
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Visibilité des événements passés</h3>
                  <FormField
                    control={privacyForm.control}
                    name="eventVisibility"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-3"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="public" id="public-events" />
                          <div className="grid gap-1">
                            <FormLabel htmlFor="public-events" className="font-medium">
                              Public <Eye className="h-3 w-3 inline ml-1" />
                            </FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Visibles par tous les utilisateurs
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="friends" id="friends-events" />
                          <div className="grid gap-1">
                            <FormLabel htmlFor="friends-events" className="font-medium">Amis</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Visibles uniquement par vos amis
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="participants" id="participants-events" />
                          <div className="grid gap-1">
                            <FormLabel htmlFor="participants-events" className="font-medium">Participants</FormLabel>
                            <p className="text-xs text-muted-foreground">
                              Visibles uniquement par les participants de l'événement
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
                
                <CardFooter className="px-0 pt-2">
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="ml-auto"
                    disabled={savingSettings}
                  >
                    {savingSettings ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-4">
                <h3 className="text-sm font-medium mb-3">Recevoir des notifications pour :</h3>
                
                <div className="space-y-2">
                  {[
                    { id: "newMessages", label: "Nouveaux messages", description: "Lorsque vous recevez de nouveaux messages" },
                    { id: "eventReminders", label: "Rappels d'événements", description: "Rappels avant vos événements à venir" },
                    { id: "friendRequests", label: "Demandes d'amis", description: "Lorsque quelqu'un vous envoie une demande d'ami" },
                    { id: "eventInvites", label: "Invitations aux événements", description: "Lorsque vous êtes invité à un événement" },
                    { id: "appUpdates", label: "Mises à jour de l'application", description: "Nouvelles fonctionnalités et mises à jour" },
                  ].map((item) => (
                    <FormField
                      key={item.id}
                      control={notificationForm.control}
                      name={item.id as keyof NotificationFormValues}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium">{item.label}</FormLabel>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                
                <CardFooter className="px-0 pt-2">
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="ml-auto"
                    disabled={savingSettings}
                  >
                    {savingSettings ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Form {...appearanceForm}>
              <form onSubmit={appearanceForm.handleSubmit(onSubmitAppearance)} className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Thème</h3>
                  <FormField
                    control={appearanceForm.control}
                    name="theme"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="light" id="light-theme" className="sr-only" />
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-white to-gray-100 border flex items-center justify-center">
                            <div className="h-6 w-6 rounded-full bg-yellow-300"></div>
                          </div>
                          <FormLabel htmlFor="light-theme" className="cursor-pointer">Clair</FormLabel>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="dark" id="dark-theme" className="sr-only" />
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                            <div className="h-6 w-6 rounded-full bg-blue-200"></div>
                          </div>
                          <FormLabel htmlFor="dark-theme" className="cursor-pointer">Sombre</FormLabel>
                        </div>
                        
                        <div className="flex flex-col items-center space-y-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="system" id="system-theme" className="sr-only" />
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 border flex items-center justify-center">
                            <div className="h-6 w-6 rounded-full bg-gradient-to-bl from-yellow-300 via-white to-blue-200"></div>
                          </div>
                          <FormLabel htmlFor="system-theme" className="cursor-pointer">Système</FormLabel>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-3">Langue</h3>
                  <FormField
                    control={appearanceForm.control}
                    name="language"
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="fr" id="fr-lang" />
                          <FormLabel htmlFor="fr-lang" className="cursor-pointer">Français</FormLabel>
                        </div>
                        
                        <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                          <RadioGroupItem value="en" id="en-lang" />
                          <FormLabel htmlFor="en-lang" className="cursor-pointer">English</FormLabel>
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
                
                <CardFooter className="px-0 pt-2">
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="ml-auto"
                    disabled={savingSettings}
                  >
                    {savingSettings ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileSettings;
