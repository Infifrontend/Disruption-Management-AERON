# AERON - AI Recovery System

## Overview

AERON (AI Enhanced Recovery Operations Network) is a comprehensive flight disruption management system built for Flydubai airline operations. The system provides real-time flight disruption monitoring, automated recovery option generation, passenger rebooking management, crew & hotel coordination (HOTAC), and cost optimization analysis. Built as a React-based single-page application with a modular component architecture, AERON integrates with external flight data APIs and uses PostgreSQL for persistent data storage with localStorage fallback capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: React Router DOM for client-side navigation
- **State Management**: React Context API with custom AppProvider for global state

### Component Structure
- **Modular Design**: Separated components for distinct functionalities (DisruptionInput, RecoveryOptionsGenerator, PassengerRebooking, PendingSolutions, ComparisonMatrix)
- **Page-Based Routing**: Individual pages for different operational areas (disruption management, recovery options, passenger services, pending solutions, comparison analysis)
- **Protected Routes**: Authentication-based access control for secure operations
- **Error Boundaries**: Comprehensive error handling with fallback UI components

### Data Management
- **Database**: PostgreSQL as primary data store with structured schemas for disruptions, recovery options, passenger rebookings, and crew assignments
- **Fallback Storage**: localStorage implementation for offline capability when database is unavailable
- **API Integration**: RESTful API structure for data operations with external flight data synchronization
- **Real-time Updates**: Periodic data fetching and synchronization mechanisms

### Backend Integration
- **API Endpoints**: Comprehensive REST API covering disruptions, recovery options, passenger data, crew assignments, and cost analysis
- **Data Validation**: Form validation using react-hook-form with zod resolvers
- **Error Handling**: Robust error handling with user-friendly feedback mechanisms
- **File Upload**: Support for passenger data import and export functionality

### Styling & Theming
- **Dynamic Theming**: CSS custom properties for airline-specific branding (primary, secondary, navy colors)
- **Responsive Design**: Mobile-first approach with responsive grid layouts
- **Component Library**: Extensive use of Radix UI primitives for accessible, customizable components
- **Design System**: Consistent spacing, typography, and color schemes following airline branding guidelines

## External Dependencies

### Core Technologies
- **React Ecosystem**: React 18, React DOM, React Router DOM for frontend framework
- **TypeScript**: Full TypeScript implementation for type safety and developer experience
- **Vite**: Modern build tool for development and production optimization

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Comprehensive set of accessible, unstyled UI components including dialogs, dropdowns, forms, and navigation
- **Lucide React**: Icon library for consistent iconography

### Data & Forms
- **React Hook Form**: Form state management and validation
- **Hookform Resolvers**: Integration layer for validation libraries
- **Date-fns**: Date manipulation and formatting utilities
- **CMDK**: Command menu component for search functionality

### Development Tools
- **PostCSS & Autoprefixer**: CSS processing and browser compatibility
- **ESLint & TypeScript**: Code quality and type checking
- **Class Variance Authority**: Utility for creating component variants
- **CLSX**: Conditional className utility

### Backend & Database
- **PostgreSQL**: Primary database for persistent data storage
- **Database Schema**: Structured tables for flight disruptions, recovery options, passenger rebookings, crew hotel assignments
- **API Middleware**: CORS support for cross-origin requests
- **Environment Configuration**: Dotenv for environment variable management

### External Services
- **Flight Data APIs**: Integration with external flight information systems for real-time disruption data
- **Weather Services**: Weather data integration for disruption cause analysis
- **Hotel Booking Systems**: HOTAC (Hotel and Transport Arrangements for Crew) integration
- **Cost Analysis Services**: Financial calculation engines for recovery option cost estimation