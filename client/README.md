# UmukoziHR Resume Tailor - Frontend Client v1.2

🌐 **Modern React Frontend for AI-Powered Resume Generation**

A Next.js-based frontend application that provides an intuitive interface for generating perfectly tailored resumes and cover letters using AI technology.

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based login/signup system
- 📋 **Profile Management** - Save and auto-persist user profiles
- 🎯 **Job Management** - Add multiple job descriptions with regional formatting
- 🤖 **Real-time Generation** - Live status updates during document generation
- 📄 **PDF Downloads** - Direct download of generated resumes and cover letters
- 🗃️ **ZIP Bundles** - Download all documents in one package
- 📝 **LaTeX Preview** - View raw LaTeX source code
- 🔄 **Auto-Save** - Automatically saves profile changes locally
- 🎨 **Modern UI** - Clean, responsive design with Tailwind CSS
- 🚀 **Overleaf Integration** - Open documents directly in Overleaf

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3
- **UI Library**: React 19.1.1
- **Styling**: Tailwind CSS 3.4.17
- **Icons**: Lucide React
- **HTTP Client**: Axios 1.6.2
- **Notifications**: React Hot Toast
- **Language**: TypeScript 5.0.0
- **Development**: ESLint + Next.js optimizations

## 📋 Prerequisites

- **Node.js** 18.0+ (20.0+ recommended)
- **npm** or **pnpm** (pnpm recommended for faster installs)
- **Backend API** running on port 8000

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
cd client
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install
```

### 3. Configure Environment
Create a `.env.local` file (optional):
```env
# Backend API URL (default: http://localhost:8000)
NEXT_PUBLIC_API_URL=http://localhost:8000

# App configuration
NEXT_PUBLIC_APP_NAME="UmukoziHR Resume Tailor"
NEXT_PUBLIC_APP_VERSION="1.2.0"
```

### 4. Start Development Server
```bash
# Using npm
npm run dev

# Using pnpm
pnpm run dev
```

🎉 **Client running at: http://localhost:3000** (or next available port)

## 📏 Usage Guide

### 1. **Authentication**
- Create a new account or login with existing credentials
- JWT tokens are automatically managed and stored securely

### 2. **Profile Setup**
- Fill in your personal information, contacts, and experience
- Profile auto-saves locally to prevent data loss
- Include comprehensive work experience and skills

### 3. **Add Job Descriptions**
- Paste complete job descriptions for better AI tailoring
- Select appropriate region format (US/EU/Global)
- Add multiple jobs to generate documents for different positions

### 4. **Generate Documents**
- Click "Generate Tailored Documents" to start the process
- Real-time status updates show generation progress
- Documents are processed using advanced AI technology

### 5. **Download Results**
- **PDF Downloads**: Ready-to-use resume and cover letter PDFs
- **LaTeX Source**: View and edit raw LaTeX code
- **ZIP Bundle**: Download all documents at once
- **Overleaf Integration**: Open directly in Overleaf for editing

## 📱 User Interface

### Main Sections

1. **Header**
   - Application branding
   - User authentication status
   - Logout functionality

2. **Profile Section**
   - Personal information form
   - Contact details
   - Professional summary
   - Skills, experience, education
   - Auto-save indicators

3. **Jobs Section**
   - Job description input form
   - Regional format selection
   - Added jobs management
   - Removal functionality

4. **Generation Section**
   - Generate button with status
   - Progress indicators
   - Run ID tracking

5. **Results Section**
   - Generated documents display
   - Download buttons for PDFs
   - LaTeX source links
   - ZIP bundle download
   - Overleaf integration

## 📁 Project Structure

```
client/
├── pages/
│   ├── _app.tsx            # App configuration
│   └── index.tsx           # Main application page
├── components/
│   ├── LoginForm.tsx       # Authentication component
│   ├── ProfileForm.tsx     # Profile management
│   ├── JDInput.tsx         # Job description input
│   ├── JobCard.tsx         # Generated document display
│   └── StatusToast.tsx     # Status notifications
├── lib/
│   └── api.ts              # API client configuration
├── styles/
│   └── globals.css         # Global styles
└── public/                 # Static assets
```

## 🎨 Styling System

### Tailwind CSS Classes
The application uses a consistent design system:

```css
/* Primary buttons */
.btn-primary {
  @apply bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded transition-colors;
}

/* Secondary buttons */
.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded transition-colors;
}

/* Cards */
.card {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

/* Input fields */
.input-field {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent;
}
```

### Color Palette
- **Primary**: Orange (#f97316)
- **Secondary**: Gray (#6b7280)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Warning**: Yellow (#f59e0b)

## 🔧 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

### Code Quality

- **ESLint**: Automated code linting
- **TypeScript**: Type safety and better development experience
- **Prettier**: Code formatting (via ESLint integration)

### Component Guidelines

1. **Functional Components**: Use React functional components with hooks
2. **TypeScript**: All components should be properly typed
3. **Props Interface**: Define interfaces for component props
4. **Error Handling**: Include proper error boundaries and fallbacks
5. **Accessibility**: Follow WCAG guidelines for accessibility

## 🔄 State Management

### Local Storage
- **User Profile**: Automatically saved to prevent data loss
- **Authentication Token**: Securely stored JWT token
- **Preferences**: User interface preferences

### React State
- **Authentication**: Login status and user information
- **Profile**: Current profile data and form state
- **Jobs**: Added job descriptions
- **Generation**: Current generation status and results
- **UI**: Loading states, notifications, and user feedback

## 🔌 API Integration

### Axios Configuration
```typescript
// Automatic token injection
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Endpoints Used
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/profile/profile` - Save user profile
- `POST /api/v1/generate/generate` - Generate documents
- `GET /api/v1/generate/status/{id}` - Check generation status

## 🐛 Troubleshooting

### Common Issues

**1. Port Already in Use**
```
Next.js will automatically use the next available port (3001, 3002, etc.)
```

**2. API Connection Failed**
```
Check that the backend server is running on port 8000
Verify CORS configuration in backend
```

**3. Authentication Issues**
```
Clear browser localStorage
Check token expiration in browser dev tools
```

**4. Build Errors**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Debug Mode
```bash
# Enable verbose logging
DEBUG=* npm run dev

# Check browser console for errors
# Open browser dev tools (F12)
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Features
- Mobile-first responsive design
- Touch-friendly interface
- Optimized for all screen sizes
- Progressive Web App ready

## ⚡ Performance

### Optimizations
- **Next.js Optimizations**: Automatic code splitting and optimization
- **Image Optimization**: Next.js built-in image optimization
- **Bundle Splitting**: Automatic code splitting for faster loads
- **Caching**: Efficient caching strategies

### Metrics
- **First Load**: < 2 seconds
- **Interaction Ready**: < 1 second
- **Bundle Size**: < 500KB (gzipped)

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
out/
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔒 Security

- **JWT Token Management**: Secure token storage and automatic injection
- **Input Validation**: Client-side validation for all forms
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: Token-based authentication
- **Secure Storage**: Sensitive data stored securely

## 🆘 Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the component guidelines
4. Test thoroughly on different screen sizes
5. Submit a pull request

## 📄 License

Private - UmukoziHR Internal Use

## 🆘 Support

For issues and questions:
- Check browser console for errors
- Verify backend API connection
- Review network requests in browser dev tools
- Ensure all dependencies are installed

---

**Built with ❤️ by the UmukoziHR Team**