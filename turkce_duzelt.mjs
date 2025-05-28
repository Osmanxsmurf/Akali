// Tek seferde Türkçe karakter düzeltme
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules için __dirname tanımlama
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dosya yolları
const INPUT_FILE = path.join(__dirname, '../XATA_HAZIR.csv');
const OUTPUT_FILE = path.join(__dirname, '../KESIN_DUZGUN.csv');

console.log('Dosya okuma başlıyor...');
let data = fs.readFileSync(INPUT_FILE, 'utf8');
console.log('Dosya okundu, boyut:', (data.length / 1024 / 1024).toFixed(2), 'MB');

// Tüm düzeltmeleri tek seferde yap
console.log('Düzeltmeler yapılıyor...');

// Türkçe karakter düzeltmeleri
const replacements = [
  { from: 'Ã¼', to: 'ü' },
  { from: 'Ã¶', to: 'ö' },
  { from: 'Ã§', to: 'ç' },
  { from: 'Ä±', to: 'ı' },
  { from: 'ÄŸ', to: 'ğ' },
  { from: 'Åž', to: 'ş' },
  { from: 'Ã‡', to: 'Ç' },
  { from: 'Ã–', to: 'Ö' },
  { from: 'Ãœ', to: 'Ü' },
  { from: 'Äž', to: 'Ğ' },
  { from: 'Ä°', to: 'İ' },
  { from: 'hÃ¼zÃ¼nlÃ¼', to: 'hüzünlü' },
  { from: 'SÄ±la', to: 'Sıla' },
  { from: 'SakladÄ±m', to: 'Sakladım' },
  { from: 'Ã–tesi', to: 'Ötesi' },
  { from: 'heyecanlÄ±', to: 'heyecanlı' },
  { from: 'Åeyi', to: 'Şeyi' },
  { from: 'morveÃ¶tesi', to: 'morveötesi' },
  { from: 'GÃ¼lÃ¼mse', to: 'Gülümse' }
];

// Tüm değişimleri uygula
let changes = 0;
for (const { from, to } of replacements) {
  const regex = new RegExp(from, 'g');
  const initialLength = data.length;
  data = data.replace(regex, to);
  const newLength = data.length;
  
  // Değişiklik sayısını hesapla
  const changeCount = (initialLength - newLength) / (from.length - to.length);
  if (changeCount > 0) {
    changes += changeCount;
    console.log(`${from} -> ${to}: ${changeCount} değişiklik yapıldı`);
  }
}

console.log(`Toplam ${changes} değişiklik yapıldı.`);
console.log('Dosya kaydediliyor...');

// Sonucu kaydet
fs.writeFileSync(OUTPUT_FILE, data, 'utf8');
console.log(`Dosya kaydedildi: ${OUTPUT_FILE}`);

// Boyut raporu
const inputSize = fs.statSync(INPUT_FILE).size;
const outputSize = fs.statSync(OUTPUT_FILE).size;
console.log(`Orijinal boyut: ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Yeni boyut: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`Fark: ${((inputSize - outputSize) / 1024).toFixed(2)} KB`);
