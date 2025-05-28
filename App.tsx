import React, { useEffect } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import HomePage from '@/pages/HomePage';
import ArtistPage from '@/pages/ArtistPage';
import AIPage from '@/pages/AIPage';
import { ThemeProvider } from '@/components/ThemeProvider';

function App() {
  // Sayfa değişikliklerinde sayfanın en üstüne kaydır
  const [location] = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <ThemeProvider defaultTheme="dark" storageKey="music-assistant-theme">
      <div className="min-h-screen bg-background text-foreground">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/artist" component={ArtistPage} />
          <Route path="/ai" component={AIPage} />
          <Route>
            {/* 404 Sayfası */}
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Sayfa Bulunamadı</h1>
              <p className="text-muted-foreground mb-8">
                Aradığınız sayfa mevcut değil veya taşınmış olabilir.
              </p>
              <a 
                href="/"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Ana Sayfaya Dön
              </a>
            </div>
          </Route>
        </Switch>
      </div>
    </ThemeProvider>
  );
}

export default App;
