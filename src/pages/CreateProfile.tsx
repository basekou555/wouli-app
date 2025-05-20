
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Avatar } from '@/components/ui/avatar';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Textarea } from '@/components/ui/textarea';
import { db } from '../firebase.config';
import { doc, setDoc } from 'firebase/firestore';
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

  useEffect(() => {
    if (form.watch('avatar')) {
      const file = form.watch('avatar')?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setAvatarPreview('');
      }
    }
  }, [form.watch('avatar')]);

  const onSubmit = async (formData: ProfileFormValues) => {
    console.log("Form data submitted:", formData);
    if (!user) return;
    
    let avatarURL = '';
    try {
      if (formData.avatar && formData.avatar.length > 0) {
        const file = formData.avatar[0];
        const avatarRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(avatarRef, file);
        avatarURL = await getDownloadURL(avatarRef);
        console.log('Avatar URL:', avatarURL);
      } else if (avatarPreview) {
        avatarURL = avatarPreview;
      }

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        avatar: avatarURL || '',
      });
        
      toast({ description: "Profile created successfully!" });
      navigate('/profile');
    } catch (error: any) {
      toast({ description: "Failed to create profile. Please try again.", variant: "destructive" });
      console.error("Error creating user document:", error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-3 py-4 md:py-0">
      <Card className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-md'}`}>
        <CardHeader>
          <CardTitle className="text-center text-lg md:text-xl">Create Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-center">
            <Avatar className="h-20 w-20 md:h-24 md:w-24">
              {avatarPreview && <img src={avatarPreview} alt="Avatar Preview" />}
            </Avatar>
          </div>
            
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 md:space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} className="h-9 md:h-10 text-sm" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Username" {...field} className="h-9 md:h-10 text-sm" />
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
                      <Textarea placeholder="A short description about yourself" {...field} className="text-sm resize-none" rows={3} />
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
              <Button type="submit" className="w-full mt-2">Create Profile</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfile;
