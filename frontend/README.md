# Frontend Setup Guide

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Backend server running on `http://localhost:8000`

## 🚀 Quick Start

### 1. Install Dependencies

```powershell
# Navigate to frontend directory
cd frontend

# Install packages
npm install
# or
yarn install
```

### 2. Start Development Server

```powershell
# Run development server
npm run dev
# or
yarn dev
```

The application will be available at: **http://localhost:3000**

### 3. Build for Production

```powershell
# Create production build
npm run build
# or
yarn build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API client
│   │   └── client.js
│   ├── components/     # Reusable components
│   │   └── Layout.jsx
│   ├── pages/          # Page components
│   │   ├── HomePage.jsx
│   │   ├── AnalyzePage.jsx
│   │   ├── ResultsPage.jsx
│   │   └── HistoryPage.jsx
│   ├── App.jsx         # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns

## 🔧 Configuration

### Environment Variables

Create `.env` file (optional):

```env
VITE_API_URL=http://localhost:8000/api
```

### API Proxy

Vite is configured to proxy `/api` requests to the backend:

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

## 📄 Pages

### 1. Home Page (`/`)
- Project overview
- Feature highlights
- Tech stack display
- Call-to-action

### 2. Analyze Page (`/analyze`)
- Text input area
- File upload (.txt)
- Sample text loader
- Real-time character count
- Submit button

### 3. Results Page (`/results/:id`)
- Risk score with visual progress bar
- Highlighted text with detected entities
- Entity table grouped by type
- AI-generated recommendations
- Before/after comparison
- Export functionality

### 4. History Page (`/history`)
- List of past analyses
- Filter by risk level
- View details
- Delete analyses

## 🎯 Key Features

### Risk Visualization
- Color-coded risk levels (Green/Yellow/Red)
- Animated progress bars
- Risk badges

### Entity Highlighting
- Different colors for entity types
- Hover tooltips
- Grouped entity tables

### Responsive Design
- Mobile-friendly layouts
- Adaptive grids
- Touch-optimized controls

## 🐛 Troubleshooting

### Port Already in Use

```powershell
# Change port in vite.config.js
server: {
  port: 3001
}
```

### API Connection Issues

1. Verify backend is running on port 8000
2. Check CORS settings in backend
3. Review browser console for errors

### Styling Not Applied

```powershell
# Rebuild Tailwind
npm run dev
```

## 🚀 Deployment

### Vercel

```powershell
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```powershell
# Build
npm run build

# Deploy dist/ folder
```

### Static Hosting

```powershell
# Build
npm run build

# Upload dist/ folder to:
# - GitHub Pages
# - Netlify
# - Vercel
# - Render
```

## 📝 Development Tips

### Hot Module Replacement (HMR)

Vite provides instant updates during development. Just save your files and see changes immediately.

### Code Formatting

```powershell
# Format code (if Prettier is installed)
npm run format
```

### Linting

```powershell
# Run ESLint
npm run lint
```

## 🔗 Integration with Backend

The frontend expects these backend endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze-text` | POST | Analyze text |
| `/api/risk-report/:id` | GET | Get report |
| `/api/history` | GET | Get history |
| `/api/stats` | GET | Get statistics |
| `/api/analysis/:id` | DELETE | Delete analysis |

## 🆘 Support

- Check browser console for errors
- Verify backend API is accessible
- Review network tab in DevTools
- Ensure all dependencies are installed

## 📚 Next Steps

1. ✅ Frontend is ready
2. 🎨 Customize colors in `tailwind.config.js`
3. 📊 Add charts with Recharts
4. 🔐 Add authentication (optional)
5. 📱 Test on mobile devices
