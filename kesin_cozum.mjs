// Kesin Türkçe Karakter Düzeltme Çözümü
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// __dirname'i ES Modules için tanımla
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dosya yolları
const INPUT_FILE = path.resolve(__dirname, '../XATA_HAZIR.csv');
const OUTPUT_FILE = path.resolve(__dirname, '../XATA_FINAL.csv');

// Bozuk UTF-8 karakter eşleştirmeleri
const turkishFixes = {
  // Genellikle bozuk olan karakter dizileri
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
  'Åž': 'Ş',
  
  // Özel durumlar için ek eşleştirmeler
  'GÃ¼lÃ¼mse': 'Gülümse',
  'hÃ¼zÃ¼nlÃ¼': 'hüzünlü',
  'SÄ±la': 'Sıla',
  'SakladÄ±m': 'Sakladım',
  'Ã–tesi': 'Ötesi',
  'heyecanlÄ±': 'heyecanlı',
  'Åeyi': 'Şeyi',
  'morveÃ¶tesi': 'morveötesi'
};

// Tek seferde tüm karakter düzeltmelerini uygula
function fixTurkishChars(text) {
  if (!text) return text;
  
  let fixed = text;
  // Önce özel durum eşleştirmelerini kontrol et
  Object.keys(turkishFixes).forEach(incorrect => {
    if (fixed.includes(incorrect)) {
      fixed = fixed.replace(new RegExp(incorrect, 'g'), turkishFixes[incorrect]);
    }
  });
  
  return fixed;
}

async function processCSV() {
  console.log('Türkçe karakter düzeltme işlemi başlatılıyor...');
  
  const readStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf8' });
  const writeStream = fs.createWriteStream(OUTPUT_FILE, { encoding: 'utf8' });
  
  // CSV'yi satır satır işle
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });
  
  let lineCount = 0;
  let fixedCount = 0;
  
  for await (const line of rl) {
    lineCount++;
    
    // İlk satırı (başlıklar) değiştirmeden geçir
    if (lineCount === 1) {
      writeStream.write(line + '\n');
      continue;
    }
    
    // CSV alanlarını ayır
    const columns = line.split(',');
    
    // Şarkı adı, sanatçı ve ruh hali gibi metin alanlarını düzelt
    if (columns.length >= 3) {
      const titleIndex = 2;  // title sütunu
      const artistIndex = 3; // artist sütunu
      const moodIndex = 11;  // mood sütunu
      
      // Başlık düzeltme
      if (columns[titleIndex]) {
        const originalTitle = columns[titleIndex];
        columns[titleIndex] = fixTurkishChars(originalTitle);
        if (originalTitle !== columns[titleIndex]) fixedCount++;
      }
      
      // Sanatçı düzeltme
      if (columns[artistIndex]) {
        const originalArtist = columns[artistIndex];
        columns[artistIndex] = fixTurkishChars(originalArtist);
        if (originalArtist !== columns[artistIndex]) fixedCount++;
      }
      
      // Ruh hali düzeltme
      if (columns[moodIndex]) {
        const originalMood = columns[moodIndex];
        columns[moodIndex] = fixTurkishChars(originalMood);
        if (originalMood !== columns[moodIndex]) fixedCount++;
      }
    }
    
    // Satırı tekrar birleştir ve yaz
    writeStream.write(columns.join(',') + '\n');
    
    // Her 100,000 satırda bir ilerleme raporu
    if (lineCount % 100000 === 0) {
      console.log(`${lineCount.toLocaleString()} satır işlendi, ${fixedCount.toLocaleString()} düzeltme yapıldı.`);
    }
  }
  
  console.log(`\nİşlem tamamlandı!`);
  console.log(`Toplam ${lineCount.toLocaleString()} satır işlendi.`);
  console.log(`Toplam ${fixedCount.toLocaleString()} karakter düzeltmesi yapıldı.`);
  console.log(`Sonuç dosyası: ${OUTPUT_FILE}`);
}

// İşlemi başlat
processCSV().catch(err => {
  console.error('Hata oluştu:', err);
});
