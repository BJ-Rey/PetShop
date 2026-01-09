# SVG Compression Script
# Compresses all SVG files in the images directory

$imageDir = "images"
$tempDir = "temp_svg"

# Create temporary directory
if (-not (Test-Path $tempDir)) {
    New-Item -ItemType Directory -Path $tempDir | Out-Null
}

# Get all SVG files
$svgFiles = Get-ChildItem -Path $imageDir -Recurse -Filter "*.svg"

# Compress each SVG file
foreach ($file in $svgFiles) {
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Remove comments
    $content = $content -replace '<!--[^>]*-->', ''
    
    # Remove extra spaces and newlines
    $content = $content -replace '\s+', ' '
    
    # Remove extra spaces between tags
    $content = $content -replace '>\s+<', '><'
    
    # Trim spaces at beginning and end
    $content = $content.Trim()
    
    # Save compressed file to temp directory
    $relativePath = $file.FullName.Substring($imageDir.Length + 1)
    $outputPath = Join-Path $tempDir $relativePath
    $outputDir = Split-Path $outputPath -Parent
    
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir | Out-Null
    }
    
    Set-Content -Path $outputPath -Value $content -Encoding UTF8
    
    Write-Host "Compressed: $($file.Name)"
}

Write-Host "
All SVG files compressed!"
Write-Host "Original file count: $($svgFiles.Count)"
