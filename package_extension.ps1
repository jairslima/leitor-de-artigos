$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$dist = Join-Path $root "dist"
$staging = Join-Path $dist "LeitorDeArtigos"
$zipPath = Join-Path $dist "LeitorDeArtigos.zip"

if (Test-Path $staging) {
  Remove-Item -LiteralPath $staging -Recurse -Force
}

if (Test-Path $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

New-Item -ItemType Directory -Force -Path $staging | Out-Null

$include = @(
  "manifest.json",
  "background.js",
  "content.js",
  "reader.css",
  "icons"
)

foreach ($item in $include) {
  Copy-Item -LiteralPath (Join-Path $root $item) -Destination $staging -Recurse -Force
}

Compress-Archive -Path (Join-Path $staging "*") -DestinationPath $zipPath -Force

Write-Output "Pacote gerado em: $zipPath"
