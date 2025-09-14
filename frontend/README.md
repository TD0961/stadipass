# StadiPass Frontend

A modern, responsive React application for stadium ticket management built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Features

### Phase 1 - Foundation (✅ Complete)
- **Authentication System**
  - User login with email/password
  - User registration with validation
  - Password reset flow
  - Protected routes and role-based access
  - Persistent authentication state

- **Form System**
  - Reusable form components (Input, Textarea, Select, Checkbox)
  - Comprehensive validation with custom rules
  - Form state management with custom hooks
  - Error handling and user feedback

- **UI/UX Foundation**
  - Professional design system with Tailwind CSS
  - Responsive layout components
  - Loading states and error boundaries
  - Toast notifications
  - Mobile-first design

- **DevOps & Quality**
  - CI/CD pipeline with GitHub Actions
  - Automated testing with Vitest
  - TypeScript for type safety
  - Docker containerization
  - Security scanning and performance monitoring

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Zustand for global state, React Query for server state
- **Routing**: React Router v6
- **Forms**: React Hook Form with custom validation
- **Testing**: Vitest + Testing Library
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios with interceptors

## 📁 Project Structure

```
src/
├── components/
│   ├── forms/           # Reusable form components
│   ├── layout/          # Layout components (Header, Footer, etc.)
│   ├── ui/              # Base UI components (Button, Card, etc.)
│   └── ErrorBoundary.tsx
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API services
├── stores/              # State management (Zustand)
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── test/                # Test setup and utilities
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - Run TypeScript type checking
- `npm run audit` - Run security audit

## 🧪 Testing

The project uses Vitest for testing with the following features:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: Form validation and API integration
- **Coverage Reporting**: 70% minimum coverage requirement
- **Test Utilities**: Custom render functions and mocks

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## 🐳 Docker

### Build and Run

```bash
# Build Docker image
npm run docker:build

# Run container
npm run docker:run
```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

### GitHub Actions

The project includes automated CI/CD pipelines:

- **Frontend CI**: Runs on every push/PR
  - Linting and type checking
  - Unit and integration tests
  - Build verification
  - Security scanning
  - Performance monitoring with Lighthouse

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your hosting provider

## 🎨 Design System

### Colors
- **Primary**: Stadium Green (#1B5E20)
- **Secondary**: Electric Blue (#0D47A1)
- **Accent**: Stadium Orange (#E65100)
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Font Family**: Inter (primary), Poppins (display), JetBrains Mono (code)
- **Scale**: Responsive typography with consistent spacing

### Components
- **Buttons**: 5 variants (primary, secondary, outline, ghost, danger)
- **Forms**: Consistent styling with validation states
- **Cards**: Multiple variants for different use cases
- **Layout**: Responsive grid system and spacing

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true

# External Services
VITE_GOOGLE_CLIENT_ID=
VITE_GITHUB_CLIENT_ID=
```

### Tailwind Configuration

The project uses a custom Tailwind configuration with:
- Extended color palette
- Custom spacing and typography
- Component-based utilities
- Dark mode support (ready for implementation)

## 📊 Performance

### Bundle Analysis
- **Total Bundle Size**: ~300KB (gzipped)
- **Vendor Chunks**: Optimized with manual chunking
- **Code Splitting**: Route-based and component-based splitting

### Performance Features
- **Lazy Loading**: Components and routes
- **Image Optimization**: Ready for implementation
- **Caching**: React Query for API caching
- **Compression**: Gzip compression enabled

## 🔒 Security

### Security Features
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized inputs and outputs
- **CSRF Protection**: Token-based protection
- **Content Security Policy**: Ready for implementation
- **Dependency Scanning**: Automated security audits

## 🚧 Roadmap

### Phase 2 - Core Features (Next)
- [ ] Events listing and details pages
- [ ] User dashboard implementation
- [ ] Shopping cart and checkout flow
- [ ] Ticket management system
- [ ] Real-time updates

### Phase 3 - Advanced Features
- [ ] Admin panel functionality
- [ ] Analytics and reporting
- [ ] Mobile app (PWA)
- [ ] Social authentication
- [ ] Payment integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass before submitting PR
- Follow the established code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review existing issues and discussions

---

**Built with ❤️ for the StadiPass project**