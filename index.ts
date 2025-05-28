// Müzik Asistanı uygulaması için ortak tip tanımlamaları

// Şarkı tipi
export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  genre?: string[];
  mood?: string[];
  imageUrl?: string;
  releaseDate?: string;
  popularity?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Kullanıcı tipi
export interface User {
  id: string;
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

// Sohbet mesajı tipi
export interface ChatMessage {
  id: string;
  userId: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Sanatçı tipi
export interface Artist {
  id: string;
  name: string;
  bio?: string;
  imageUrl?: string;
  genres?: string[];
  popularity?: number;
  similar?: {
    name: string;
    imageUrl?: string;
  }[];
  topTracks?: {
    id: string;
    name: string;
    imageUrl?: string;
  }[];
  tags?: string[];
}

// Video tipi
export interface Video {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: number;
  likeCount?: number;
}

// Müzik önerisi tipi
export interface MusicRecommendation {
  id: string;
  songId: string;
  userId: string;
  reason: string;
  score: number;
  timestamp: Date;
  song?: Song;
}

// Ruh hali tipi
export type Mood = 
  | 'happy' 
  | 'sad' 
  | 'energetic' 
  | 'calm' 
  | 'romantic' 
  | 'angry' 
  | 'nostalgic'
  | 'anxious'
  | 'confident'
  | 'peaceful'
  | 'melancholic'
  | 'hopeful'
  | 'reflective'
  | 'dark'
  | 'summer'
  | 'epic'
  | 'groovy'
  | 'rebellious';

// Müzik türü tipi
export type Genre = 
  | 'pop' 
  | 'rock' 
  | 'hip-hop' 
  | 'rap'
  | 'electronic' 
  | 'dance' 
  | 'r&b' 
  | 'soul'
  | 'jazz' 
  | 'blues' 
  | 'country' 
  | 'folk'
  | 'classical' 
  | 'metal' 
  | 'indie' 
  | 'alternative'
  | 'reggae'
  | 'disco'
  | 'funk'
  | 'synth-pop'
  | 'grunge'
  | 'progressive rock'
  | 'electropop'
  | 'pop rock'
  | 'indie pop'
  | 'soft rock';

// Beyin durumu tipi (SuperAIAssistant için)
export interface BrainState {
  mood?: {
    detected: string;
    confidence: number;
  };
  topics?: {
    name: string;
    relevance: number;
  }[];
  artists?: {
    name: string;
    mentioned: boolean;
    favorite: boolean;
  }[];
  genres?: {
    name: string;
    relevance: number;
  }[];
  context?: {
    previousTopics: string[];
    continuedConversation: boolean;
    questionAsked: boolean;
  };
  intent?: {
    primary: string;
    secondary?: string;
    confidence: number;
  };
}

// Analiz sonucu tipi
export interface AnalysisResult {
  brainState: BrainState;
  recommendedResponse: string;
  suggestedSongs?: Song[];
  suggestedArtists?: string[];
}
