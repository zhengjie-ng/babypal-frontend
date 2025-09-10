# BabyPal Frontend

A modern React application for tracking baby development, measurements, and milestones. Built with React, TypeScript, and Vite.

## Features

- 👶 Baby profile management
- 📊 Growth measurements tracking
- 📝 Daily records and activities
- 🎯 Developmental milestones monitoring
- 📈 Dashboard with visual insights
- 🌙 Dark/light theme support
- 👨‍💼 Admin panel for user management
- 🔐 Secure authentication with JWT
- 📱 Responsive mobile-friendly design

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React & React Icons
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Testing**: Vitest with React Testing Library
- **Date Handling**: date-fns
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd babypal-frontend
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:

```env
VITE_API_URL=https://d133jijqsdl8sk.cloudfront.net
```

4. Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   └── ...             # Feature-specific components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── routes/             # Page components
├── services/           # API service layer
├── lib/                # Utility functions
└── test/               # Test files and setup
```

## Key Features

### Baby Management

- Add and manage multiple baby profiles
- Track basic information and photos
- Switch between different babies

### Measurements Tracking

- Record height, weight, and head circumference
- Visual charts and growth trends
- Compare against standard growth curves

### Daily Records

- Log feeding, sleeping, and diaper changes
- Add notes and observations
- Timeline view of activities

### Developmental Milestones

- Track important developmental markers
- Age-appropriate milestone suggestions
- Progress visualization

### Admin Features

- User management dashboard
- System-wide baby and record management
- Debug tools and analytics

## Authentication

The app uses JWT-based authentication with:

- User registration and login
- Password reset functionality
- Secure route protection
- Automatic token refresh

## Deployment

The application is configured for deployment on Netlify. Build the project and deploy the `dist` folder:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run linting and tests: `npm run lint && npm run test`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## License

This project is private and proprietary.
