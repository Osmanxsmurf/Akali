/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_YOUTUBE_API_KEY: string;
  readonly VITE_LASTFM_API_KEY: string;
  readonly VITE_XATA_API_KEY: string;
  readonly VITE_XATA_DATABASE_URL?: string;
  // Add other environment variables here if you have them
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
