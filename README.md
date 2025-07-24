# SecureSight Dashboard

A comprehensive CCTV monitoring and security incident management dashboard built with Next.js 15, TypeScript, Prisma ORM, and SQLite. SecureSight provides real-time security monitoring capabilities with an intuitive interface for security personnel to track, review, and resolve security incidents.

## 🚀 Features

### Core Functionality
- **Real-time Incident Monitoring**: Track security incidents across multiple camera locations
- **Interactive Incident Player**: Review incident footage with thumbnail previews
- **Incident Timeline**: Visual timeline showing incidents over a 24-hour period
- **Incident Management**: Mark incidents as resolved with optimistic UI updates
- **Multi-Camera Support**: Monitor incidents from multiple camera locations (Shop Floor A, Vault, Entrance)

### Security Incident Types
- Unauthorised Access detection
- Gun Threat identification
- Suspicious Loitering monitoring

### Technical Features
- **Optimistic UI**: Instant feedback when resolving incidents
- **RESTful API**: Clean API routes for incident management
- **Database Seeding**: Pre-populated demo data for testing
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (development), easily adaptable to PostgreSQL/MySQL
- **Styling**: Tailwind CSS 4.0
- **3D Graphics**: React Three Fiber, Drei (for future 3D features)
- **Notifications**: React Hot Toast
- **Development**: ESLint, TypeScript, Turbopack

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd securesight-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   ```bash
   # Run database migrations
   npx prisma migrate dev --name init
   
   # Seed the database with demo data
   npx prisma db seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 📊 Database Schema

The application uses a relational database with the following models:

### Camera Model
- `id`: Unique identifier
- `name`: Camera name (e.g., "Shop Floor A", "Vault")
- `location`: Physical location description
- `incidents`: Related incidents

### Incident Model
- `id`: Unique identifier
- `cameraId`: Foreign key to Camera
- `type`: Incident type (Unauthorised Access, Gun Threat, etc.)
- `tsStart`: Incident start timestamp
- `tsEnd`: Incident end timestamp
- `thumbnailUrl`: Path to incident thumbnail image
- `resolved`: Boolean status flag

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set up environment variables if needed
4. Deploy automatically

### Other Platforms
- **Netlify**: Supports Next.js with Edge Functions
- **Railway**: Good for full-stack apps with database
- **Docker**: Containerized deployment option

### Environment Variables
Create a `.env` file for production:
```env
DATABASE_URL="file:./dev.db"
# Add other environment variables as needed
```

## 🏗️ Project Structure

```
securesight-dashboard/
├── src/
│   ├── app/
│   │   ├── api/incidents/          # API routes for incident management
│   │   ├── components/             # React components
│   │   │   ├── Navbar.tsx         # Navigation component
│   │   │   ├── IncidentPlayer.tsx # Incident video player
│   │   │   ├── IncidentList.tsx   # List of incidents
│   │   │   ├── IncidentRow.tsx    # Individual incident row
│   │   │   └── IncidentTimeline.tsx # 24-hour timeline
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main dashboard page
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── seed.ts                    # Database seeding script
│   └── migrations/                # Database migrations
├── public/
│   └── thumbnails/                # Incident thumbnail images
└── [config files]
```

## 🎯 Future Enhancements

### Planned Features
- **Enhanced Timeline**: Interactive 24-hour incident timeline with zoom capabilities
- **3D Camera View**: Immersive 3D visualization using React Three Fiber
- **Real-time Updates**: WebSocket integration for live incident feeds
- **User Authentication**: Role-based access control for security personnel
- **Advanced Analytics**: Incident reporting and trend analysis
- **Mobile App**: React Native companion app
- **AI Integration**: Automated threat detection and classification

### Technical Improvements
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Loading States**: Skeleton screens and progressive loading
- **Caching**: Redis integration for improved performance
- **Testing**: Unit and integration test coverage
- **Monitoring**: Application performance monitoring
- **Documentation**: API documentation with OpenAPI/Swagger

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is built for demonstration purposes. Please ensure compliance with local security and privacy regulations when implementing in production environments.

## 🤝 Support

For questions or support, please open an issue in the GitHub repository or contact the development team.

## Credits

- [Figma design](#) (link if provided)
- Placeholder images from [Unsplash](https://unsplash.com/) or similar
