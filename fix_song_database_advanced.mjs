// ES Modules formatında veritabanı temizleme script'i
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import { decode } from 'html-entities';

// __dirname'i ES Modules için tanımla
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Giriş ve çıkış dosya yolları
const INPUT_FILE = path.join(__dirname, '../all_songs_merged.json');
const OUTPUT_FILE = path.join(__dirname, '../all_songs_clean.json');
const ERROR_LOG_FILE = path.join(__dirname, '../song_fix_errors.log');
const CORRECTION_LOG_FILE = path.join(__dirname, '../song_corrections.log');

// API anahtarları (opsiyonel kullanım için)
const LASTFM_API_KEY = process.env.LASTFM_API_KEY || 'BURAYA_LASTFM_API_ANAHTARINIZI_YAZIN';
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'BURAYA_YOUTUBE_API_ANAHTARINIZI_YAZIN';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

// Düzeltme kayıtlarını tutmak için dosya oluştur
fs.writeFileSync(CORRECTION_LOG_FILE, 'Yapılan Düzeltmeler:\n', 'utf8');
fs.writeFileSync(ERROR_LOG_FILE, 'Hata Kayıtları:\n', 'utf8');

// Türkçe karakter düzeltmeleri için eşleştirmeler
const turkishCharacterMap = {
  'Ã¼': 'ü',
  'Ã¶': 'ö',
  'Ã§': 'ç',
  'Ä±': 'ı',
  'ÄŸ': 'ğ',
  'Åž': 'ş',
  'Ã‡': 'Ç',
  'Ã–': 'Ö',
  'Ãœ': 'Ü',
  'Äž': 'Ğ',
  'Ä°': 'İ',
  'Åž': 'Ş'
};

// Bilinen yanlış eşleştirmeler ve düzeltmeleri
const knownIncorrectMappings = {
  // Şarkı adı -> {doğru sanatçı, doğru tür}
  'Sarı Aşk Gel': { artist: 'Gülşen', genre: 'Turkish Pop' },
  'Son Gökyüzü Yap': { artist: 'Duman', genre: 'Turkish Rock' },
  'Derin Göneş Bul': { artist: 'Model', genre: 'Turkish Rock' },
  'Yığdım Aslanım 6478': { artist: 'Barış Manço', genre: 'Turkish Folk' },
  'Hızlı Yağmur Dinle': { artist: 'Manga', genre: 'Turkish Rock' }
  // Daha fazla yanlış eşleştirme buraya eklenebilir
};

// Türkçe şarkı ve sanatçı listeleri (Türkçe olup olmadığını belirlemek için)
const turkishArtists = [
  'Tarkan', 'Sezen Aksu', 'Gülşen', 'Murat Boz', 'Manga', 'Duman', 'Model', 'Barış Manço', 
  'Teoman', 'Şebnem Ferah', 'Sıla', 'Ceza', 'Kenan Doğulu', 'Ajda Pekkan', 'Mustafa Sandal',
  'Mabel Matiz', 'Yüksek Sadakat', 'Hadise', 'Athena', 'Yalın', 'Mor ve Ötesi', 'Gripin',
  'Demet Akalın', 'Orhan Gencebay', 'İbrahim Tatlıses', 'Hande Yener', 'Nil Karaibrahimgil',
  'Emir', 'Gökhan Türkmen', 'Yaşar', 'Ebru Gündeş', 'Müslüm Gürses', 'Ferdi Tayfur',
  'Bülent Ersoy', 'Emre Aydın', 'Sertab Erener', 'Buray'
];

// Müzik türlerinin standartlaştırılması
const genreMapping = {
  'pop': 'Pop',
  'türkçe pop': 'Turkish Pop',
  'turkish pop': 'Turkish Pop',
  'rock': 'Rock',
  'türk rock': 'Turkish Rock',
  'turkish rock': 'Turkish Rock',
  'rap': 'Hip Hop',
  'hip hop': 'Hip Hop',
  'hip-hop': 'Hip Hop',
  'klasik': 'Classical',
  'classical': 'Classical',
  'jazz': 'Jazz',
  'blues': 'Blues',
  'elektronik': 'Electronic',
  'electronic': 'Electronic',
  'dance': 'Electronic',
  'folk': 'Folk',
  'türk halk': 'Turkish Folk',
  'turkish folk': 'Turkish Folk',
  'r&b': 'R&B',
  'rnb': 'R&B',
  'soul': 'Soul',
  'funk': 'Funk',
  'indie': 'Indie',
  'alternative': 'Alternative',
  'metal': 'Metal',
  'arabesk': 'Arabesk',
  'soundtrack': 'Soundtrack',
  'film müziği': 'Soundtrack'
};

// Mood bilgileri ve buna uygun valence, arousal, dominance değerleri
const moodDefinitions = {
  'mutlu': { valence: [0.7, 0.9], arousal: [0.6, 0.8], dominance: [0.6, 0.8] },
  'heyecanlı': { valence: [0.6, 0.8], arousal: [0.7, 0.9], dominance: [0.6, 0.8] },
  'enerjik': { valence: [0.6, 0.8], arousal: [0.8, 1.0], dominance: [0.7, 0.9] },
  'sakin': { valence: [0.4, 0.6], arousal: [0.2, 0.4], dominance: [0.4, 0.6] },
  'huzurlu': { valence: [0.6, 0.8], arousal: [0.2, 0.4], dominance: [0.5, 0.7] },
  'romantik': { valence: [0.6, 0.8], arousal: [0.4, 0.6], dominance: [0.5, 0.7] },
  'melankoli': { valence: [0.3, 0.5], arousal: [0.3, 0.5], dominance: [0.3, 0.5] },
  'nostaljik': { valence: [0.4, 0.6], arousal: [0.3, 0.5], dominance: [0.4, 0.6] },
  'üzgün': { valence: [0.2, 0.4], arousal: [0.3, 0.5], dominance: [0.3, 0.5] },
  'hüzünlü': { valence: [0.2, 0.4], arousal: [0.3, 0.5], dominance: [0.3, 0.5] },
  'kızgın': { valence: [0.2, 0.4], arousal: [0.7, 0.9], dominance: [0.6, 0.8] },
  'agresif': { valence: [0.3, 0.5], arousal: [0.7, 0.9], dominance: [0.7, 0.9] },
  'motivasyonel': { valence: [0.7, 0.9], arousal: [0.7, 0.9], dominance: [0.8, 1.0] },
  'kararlı': { valence: [0.6, 0.8], arousal: [0.6, 0.8], dominance: [0.8, 1.0] },
  'güçlü': { valence: [0.6, 0.8], arousal: [0.7, 0.9], dominance: [0.8, 1.0] },
  'dingin': { valence: [0.5, 0.7], arousal: [0.2, 0.4], dominance: [0.5, 0.7] }
};

// Müzik türüne göre olası mood'lar
const genreMoodAssociations = {
  'Pop': ['mutlu', 'enerjik', 'romantik'],
  'Turkish Pop': ['mutlu', 'heyecanlı', 'romantik', 'nostaljik', 'hüzünlü'],
  'Rock': ['enerjik', 'kızgın', 'güçlü', 'melankoli'],
  'Turkish Rock': ['enerjik', 'hüzünlü', 'nostaljik', 'kararlı'],
  'Hip Hop': ['enerjik', 'agresif', 'güçlü', 'motivasyonel'],
  'Turkish Hip-Hop': ['agresif', 'motivasyonel', 'heyecanlı'],
  'Classical': ['sakin', 'huzurlu', 'dingin', 'melankoli'],
  'Electronic': ['enerjik', 'heyecanlı', 'motivasyonel'],
  'Folk': ['nostaljik', 'huzurlu', 'sakin'],
  'Turkish Folk': ['nostaljik', 'hüzünlü', 'huzurlu'],
  'R&B': ['romantik', 'sakin', 'dingin'],
  'Arabesk': ['hüzünlü', 'melankoli', 'nostaljik']
};

/**
 * Belirli bir aralıkta rastgele sayı üretir
 */
function getRandomInRange(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}

/**
 * Türkçe karakter sorunlarını düzeltir
 */
function fixTurkishCharacters(text) {
  if (!text || typeof text !== 'string') return text;
  
  // HTML karakter kodlarını çöz
  let fixedText = decode(text);
  
  // Özel Türkçe karakter eşleştirmelerini uygula
  Object.keys(turkishCharacterMap).forEach(incorrectChar => {
    const correctChar = turkishCharacterMap[incorrectChar];
    fixedText = fixedText.replace(new RegExp(incorrectChar, 'g'), correctChar);
  });
  
  return fixedText;
}

/**
 * Şarkının Türkçe olup olmadığını belirler
 */
function isTurkishSong(song) {
  // Sanatçı Türkçe listesinde mi?
  if (song.artist && turkishArtists.some(artist => 
    song.artist.toLowerCase().includes(artist.toLowerCase()))) {
    return true;
  }
  
  // Tür "Turkish" içeriyor mu?
  if (song.genre && song.genre.toLowerCase().includes('turkish')) {
    return true;
  }
  
  // Türkçe karakterler içeriyor mu?
  const turkishChars = ['ç', 'ğ', 'ı', 'ö', 'ş', 'ü', 'Ç', 'Ğ', 'İ', 'Ö', 'Ş', 'Ü'];
  if (song.title && turkishChars.some(char => song.title.includes(char))) {
    return true;
  }
  
  return false;
}

/**
 * Bilinen yanlış eşleştirmeleri düzeltir
 */
function fixKnownMismatches(song) {
  const originalSong = {...song};
  
  if (song.title && knownIncorrectMappings[song.title]) {
    const correction = knownIncorrectMappings[song.title];
    
    if (correction.artist && song.artist !== correction.artist) {
      fs.appendFileSync(CORRECTION_LOG_FILE, 
        `Sanatçı düzeltildi: "${song.title}" şarkısı - "${song.artist}" yerine "${correction.artist}"\n`);
      song.artist = correction.artist;
    }
    
    if (correction.genre && song.genre !== correction.genre) {
      fs.appendFileSync(CORRECTION_LOG_FILE, 
        `Tür düzeltildi: "${song.title}" şarkısı - "${song.genre}" yerine "${correction.genre}"\n`);
      song.genre = correction.genre;
    }
  }
  
  return song;
}

/**
 * Müzik türünü standartlaştırır
 */
function standardizeGenre(genre) {
  if (!genre) return 'Unknown';
  
  const lowerGenre = genre.toLowerCase().trim();
  return genreMapping[lowerGenre] || genre;
}

/**
 * Şarkının ruh haline göre uygun valence, arousal, dominance değerleri atar
 */
function assignMoodValues(song) {
  // Mevcut mood değerini kontrol et
  let moodKey = null;
  
  if (song.mood && Array.isArray(song.mood) && song.mood.length > 0) {
    moodKey = song.mood[0].toLowerCase();
  }
  
  // Mood değeri yoksa veya tanımlı değilse, tür bazlı atama yap
  if (!moodKey || !moodDefinitions[moodKey]) {
    const genre = song.genre || 'Pop';
    const possibleMoods = genreMoodAssociations[genre] || genreMoodAssociations['Pop'];
    moodKey = possibleMoods[Math.floor(Math.random() * possibleMoods.length)];
    song.mood = [moodKey];
  }
  
  // Mood bazlı değerler ata
  const moodRanges = moodDefinitions[moodKey] || moodDefinitions['mutlu'];
  
  song.valence = getRandomInRange(moodRanges.valence[0], moodRanges.valence[1]);
  song.arousal = getRandomInRange(moodRanges.arousal[0], moodRanges.arousal[1]);
  song.dominance = getRandomInRange(moodRanges.dominance[0], moodRanges.dominance[1]);
  
  return song;
}

/**
 * YouTube ID'sini URL'den çıkarır
 */
function extractYoutubeId(url) {
  if (!url) return null;
  
  // YouTube URL formatları
  const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
}

/**
 * Şarkıyı temizler ve zenginleştirir
 */
function cleanAndEnrichSong(song, index) {
  try {
    // 1. Türkçe karakter düzeltmeleri
    if (song.title) song.title = fixTurkishCharacters(song.title);
    if (song.artist) song.artist = fixTurkishCharacters(song.artist);
    if (song.album) song.album = fixTurkishCharacters(song.album);
    
    // 2. Bilinen yanlış eşleştirmeleri düzelt
    song = fixKnownMismatches(song);
    
    // 3. Tür standardizasyonu
    if (song.genre) song.genre = standardizeGenre(song.genre);
    
    // 4. Şarkının Türkçe olup olmadığını belirle
    song.isTurkish = isTurkishSong(song);
    
    // 5. Ruh hali ve duygu değerlerini ayarla
    song = assignMoodValues(song);
    
    // 6. YouTube bilgilerini düzenle
    if (song.youtubeUrl && !song.youtubeId) {
      song.youtubeId = extractYoutubeId(song.youtubeUrl);
    }
    
    if (song.youtubeId && !song.youtubeUrl) {
      song.youtubeUrl = `https://www.youtube.com/watch?v=${song.youtubeId}`;
    }
    
    // 7. Kapak resmi yoksa ve YouTube ID varsa ekle
    if (!song.coverUrl && song.youtubeId) {
      song.coverUrl = `https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`;
    }
    
    // 8. ID'yi kontrol et, yoksa ekle
    if (!song.id) {
      song.id = `song_${index}_${Date.now()}`;
    }
    
    // 9. xata_id ekle veya güncelle
    song.xata_id = song.xata_id || `xata_${index}`;
    
    return song;
  } catch (error) {
    fs.appendFileSync(ERROR_LOG_FILE, `Şarkı işlenirken hata: ${song.title} - ${error.message}\n`);
    return song;
  }
}

/**
 * Ana işlem fonksiyonu
 */
async function processDatabase() {
  console.log('Şarkı veritabanı temizleme ve zenginleştirme işlemi başlatılıyor...');
  
  try {
    // 1. Giriş dosyasını oku
    const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
    const songData = JSON.parse(rawData);
    
    if (!songData.songs || !Array.isArray(songData.songs)) {
      throw new Error('Geçersiz veri formatı: "songs" dizisi bulunamadı.');
    }
    
    const totalSongs = songData.songs.length;
    console.log(`Toplam ${totalSongs} şarkı işlenecek.`);
    
    // 2. Her şarkıyı işle
    const cleanedSongs = [];
    
    for (let i = 0; i < songData.songs.length; i++) {
      const song = songData.songs[i];
      
      if (i % 100 === 0) {
        console.log(`İşleniyor: ${i}/${totalSongs} (${Math.round((i/totalSongs)*100)}%)`);
      }
      
      try {
        const cleanedSong = cleanAndEnrichSong(song, i);
        cleanedSongs.push(cleanedSong);
      } catch (error) {
        console.error(`Şarkı işlenirken hata:`, error.message);
        fs.appendFileSync(ERROR_LOG_FILE, 
          `Şarkı işleme hatası: ${JSON.stringify(song)}: ${error.message}\n`);
        
        cleanedSongs.push(song);
      }
    }
    
    // 3. Sonuçları kaydet
    const outputData = { songs: cleanedSongs };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf8');
    
    console.log(`İşlem tamamlandı! Temizlenmiş veri ${OUTPUT_FILE} dosyasına kaydedildi.`);
    console.log(`Düzeltmeler ${CORRECTION_LOG_FILE} dosyasına kaydedildi.`);
    console.log(`Hatalar ${ERROR_LOG_FILE} dosyasına kaydedildi.`);
    
  } catch (error) {
    console.error('Kritik hata:', error.message);
    fs.appendFileSync(ERROR_LOG_FILE, `Kritik hata: ${error.message}\n`);
  }
}

// Başlatma
processDatabase();
