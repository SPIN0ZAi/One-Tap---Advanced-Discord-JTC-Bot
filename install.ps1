# Premium Voice Channel Manager Bot - Installation Script
# Run this in PowerShell

Write-Host "🎙️ Premium Voice Channel Manager Bot - Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
Write-Host ""

# Create .env if not exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Edit .env file with your bot token and configuration!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    Write-Host ""
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to build TypeScript" -ForegroundColor Red
    exit 1
}

Write-Host "✅ TypeScript compiled successfully!" -ForegroundColor Green
Write-Host ""

# Display next steps
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your Discord bot token" -ForegroundColor White
Write-Host "2. Get your bot token from: https://discord.com/developers/applications" -ForegroundColor White
Write-Host "3. Invite bot to your server with Administrator permission" -ForegroundColor White
Write-Host "4. Run: npm start" -ForegroundColor White
Write-Host ""
Write-Host "Quick Commands:" -ForegroundColor Yellow
Write-Host "  npm start        - Start the bot" -ForegroundColor White
Write-Host "  npm run dev      - Start in development mode" -ForegroundColor White
Write-Host "  npm run build    - Rebuild TypeScript" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  README.md            - Main documentation" -ForegroundColor White
Write-Host "  SETUP.md             - Detailed setup guide" -ForegroundColor White
Write-Host "  FEATURES.md          - Feature showcase" -ForegroundColor White
Write-Host "  CUSTOMIZATION.md     - Customization guide" -ForegroundColor White
Write-Host "  API_DOCUMENTATION.md - Developer API docs" -ForegroundColor White
Write-Host ""
Write-Host "Happy voice channel managing! 🎉" -ForegroundColor Cyan
