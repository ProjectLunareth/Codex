# ✨ The Codex of Hidden Knowing

*A mystical knowledge management system for exploring esoteric and spiritual wisdom*

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)

## 🌟 Overview

The Codex of Hidden Knowing is a sophisticated web application designed for browsing, searching, and interacting with a collection of 61 esoteric and spiritual texts. Built with modern web technologies and enhanced with AI-powered features, it provides an immersive experience for exploring mystical knowledge across categories like Cosmogenesis, Psychogenesis, and Mystagogy.

## ✨ Features

### 📚 **Core Functionality**
- **Digital Archive**: Browse and search through 61 carefully curated esoteric documents
- **Advanced Search**: Full-text search with category filtering and intelligent ranking
- **Interactive Reading**: Immersive reading experience with bookmarking and personal notes
- **Oracle Consultations**: AI-powered mystical guidance using OpenAI's GPT models

### 🔮 **Mystical Tools Suite**
- **Personal Grimoire**: Create and manage your personal collection of mystical knowledge
- **AI Sigil Generation**: Generate personalized mystical symbols and sigils
- **Sonic Echo Creation**: Create ambient soundscapes for meditation and ritual
- **Sacred Geometry Tools**: Mathematical pattern generation with L-systems and fractals
- **Book Structure Visualization**: Interactive exploration of document relationships

### 🐍 **Python Integration**
- **Grimoire Viewer**: Terminal-like interface for browsing codex entries
- **Lunareth Synchronization**: 13+1 phase mapping with sacred mathematics
- **Sacred Geometry Engine**: Advanced mathematical pattern generation
- **Mystical Tools Client**: Python-enhanced Oracle, Sigil, and Sonic Echo features
- **Integration Bridge**: Seamless data exchange between React and Python components

### 🤝 **Collaboration Features**
- **Annotations**: Share insights and commentary on texts
- **Collections Export**: Export personal collections for sharing
- **Community Sharing**: Share discoveries with other seekers

## 🛠️ Technology Stack

### **Frontend**
- **React 18** with TypeScript for type-safe component development
- **Vite** for fast development and optimized builds
- **TanStack Query** for efficient server state management
- **Wouter** for lightweight client-side routing
- **shadcn/ui + Radix UI** for accessible, beautiful components
- **Tailwind CSS** with custom mystical theming
- **Framer Motion** for smooth animations

### **Backend**
- **Express.js** with TypeScript in ESM format
- **Drizzle ORM** with PostgreSQL for robust data persistence
- **Zod** for runtime schema validation
- **OpenAI API** integration for AI-powered features
- **Python integration** via child process execution

### **Database & Storage**
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **Session storage** with connect-pg-simple

### **Python Tools**
- **Python 3.x** with modern libraries
- **Sacred geometry algorithms** with mathematical visualization
- **Audio processing** for sonic echo generation
- **Image generation** for sigil creation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- PostgreSQL database (or use included Neon setup)
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codex-of-hidden-knowing.git
   cd codex-of-hidden-knowing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `SESSION_SECRET` - A secure session secret
   - Database credentials (if not using included setup)

4. **Initialize the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Base UI components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── codex/      # Codex-specific components
│   │   │   └── python-tools/ # Python integration components
│   │   ├── pages/          # Application pages
│   │   └── lib/            # Utilities and configuration
├── server/                 # Express.js backend
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage abstraction
│   └── services/           # Business logic services
├── shared/                 # Shared TypeScript schemas
├── mystical_python/        # Python tool implementations
├── attached_assets/        # Codex documents and assets
└── database/              # Database schema and migrations
```

## 🔌 API Documentation

### **Codex Endpoints**
- `GET /api/codex/entries` - Retrieve all codex entries
- `GET /api/codex/entries/:id` - Get specific entry
- `GET /api/codex/search` - Search entries with query parameters

### **User Features**
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks` - Create new bookmark
- `POST /api/oracle/consult` - Consult the Oracle

### **Python Tool Integration**
- `POST /api/python/grimoire` - Execute Grimoire Viewer
- `POST /api/python/lunareth` - Run Lunareth Synchronization
- `POST /api/python/sacred-geometry` - Generate sacred geometry
- `POST /api/python/mystical-tools` - Access mystical tools
- `POST /api/python/integration-bridge` - Use integration bridge

## 🎨 Customization

### **Theming**
The application uses a mystical dark theme with golden accents. Colors and styling can be customized in:
- `client/src/index.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration

### **Content**
- Add new codex documents to `attached_assets/`
- Modify categories and metadata in the database schema
- Extend Python tools in `mystical_python/`

## 🧪 Development

### **Running Tests**
```bash
npm run test
```

### **Database Management**
```bash
npm run db:push      # Sync schema changes
npm run db:studio    # Open Drizzle Studio
```

### **Python Development**
```bash
cd mystical_python
python mystical_main.py --help  # See available commands
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use the existing component patterns
- Maintain the mystical theming aesthetic
- Add proper error handling and loading states
- Include tests for new features

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by ancient wisdom traditions and modern technology
- Built with love for seekers of hidden knowledge
- Special thanks to the open-source community for the amazing tools

## 🔮 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/codex-of-hidden-knowing/issues) page
2. Create a new issue with detailed information
3. For general questions, use the Discussions tab

---

*"As above, so below; as in the code, so in the cosmos."* ✨
