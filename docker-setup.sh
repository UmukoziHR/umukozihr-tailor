#!/bin/bash
# UmukoziHR Resume Tailor - Docker Setup and Run Script

set -e  # Exit on any error

echo "🐳 UmukoziHR Resume Tailor v1.2 - Docker Setup"
echo "=============================================="

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker Desktop and try again."
        exit 1
    fi
    echo "✅ Docker is running"
}

# Function to check if docker-compose is available
check_docker_compose() {
    if command -v docker-compose > /dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    elif docker compose version > /dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    else
        echo "❌ Neither docker-compose nor 'docker compose' is available"
        exit 1
    fi
    echo "✅ Using: $COMPOSE_CMD"
}

# Check prerequisites
check_docker
check_docker_compose

# Create artifacts directory if it doesn't exist
echo "📁 Creating artifacts directory..."
mkdir -p artifacts

# Copy environment variables
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    if [ -f .env.docker ]; then
        cp .env.docker .env
        echo "✅ Copied .env.docker to .env"
    else
        echo "⚠️  No .env file found, using defaults"
    fi
fi

# Build and start services
echo "🔨 Building and starting services..."
$COMPOSE_CMD down --remove-orphans
$COMPOSE_CMD build --no-cache
$COMPOSE_CMD up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."

# Check PostgreSQL
echo "Checking PostgreSQL..."
if $COMPOSE_CMD exec -T postgres pg_isready -U jason -d umukozihr-resume-tailor > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready"
else
    echo "⚠️  PostgreSQL is not ready yet, waiting..."
    sleep 5
fi

# Check Redis
echo "Checking Redis..."
if $COMPOSE_CMD exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is ready"
else
    echo "⚠️  Redis is not ready yet"
fi

# Check API
echo "Checking API..."
sleep 5
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ API is ready"
else
    echo "⚠️  API is not ready yet, checking logs..."
    $COMPOSE_CMD logs api
fi

# Final status
echo ""
echo "🎉 Docker setup complete!"
echo ""
echo "📊 Service Status:"
$COMPOSE_CMD ps

echo ""
echo "🌐 Available endpoints:"
echo "  - API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs" 
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"

echo ""
echo "🔧 Useful commands:"
echo "  View logs: $COMPOSE_CMD logs -f [service]"
echo "  Stop services: $COMPOSE_CMD down"
echo "  Restart API: $COMPOSE_CMD restart api"
echo "  Shell into API: $COMPOSE_CMD exec api bash"

echo ""
echo "🧪 Test the API:"
echo "  curl http://localhost:8000/health"