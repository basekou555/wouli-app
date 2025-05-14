
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileSettings from '../components/profile/ProfileSettings';
import EventTabs from '../components/profile/EventTabs';
import { useAuth } from '../context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import EmptyProfileState from '@/components/profile/EmptyProfileState';
import ErrorState from '@/components/profile/ErrorState';
import AuthRequiredState from '@/components/profile/AuthRequiredState';
import { useProfileData } from '@/hooks/useProfileData';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showSettings, setShowSettings] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const {
    userProfile,
    events,
    isNewAccount,
    loadingProfile,
    loadingEvents,
    error,
    refreshProfile
  } = useProfileData();

  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleEditProfile = () => {
    navigate('/create-profile');
  };

  // User is not authenticated
  if (!user) {
    return (
      <AppLayout>
        <AuthRequiredState onNavigateHome={() => navigate('/')} />
      </AppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AppLayout>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </AppLayout>
    );
  }

  // Loading state
  if (loadingProfile) {
    return (
      <AppLayout>
        <ProfileSkeleton />
      </AppLayout>
    );
  }

  // No profile state
  if (!userProfile) {
    return (
      <AppLayout>
        <EmptyProfileState onCreateProfile={() => navigate('/create-profile')} />
      </AppLayout>
    );
  }

  // Render profile with data
  return (
    <AppLayout>
      <div className={`py-4 md:py-6 space-y-4 md:space-y-8 ${isMobile ? 'px-1' : ''}`}>
        <ProfileHeader 
          userProfile={userProfile} 
          toggleSettings={toggleSettings}
          onEditProfile={handleEditProfile}
          isMobile={isMobile}
        />
        
        {showSettings ? (
          <ProfileSettings userProfile={userProfile} />
        ) : (
          <EventTabs 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isNewAccount={isNewAccount}
            upcomingEvents={events.upcoming}
            pastEvents={events.past}
            organizedEvents={events.organized}
            isMobile={isMobile}
            isLoading={loadingEvents}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Profile;
