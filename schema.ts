// Defines the shared data structures for the application

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  bpm?: number;          // Tempo bilgisi
  year?: number;         // Şarkı yılı
  genre?: string[];
  mood?: string[];
  imageUrl?: string;     // Şarkı görseli URL
  releaseDate?: string;  // Yayınlanma tarihi
  popularity?: number;   // Popülerlik puanı
  instrumental?: boolean; // Enstrümantal mı
  energy?: number;       // Enerji seviyesi (0-1 arası)
  danceability?: number; // Dans edilebilirlik (0-1 arası)
  acousticness?: number; // Akustiklik seviyesi (0-1 arası)
  createdAt: Date;
  updatedAt: Date;
  youtubeId?: string;    // YouTube video ID
  youtubeUrl?: string;   // YouTube video URL
  audioUrl?: string;     // Ses dosyası URL
  coverImage?: string;   // Kapağı görseli (imageUrl ile aynı ama tutarlılık için)
}

export interface User {
  id:string;
  name: string;
  email: string;
  imageUrl?: string;
  preferences?: {
    favoriteGenres?: string[];
    favoriteMoods?: string[];
    favoriteArtists?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Add any other shared types/interfaces here
