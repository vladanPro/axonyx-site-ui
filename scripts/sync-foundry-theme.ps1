$ErrorActionPreference = 'Stop'
$siteRoot = Split-Path $PSScriptRoot -Parent
# Component CSS comes from axonyx-ui; only version site-owned assets.
$assets = @('foundry-docs.css','foundry-pilot.css','js/foundry-pilot.js','js/ui-site.js')
foreach ($relative in @('app/page.ax','app/layout.ax','app/docs/theming/page.ax')) {
  $file = Join-Path $siteRoot $relative
  $text = [IO.File]::ReadAllText($file)
  foreach ($asset in $assets) {
    $hash = (Get-FileHash (Join-Path $siteRoot "public/$asset") -Algorithm SHA256).Hash.Substring(0,12).ToLowerInvariant()
    $pattern = '/' + [regex]::Escape($asset) + '(?:\?v=[a-zA-Z0-9.-]+)?'
    $text = [regex]::Replace($text, $pattern, "/$asset`?v=$hash")
  }
  [IO.File]::WriteAllText($file, $text, [Text.UTF8Encoding]::new($false))
}
Write-Output 'Site asset URLs versioned; Foundry CSS is supplied by Cargo.'
