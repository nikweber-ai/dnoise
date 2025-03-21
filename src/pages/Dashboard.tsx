
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ImageIcon, History, Star, ChevronRight } from 'lucide-react';
import AppInfo from '@/components/AppInfo';
import LoadingSpinner from '@/components/LoadingSpinner';

import { api, GeneratedImage } from '@/services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [favorites, setFavorites] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch recent generations
          const historyResponse = await api.getGenerationHistory(user.id);
          if (historyResponse.success && historyResponse.data) {
            setRecentImages(historyResponse.data.slice(0, 4)); // Show only the latest 4
          }
          
          // Fetch favorites
          const favoritesResponse = await api.getFavorites(user.id);
          if (favoritesResponse.success && favoritesResponse.data) {
            setFavorites(favoritesResponse.data.slice(0, 4)); // Show only the first 4
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Dashboard')}</h1>
          <p className="text-muted-foreground">
            {user ? t('Welcome back, ') + (user.name || user.email) : t('Welcome to GenHub')}
          </p>
        </div>
      </div>
      
      <AppInfo />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('Generate')}
            </CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('Create new AI-generated images from text prompts')}
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link to="/generate">
                {t('Start Generating')} <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('History')}
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('View your previously generated images')}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link to="/history">
                {t('View History')} <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('Favorites')}
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('Access your saved favorite images')}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
              <Link to="/favorites">
                {t('View Favorites')} <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {loading ? (
        <div className="py-12 text-center">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Recent Generations */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{t('Recent Generations')}</h2>
              {recentImages.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/history">{t('View all')}</Link>
                </Button>
              )}
            </div>
            
            {recentImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentImages.map((image) => (
                  <Link key={image.id} to="/history" className="block group">
                    <div className="relative aspect-square overflow-hidden rounded-lg border">
                      <img 
                        src={image.url} 
                        alt={image.prompt} 
                        className="object-cover w-full h-full transition-transform group-hover:scale-105" 
                      />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-6 text-center">
                  <p className="text-muted-foreground mb-4">{t('No images generated yet')}</p>
                  <Button asChild>
                    <Link to="/generate">{t('Create your first image')}</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Favorites */}
          {favorites.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{t('Favorites')}</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/favorites">{t('View all')}</Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {favorites.map((image) => (
                  <Link key={image.id} to="/favorites" className="block group">
                    <div className="relative aspect-square overflow-hidden rounded-lg border">
                      <img 
                        src={image.url} 
                        alt={image.prompt} 
                        className="object-cover w-full h-full transition-transform group-hover:scale-105" 
                      />
                      <div className="absolute top-2 right-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
