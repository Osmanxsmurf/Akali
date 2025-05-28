# Turkish Character Fix - PowerShell Script
# Bu script CSV dosyasındaki bozuk Türkçe karakterleri düzeltir

$inputFile = "C:\Users\pc\Desktop\music-assistant1\XATA_HAZIR.csv"
$outputFile = "C:\Users\pc\Desktop\music-assistant1\TAMAMEN_DUZGUN.csv"

# Türkçe karakter eşleştirmeleri
$replacements = @{
    'Ã¼' = 'ü'
    'Ã¶' = 'ö'
    'Ã§' = 'ç'
    'Ä±' = 'ı'
    'ÄŸ' = 'ğ'
    'Åž' = 'ş'
    'Ã‡' = 'Ç'
    'Ã–' = 'Ö'
    'Ãœ' = 'Ü'
    'Äž' = 'Ğ'
    'Ä°' = 'İ'
    'Å' = 'Ş'
    'GÃ¼lÃ¼mse' = 'Gülümse'
    'hÃ¼zÃ¼nlÃ¼' = 'hüzünlü'
    'SÄ±la' = 'Sıla'
    'SakladÄ±m' = 'Sakladım'
    'Ã–tesi' = 'Ötesi'
    'heyecanlÄ±' = 'heyecanlı'
    'morveÃ¶tesi' = 'morveötesi'
}

Write-Host "Türkçe karakter düzeltme işlemi başlatılıyor..."
Write-Host "Girdi dosyası: $inputFile"
Write-Host "Çıktı dosyası: $outputFile"

# Dosyayı UTF-8 olarak oku
$content = Get-Content -Path $inputFile -Encoding UTF8 -Raw

# Tüm bozuk karakterleri değiştir
foreach ($key in $replacements.Keys) {
    $content = $content -replace $key, $replacements[$key]
}

# Sonucu UTF-8 olarak kaydet
[System.IO.File]::WriteAllText($outputFile, $content, [System.Text.Encoding]::UTF8)

Write-Host "İşlem tamamlandı!"
Write-Host "Dosya başarıyla oluşturuldu: $outputFile"

# Dosya boyutlarını karşılaştır
$inputSize = (Get-Item -Path $inputFile).Length
$outputSize = (Get-Item -Path $outputFile).Length

Write-Host "Girdi dosyası boyutu: $($inputSize/1MB) MB"
Write-Host "Çıktı dosyası boyutu: $($outputSize/1MB) MB"
Write-Host "Fark: $(($inputSize-$outputSize)/1KB) KB"
