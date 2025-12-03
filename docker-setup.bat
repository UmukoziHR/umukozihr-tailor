@echo off
echo 🐳 UmukoziHR Resume Tailor v1.2 - Docker Setup
echo ==============================================

:: Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo ✅ Docker is running

:: Create artifacts directory
echo 📁 Creating artifacts directory...
if not exist artifacts mkdir artifacts

:: Copy environment file
echo 🔧 Setting up environment...
if not exist .env (
    if exist .env.docker (
        copy .env.docker .env
        echo ✅ Copied .env.docker to .env
    ) else (
        echo ⚠️  No .env file found, using defaults
    )
)

:: Build and start services
echo 🔨 Building and starting services...
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

:: Wait for services
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

:: Check service health
echo 🔍 Checking service health...
timeout /t 5 /nobreak >nul

:: Test API
echo 🧪 Testing API...
curl -s http://localhost:8000/health
if %errorlevel% equ 0 (
    echo ✅ API is ready
) else (
    echo ⚠️  API is not ready yet
)

echo.
echo 🎉 Docker setup complete!
echo.
echo 🌐 Available endpoints:
echo   - API: http://localhost:8000
echo   - API Docs: http://localhost:8000/docs
echo   - PostgreSQL: localhost:5432
echo   - Redis: localhost:6379
echo.
echo 🔧 Useful commands:
echo   View logs: docker-compose logs -f [service]
echo   Stop services: docker-compose down
echo   Restart API: docker-compose restart api
echo.

pause