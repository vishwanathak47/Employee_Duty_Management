# Employee Duty Management System

A complete MERN stack application for managing employee duties with a mobile-first Progressive Web App (PWA) interface.

## 🚀 Features

- **Mobile-First PWA**: Installable app with offline capabilities
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Dark/Light Theming**: Automatic theme detection with manual toggle
- **JWT Authentication**: Secure login system
- **Duty Management**: Schedule, track, and mark attendance
- **Excel Reports**: Generate comprehensive duty reports
- **Real-time Status**: Live employee availability and duty status
- **Network Aware**: Graceful offline handling

## 🏗️ Architecture

### Backend (Node.js/Express)
- RESTful API with JWT authentication
- MongoDB with Mongoose ODM
- IST timezone support
- Excel report generation
- CORS enabled

### Frontend (React)
- React 18 with hooks
- Progressive Web App features
- Service worker for caching
- Responsive CSS with mobile-first design
- Axios for API communication

## 📱 PWA Features

- **Installable**: Add to home screen on mobile devices
- **Offline Support**: Cached static assets and API responses
- **Fast Loading**: Service worker pre-caches resources
- **Native Feel**: Standalone display mode

## 🛠️ Tech Stack

- **Frontend**: React 18, CSS3, Service Worker
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Deployment**: Netlify (Frontend), Heroku (Backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-duty-management-system
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Copy .env and configure MongoDB URI and JWT secret
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

4. **Access the app**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📦 Deployment

### Backend (Heroku)
```bash
cd backend
heroku create your-app-name
heroku config:set MONGODB_URI="your-connection-string"
heroku config:set JWT_SECRET="your-secret"
git push heroku main
```

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy build/ folder to Netlify or Vercel
```

## 📊 API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/employees` - Employee management
- `POST /api/duties/schedule` - Duty scheduling
- `GET /api/reports/excel/:month` - Excel reports

## 🔮 Future Enhancements

- Push notifications for duty reminders
- Advanced analytics dashboard
- Multi-language support
- Role-based access control
- Integration with calendar apps

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests or open issues.