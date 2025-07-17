# Employee Retention Platform

A secure, anonymous platform for employees to share retention insights and companies to access aggregated data.

## Features

- **Employee Interface**: Anonymous data submission with workplace satisfaction metrics
- **Company Dashboard**: Aggregated insights and industry benchmarks
- **Privacy-First**: Individual responses are never shared, only aggregated data with minimum 5 responses
- **Security**: Role-based authentication and data encryption
- **Responsive Design**: Mobile-friendly Tailwind CSS interface

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, NextAuth.js
- **Database**: SQLite with Prisma ORM
- **Charts**: Recharts for data visualization
- **Authentication**: NextAuth.js with credentials provider

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your configuration.

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── employee/       # Employee data endpoints
│   │   └── company/        # Company insights endpoints
│   ├── auth/               # Authentication pages
│   ├── employee/           # Employee dashboard
│   ├── company/            # Company dashboard
│   └── page.tsx            # Home page
├── components/             # Reusable UI components
├── lib/                    # Utility functions
└── types/                  # TypeScript type definitions
```

## Database Schema

- **Users**: Authentication and role management
- **EmployeeData**: Anonymous employee responses
- **CompanyData**: Company profile information
- **RetentionInsights**: Aggregated insights for companies

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Employee
- `GET /api/employee/data` - Get employee's data
- `POST /api/employee/data` - Submit/update employee data

### Company
- `GET /api/company/insights` - Get company insights
- `POST /api/company/insights` - Get industry benchmarks

## Privacy & Security

- All employee responses are anonymized
- Data is only aggregated when there are at least 5 responses
- Role-based access control prevents data leakage
- Secure password hashing with bcrypt
- Session management with NextAuth.js

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy with automatic CI/CD

### Docker

```bash
# Build the Docker image
docker build -t employee-retention-platform .

# Run the container
docker run -p 3000:3000 employee-retention-platform
```

### Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Environment Variables

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
APP_NAME="Employee Retention Platform"
APP_URL="http://localhost:3000"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
