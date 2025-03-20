
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useModelSelection } from '@/hooks/useModels';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { useFavorites } from '@/hooks/useFavorites';
import { CreditCard, Clock, Image as ImageIcon, Zap, User, UserPlus, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const { userModels, isLoading: isLoadingModels } = useModelSelection();
  const { useGenerationHistory } = useImageGeneration();
  const { toggleFavorite, useFavoriteImages } = useFavorites();
  const { data: generationHistory, isLoading: isLoadingHistory } = useGenerationHistory();
  const { data: favoriteImages, isLoading: isLoadingFavorites } = useFavoriteImages();

  // Get system settings from localStorage if available
  const systemSettings = React.useMemo(() => {
    const settings = localStorage.getItem('systemSettings');
    return settings ? JSON.parse(settings) : null;
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate next credit reset date
  const getNextResetDate = () => {
    if (!systemSettings?.creditRolloverEnabled) {
      return user?.creditsReset || 'Not scheduled';
    }
    
    const now = new Date();
    const resetDay = systemSettings?.creditResetDay || 1;
    
    // Create date for this month's reset day
    let resetDate = new Date(now.getFullYear(), now.getMonth(), resetDay);
    
    // If we're past this month's reset day, move to next month
    if (now > resetDate) {
      resetDate = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
    }
    
    return formatDate(resetDate.toISOString());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back{user?.name ? `, ${user.name}` : ''}! Here's an overview of your account.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Credits Available</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.credits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemSettings?.creditRolloverEnabled ? 
                `Next rollover: ${getNextResetDate()}` : 
                `Credits reset: ${user?.creditsReset ? formatDate(user.creditsReset) : 'N/A'}`}
            </p>
            {systemSettings?.creditRolloverEnabled && (
              <p className="text-xs text-muted-foreground mt-1">
                {systemSettings.monthlyCredits} credits per month
              </p>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Models Available</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingModels ? '...' : userModels?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {userModels && userModels.length > 0 
                ? `Including ${userModels[0].name}`
                : 'No models available'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Images Generated</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingHistory ? '...' : generationHistory?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {generationHistory && generationHistory.length > 0 
                ? `Last generated ${formatDate(generationHistory[0].createdAt)}`
                : 'No images generated yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Favorite Images</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingFavorites ? '...' : favoriteImages?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {favoriteImages && favoriteImages.length > 0 
                ? `Last favorited: ${formatDate(favoriteImages[0].createdAt)}`
                : 'No favorites yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Generations</CardTitle>
            <CardDescription>
              Your latest image generations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin-slow">
                  <div className="h-6 w-6 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
                </div>
              </div>
            ) : generationHistory && generationHistory.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {generationHistory.slice(0, 6).map((image) => (
                  <div key={image.id} className="relative aspect-square rounded-md overflow-hidden group">
                    <img 
                      src={image.url} 
                      alt={image.prompt} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={() => toggleFavorite(image.id)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full transition-colors hover:bg-black/70"
                    >
                      <Star className={`h-4 w-4 ${image.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                You haven't generated any images yet
              </div>
            )}
            
            <div className="mt-4 flex justify-center">
              <Link to="/history">
                <Button variant="outline">View all images</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with these common tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/generate">
              <Button className="w-full">
                <ImageIcon className="mr-2 h-4 w-4" />
                Generate New Image
              </Button>
            </Link>
            
            <Link to="/history">
              <Button variant="outline" className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                View Generation History
              </Button>
            </Link>
            
            <Link to="/favorites">
              <Button variant="outline" className="w-full">
                <Star className="mr-2 h-4 w-4" />
                View Favorites
              </Button>
            </Link>
            
            <Link to="/profile">
              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
            
            {user?.isAdmin && (
              <Link to="/admin/users">
                <Button variant="outline" className="w-full">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
