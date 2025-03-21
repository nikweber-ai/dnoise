
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Sparkles, History as HistoryIcon, Star } from 'lucide-react';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { useFavorites } from '@/hooks/useFavorites';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { useGenerationHistory } = useImageGeneration();
  const { useFavoriteImages } = useFavorites();
  
  // Call the query hooks to get the data
  const { data: images } = useGenerationHistory();
  const { data: favoriteImages } = useFavoriteImages();

  if (!user) return null;

  // Get recent generations and favorite count
  const recentGenerations = images?.slice(0, 4) || [];
  const favoriteCount = favoriteImages?.length || 0;

  // Function to truncate prompt text
  const truncatePrompt = (prompt: string, maxLength = 50) => {
    if (prompt.length <= maxLength) return prompt;
    return prompt.substring(0, maxLength) + '...';
  };

  // Function to get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="fade-in-element space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome{user.name ? `, ${user.name}` : ''}!</h1>
          <p className="text-muted-foreground mt-2">
            Start generating images or explore your recent creations.
          </p>
        </div>
        <Button onClick={() => navigate('/generate')} size="lg">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Generation
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/40 backdrop-blur-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Create</CardTitle>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Generate new AI images with detailed prompts and settings
            </p>
            <Button 
              onClick={() => navigate('/generate')} 
              className="w-full"
              variant="default"
            >
              Start Generating
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">History</CardTitle>
            <HistoryIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Browse your previous image generations and reuse prompts
            </p>
            <Button 
              onClick={() => navigate('/history')} 
              className="w-full"
              variant="outline"
            >
              View History
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Favorites</CardTitle>
            <Star className="h-5 w-5 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access your saved favorite generations with {favoriteCount} saved items
            </p>
            <Button 
              onClick={() => navigate('/favorites')} 
              className="w-full"
              variant="outline"
            >
              View Favorites
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Generations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent Generations</h2>
          <Button variant="ghost" onClick={() => navigate('/history')} size="sm">
            View All
          </Button>
        </div>
        
        {recentGenerations.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {recentGenerations.map((image) => (
              <Card key={image.id} className="overflow-hidden bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <div className="aspect-square w-full overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.prompt} 
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                </div>
                <CardContent className="p-3">
                  <p className="text-xs text-muted-foreground truncate">
                    {truncatePrompt(image.prompt)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm">
            <p className="text-muted-foreground mb-4">You haven't generated any images yet</p>
            <Button onClick={() => navigate('/generate')}>Create Your First Image</Button>
          </Card>
        )}
      </div>

      {/* Profile Summary */}
      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar className="h-10 w-10">
              {user.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user.name || user.email || 'User'} />
              ) : (
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-medium">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
              {isAdmin && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                  Admin
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
