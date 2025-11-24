<div align="center">
  <img src="public/logo.png" alt="Miss-Minutes Logo" width="120" height="120">
  
  # Miss-Minutes
  
  ### Automated Coding Analytics Platform for VS Code
  
  [![VS Code Extension](https://img.shields.io/badge/VS%20Code-Extension-blue.svg)](https://marketplace.visualstudio.com/items?itemName=Mukulrai.miss-minutes)
  [![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

  <p align="center">
    <strong>Track your coding time automatically. No manual timers. No effort.</strong>
  </p>

  <img src="public/Hero.png" alt="Miss-Minutes Dashboard" width="800">
</div>

---

## 🚀 Features

### ⚡ Automatic Time Tracking

- **Zero Configuration**: Start coding and Miss-Minutes tracks everything automatically
- **File-Level Precision**: Tracks every file you edit with millisecond accuracy
- **Git Integration**: Automatically links activities to commits and branches
- **Multi-Project Support**: Seamlessly switch between projects without manual intervention

### 📊 Powerful Analytics Dashboard

- **7-Day Activity Overview**: Visual charts showing your coding patterns
- **Language Breakdown**: See which programming languages you use most
- **Project Insights**: Detailed statistics for each project
- **Real-time Updates**: Live tracking with automatic sync
- **Heatmap Visualization**: Understand your productivity patterns

### 🔒 Privacy First

- **Local Storage**: Extension caches data locally using SQLite
- **Secure Sync**: API token-based authentication for cloud sync
- **No Source Code**: Only metadata is tracked (file names, languages, duration)
- **You Own Your Data**: Full control over your coding activity data

### 🎨 Beautiful Interface

- **Modern UI**: Clean, responsive design built with Next.js 14 and Tailwind CSS
- **Dark/Light Mode**: Supports system theme preferences
- **Mobile Responsive**: Access your dashboard from any device

---

## 📸 Screenshots

<div align="center">
  <img src="public/ogImage.png" alt="Dashboard Overview" width="700">
  <p><em>Dashboard showing weekly activity and project statistics</em></p>
</div>

---

## 🛠️ Tech Stack

### Frontend (Dashboard)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand + React Query
- **Charts**: Recharts
- **Authentication**: NextAuth.js (GitHub OAuth)

### Backend

- **API**: GraphQL (GraphQL Yoga)
- **Database**: PostgreSQL (Prisma ORM)
- **Deployment**: Vercel

### VS Code Extension

- **Language**: TypeScript
- **Local Storage**: SQLite3
- **Build Tool**: Webpack
- **API Client**: GraphQL Request

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- GitHub OAuth App (for authentication)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/Mukul-raii/CodeChrono.git
cd CodeChrono/web
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**
   Create a `.env` file in the `web` directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/miss_minutes"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# GitHub OAuth
GITHUB_ID="your-github-oauth-app-id"
GITHUB_SECRET="your-github-oauth-app-secret"
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## 📦 VS Code Extension Setup

1. **Install the Extension**

   - Visit [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Mukulrai.miss-minutes)
   - Click "Install" or search for "Miss-Minutes" in VS Code Extensions

2. **Configure API Key**

   - Sign in to the [dashboard](http://localhost:3000)
   - Go to Settings and copy your API token
   - In VS Code, press `Cmd/Ctrl + Shift + P`
   - Run command: "Miss-Minutes: Set API Key"
   - Paste your API token

3. **Start Coding!**
   - The extension automatically tracks your activity
   - Data syncs to your dashboard in real-time

---

## 📊 How It Works

```mermaid
graph LR
    A[VS Code Extension] -->|Tracks Activity| B[Local SQLite DB]
    B -->|Syncs Every 5 Min| C[GraphQL API]
    C -->|Stores Data| D[PostgreSQL]
    D -->|Queries| E[Next.js Dashboard]
    E -->|Displays| F[Analytics & Charts]
```

1. **Extension monitors** file changes, cursor activity, and Git events
2. **Local caching** stores activities in SQLite for offline support
3. **Background sync** sends aggregated data to the cloud every 5 minutes
4. **Dashboard queries** the database for analytics and visualizations
5. **Real-time updates** show your current coding session live

---

## 🗂️ Project Structure

```
CodeChrono/
├── extension/          # VS Code Extension
│   ├── src/
│   │   ├── activity/   # Activity tracking logic
│   │   ├── api/        # API client
│   │   ├── storage/    # SQLite database
│   │   ├── sync/       # Sync manager & status bar
│   │   └── utils/      # Git tracker & logger
│   └── package.json
│
└── web/                # Next.js Dashboard
    ├── app/            # App router pages
    │   ├── dashboard/  # Main dashboard
    │   ├── analytics/  # Analytics page
    │   ├── projects/   # Projects page
    │   ├── settings/   # Settings page
    │   └── api/        # API routes (GraphQL, Auth)
    ├── components/     # React components
    ├── lib/            # Utilities, hooks, stores
    ├── prisma/         # Database schema
    └── public/         # Static assets
```

---

## 🔧 Development

### Run Tests

```bash
npm run test
```

### Build for Production

```bash
npm run build
```

### Run Linter

```bash
npm run lint
```

### Database Migrations

```bash
npx prisma migrate dev
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 💖 Support

If you find Miss-Minutes helpful, consider supporting the project:

<div align="center">
  <img src="public/qr-code-support.png" alt="Support QR Code" width="200">
  <p><em>Support via UPI or scan the QR code</em></p>
</div>

---

## 🔗 Links

- **Dashboard**: [https://missminutes.vercel.app](https://missminutes.vercel.app)
- **VS Code Extension**: [Marketplace](https://marketplace.visualstudio.com/items?itemName=Mukulrai.miss-minutes)
- **GitHub**: [Repository](https://github.com/Mukul-raii/CodeChrono)
- **Issues**: [Report Bug](https://github.com/Mukul-raii/CodeChrono/issues)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/Mukul-raii">Mukul Rai</a></p>
  <p>
    <a href="https://twitter.com/mukulrai">Twitter</a> •
    <a href="https://github.com/Mukul-raii">GitHub</a>
  </p>
</div>
