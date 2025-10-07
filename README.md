# Image Cropper Backend

## Quick Start

### Prerequisites
- **Node.js** (v20 or higher)
- **npm** (comes with Node.js)
- **PostgreSQL** (or Docker for containerized database)

### Installation
```bash
# Clone the repository
git clone https://github.com/Tarik998/image-cropper-backend.git
cd image-cropper-backend

# Install dependencies
npm install
```

## Environment Setup
create .env file in the root directory

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgers
DB_PASSWORD=your_password
DB_NAME=image_cropper
PORT=5001   
DB_SSL=false

NODE_ENV=production
CORS_ORIGIN=http://localhost:4200

## Development

### Method 1: With Local PostgreSQL
```bash
# Make sure PostgreSQL is running
# Create database: image_cropper_db
createdb image_cropper_db

# Start the server
npm start
# or
npm run dev  # with nodemon for auto-restart
```

### Method 2: With Docker Compose (Full Stack)
```bash
# Navigate to frontend directory and run
cd ../image-cropper-frontend
docker-compose up --build

# This starts:
# - PostgreSQL database
# - Backend API (this project)
# - Frontend application
```

### Docker Setup
The database schema is automatically applied when using docker-compose.


#### **Automatic Execution**
Server startup runs migrations automatically:
```javascript
// In server.js - happens every time you start the app
app.listen(PORT, async () => {
  const migrationRunner = new MigrationRunner();
  await migrationRunner.runMigrations(); // ← Automatic!
  console.log('Database migrations completed successfully');
});
```

#### **Reset Local Development Database**
```bash
# Complete reset (loses all data)
docker-compose down -v  # Removes database volume
docker-compose up database -d  # Fresh database
npm run migration:run   # Apply all migrations from scratch
```


## API Endpoints

```bash
GET    /api/configs          # Get all configurations
GET    /api/config/:id       # Get specific configuration
POST   /api/config          # Create/update configuration
DELETE /api/config/:id      # Delete configuration
```

## Available Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm test               # Run tests
npm run lint           # Run code linting
```

# Start server
npm start

## Live API

The API is deployed and accessible at:
**https://image-cropper-backend-332772182253.us-central1.run.app**

### Deployment Details
- **Platform:** Google Cloud Run
- **Region:** us-central1 (Iowa)
- **Database:** Google Cloud SQL (PostgreSQL)
- **Environment:** Production
- **SSL:** Enabled (automatic HTTPS)

### API Base URL
All endpoints are prefixed with: `https://image-cropper-backend-332772182253.us-central1.run.app/api`
