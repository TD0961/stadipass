# StadiPass Frontend

A modern, responsive React frontend for the StadiPass stadium ticketing system.

## 🚀 Features

- **Modern React 18** with TypeScript
- **Tailwind CSS** for styling with custom design system
- **React Router v6** for navigation
- **Zustand** for state management
- **React Query** for server state management
- **React Hook Form** for form handling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Responsive Design** - Mobile-first approach
- **Accessibility** - WCAG 2.1 AA compliant

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Server State**: React Query
- **Forms**: React Hook Form
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base components (Button, Input, Card)
│   ├── forms/          # Form components
│   ├── layout/         # Layout components (Header, Footer)
│   └── features/       # Feature-specific components
├── pages/              # Route components
│   └── admin/          # Admin pages
├── hooks/              # Custom React hooks
├── services/           # API services
├── stores/             # Zustand stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Images, icons, fonts
```

## 🎨 Design System

### Colors
- **Primary**: Stadium Green (#1B5E20)
- **Secondary**: Electric Blue (#0D47A1)
- **Accent**: Stadium Orange (#E65100)
- **Neutral**: Charcoal (#212121)

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Display Font**: Poppins (Google Fonts)
- **Monospace**: JetBrains Mono

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost, Danger variants
- **Cards**: Default, Hover, Elevated variants
- **Inputs**: With labels, errors, icons, helper text
- **Layout**: Responsive grid system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=StadiPass
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

### Tailwind Configuration

The project uses a custom Tailwind configuration with:
- Custom color palette
- Custom typography scale
- Custom spacing system
- Custom animations
- Custom component classes

## 🧪 Testing

The project is set up with:
- **Vitest** for unit testing
- **React Testing Library** for component testing
- **Playwright** for E2E testing (coming soon)

## 📱 Responsive Design

- **Mobile First**: Designed for mobile devices first
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Touch Friendly**: Optimized for touch interactions
- **Performance**: Optimized for mobile performance

## ♿ Accessibility

- **WCAG 2.1 AA** compliant
- **Keyboard Navigation** support
- **Screen Reader** friendly
- **High Contrast** support
- **Focus Management** for modals and forms

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm run build
# Upload dist/ folder to Netlify
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
