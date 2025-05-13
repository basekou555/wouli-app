
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Textarea } from '@/components/ui/textarea';
import { db } from '../firebase.config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileFormValues {
  name: string;
  username: string;
  bio: string;
  avatar?: FileList;
}

const CreateProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const storage = getStorage();
  const isMobile = useIsMobile();

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      username: '',
      bio: '',
      avatar: undefined,
    },
  });

  // Check if profile already exists and load data
  useEffect(() => {
    async function checkExistingProfile() {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setExistingProfile(userData);
            
            // Pre-fill form with existing data
            form.reset({
              name: userData.name || '',
              username: userData.username || '',
              bio: userData.bio || '',
            });
            
            if (userData.avatar) {
              setAvatarPreview(userData.avatar);
            }
          }
        } catch (error) {
          console.error("Error checking existing profile:", error);
        }
      }
    }
    
    checkExistingProfile();
  }, [user, form]);

  useEffect(() => {
    if (form.watch('avatar')) {
      const file = form.watch('avatar')?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }, [form.watch('avatar')]);

  const onSubmit = async (formData: ProfileFormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    let avatarURL = avatarPreview;
    
    try {
      if (formData.avatar && formData.avatar.length > 0) {
        const file = formData.avatar[0];
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, file);
        avatarURL = await getDownloadURL(avatarRef);
      }

      const profileData = {
        email: user.email,
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        avatar: avatarURL || '',
        isPublic: true,
        stats: {
          events: 0,
          friends: 0,
          photos: 0,
          organized: 0,
          participated: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, 'users', user.uid), profileData, { merge: true });
        
      toast({ 
        description: existingProfile ? "Profil mis à jour avec succès !" : "Profil créé avec succès !" 
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({ 
        variant: "destructive",
        description: existingProfile ? 
          "Échec de la mise à jour du profil. Veuillez réessayer." : 
          "Échec de la création du profil. Veuillez réessayer."
      });
      console.error("Error creating/updating user document:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <p>Vous devez être connecté pour créer un profil.</p>
            <Button className="mt-4 w-full" onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-3 py-4 md:py-0">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <CardHeader>
          <CardTitle className="text-center text-lg md:text-xl">
            {existingProfile ? "Modifier votre profil" : "Créer votre profil"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-center">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              <AvatarImage src={avatarPreview || "https://picsum.photos/200?random=profile"} alt="Avatar" />
            </Avatar>
          </div>
            
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Nom</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre nom" {...field} className="h-9 md:h-10 text-sm" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Nom d'utilisateur</FormLabel>
                    <FormControl>
                      <Input placeholder="Votre pseudo" {...field} className="h-9 md:h-10 text-sm" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Une courte description de vous" {...field} className="text-sm resize-none" rows={3} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Avatar</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => field.onChange(e.target.files)}
                        className="text-sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"/>
                    {existingProfile ? "Mise à jour..." : "Création..."}
                  </span>
                ) : (
                  existingProfile ? "Mettre à jour le profil" : "Créer votre profil"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfile;
