
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account preferences and settings
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your bookmark manager experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center text-gray-500 dark:text-gray-400">
              No preferences available at this time.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
