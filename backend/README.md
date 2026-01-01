# Employee Duty Management System - Backend

## Setup Instructions

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   - Copy `.env` and update with your actual values
   - Get MongoDB Atlas connection string
   - Generate a secure JWT secret

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Start Production Server:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register supervisor
- `POST /api/auth/login` - Login supervisor
- `POST /api/auth/google-login` - Google login (placeholder)

### Employees (Protected Routes)
- `GET /api/employees` - Get all employees with current month stats
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Duties (Protected Routes)
- `GET /api/duties` - Get all duties with optional filters (startDate, endDate, employeeId, shiftTime, completed)
- `POST /api/duties/schedule` - Bulk schedule duties or mark leave for employees
- `PUT /api/duties/complete/:id` - Mark duty as completed and increment employee's monthly count
- `GET /api/duties/status/:date` - Get duty status for home page (Green/Red indicators)

### Reports (Protected Routes)
- `GET /api/reports/excel/:monthYear` - Generate and download Excel report for duties (format: MM-YYYY)

### Health Check
- `GET /api/health` - Server health status

## Deployment

### Heroku Deployment
1. Create a Heroku app:
   ```bash
   heroku create your-app-name
   ```

2. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your-mongodb-connection-string"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set NODE_ENV="production"
   ```

3. Deploy:
   ```bash
   git push heroku main
   ```

4. Open the app:
   ```bash
   heroku open
   ```

### Environment Variables
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Set to "production" for production
- `PORT`: Port for the server (optional, defaults to 5000)

## Features
- IST (Indian Standard Time) timezone support
- JWT authentication
- Password hashing with bcrypt
- CORS enabled
- MongoDB with Mongoose ODM
- Duty scheduling and tracking
- Automatic monthly duty count updates
- Excel report generation with multiple sheets
- Bulk duty operations
- Real-time duty status monitoring