# ☕ Espresso Tracker

A sophisticated, AI-powered coffee tracking application designed for serious coffee enthusiasts, home baristas, and specialty coffee professionals. Built with modern web technologies and powered by advanced AI analysis.

## ✨ Features

### 🤖 AI-Powered Analysis
- **Smart Bag Recognition**: Photograph coffee bags to automatically extract roaster details, origin information, processing methods, and flavor profiles
- **Brew Quality Analysis**: Upload photos of your brewed coffee for professional-grade extraction analysis with scientific recommendations
- **Expert Insights**: Receive detailed feedback on grind size, extraction time, brewing method, and technique improvements

### 📊 Comprehensive Tracking
- **Complete Coffee Journey**: Track roasters, coffee origins, bags, and individual brewing sessions
- **Detailed Brew Logs**: Record dose, yield, grind settings, water temperature, extraction time, and personal ratings
- **Historical Analysis**: View brewing trends, success rates, and improvement over time
- **Flexible Brewing Methods**: Support for espresso, pour-over, French press, AeroPress, and more

### 🎯 Professional Features
- **Scientific Analysis**: AI provides extraction quality assessment based on visual characteristics
- **Brewing Recommendations**: Get specific, actionable advice to improve your coffee
- **Method Detection**: Automatically identify brewing methods from photos
- **Quality Scoring**: Professional-grade scoring system for brew quality assessment

### 💻 Modern Architecture
- **Mobile-First Design**: Optimized progressive web app for coffee on-the-go
- **Real-time Sync**: Cloud-based storage with instant synchronization across devices
- **Offline Capable**: Core features work without internet connection
- **Beautiful Interface**: Clean, intuitive design with carefully chosen typography and colors

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4 Vision API with expert coffee consultant prompts
- **Deployment**: Vercel-ready with serverless functions
- **Development**: ESLint, TypeScript strict mode, hot reload

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**: Download from [nodejs.org](https://nodejs.org)
- **Docker**: Required for local Supabase instance
- **OpenAI API Key**: Optional - app includes comprehensive mock mode

### Quick Start

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-username/espresso-tracker.git
   cd espresso-tracker
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Configure your `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration (optional)
   OPENAI_API_KEY=your_openai_api_key
   
   # Development Settings
   NODE_ENV=development
   ```

3. **Database Setup**
   ```bash
   # Start local Supabase (requires Docker)
   npx supabase start
   
   # Apply migrations
   npx supabase db reset
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Mock Mode (No OpenAI Key Required)

The application includes comprehensive mock data for development:
- Realistic coffee bag information extraction
- Professional brew analysis with recommendations
- All features functional without external API dependencies

## 📊 Database Schema

### Core Entities

```sql
-- Roasters: Coffee roasting companies and their details
roasters (
  id, name, country, website, description, 
  founded_year, specialty, roasting_style
)

-- Coffees: Individual coffee products with origin details
coffees (
  id, roaster_id, name, origin_country, region, 
  farm, variety, process, altitude, tasting_notes,
  cupping_score, certification
)

-- Bags: Physical coffee bag purchases
bags (
  id, coffee_id, size_g, price, roast_date, 
  open_date, purchase_location, photo_url
)

-- Brews: Individual brewing sessions
brews (
  id, bag_id, user_id, method, dose_g, yield_g,
  time_s, grind_setting, water_temp_c, rating,
  notes, brew_date, photo_url, ai_analysis
)
```

### AI Analysis Integration

```typescript
interface BrewAnalysis {
  extraction_analysis: {
    quality: 'under-extracted' | 'properly-extracted' | 'over-extracted'
    confidence: number
    scientific_reasoning: string
  }
  brewing_method: {
    detected_method: string
    confidence: number
    indicators: string[]
  }
  quality_assessment: {
    overall_score: number
    detailed_recommendations: DetailedRecommendation[]
  }
  // ... additional analysis fields
}
```

## 🔧 API Endpoints

### POST `/api/analyze-brew`
Analyzes coffee extraction quality from photos using AI.

**Request:**
```typescript
FormData {
  image: File        // Coffee photo
  brew_data?: string // JSON brewing parameters
}
```

**Response:**
```typescript
BrewAnalysis {
  extraction_analysis: { /* quality assessment */ }
  brewing_method: { /* method detection */ }
  visual_characteristics: { /* appearance analysis */ }
  quality_assessment: { /* recommendations */ }
  confidence_overall: number
}
```

### POST `/api/extract-bag-info`
Extracts comprehensive information from coffee bag photos.

**Request:**
```typescript
FormData {
  image: File // Coffee bag photo
}
```

**Response:**
```typescript
ExtractedBagInfo {
  roaster: { /* roaster details */ }
  coffee: { /* origin and characteristics */ }
  bag: { /* specifications */ }
  confidence: number
}
```

## 🛠️ Development

### Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── api/          # API routes
│   └── (pages)/      # Application pages
├── components/       # React components
│   ├── ui/           # Reusable UI components
│   └── auth/         # Authentication components
├── lib/              # Utility functions
├── types/            # TypeScript type definitions
└── hooks/            # Custom React hooks
```

### Key Development Features

- **TypeScript**: Full type safety with strict mode
- **Hot Reload**: Instant development feedback
- **Mock Data**: Development without external dependencies
- **Error Boundaries**: Graceful error handling
- **Responsive Design**: Mobile-first approach

### Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Build verification
npm run build
```

## 🔒 Authentication & Security

- **Supabase Auth**: Secure user authentication with multiple providers
- **Row Level Security**: Database-level access control
- **API Key Protection**: Secure handling of OpenAI credentials
- **Input Validation**: Comprehensive request validation
- **Image Processing**: Safe file upload and processing

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Configure Environment Variables**
4. **Deploy**

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
OPENAI_API_KEY=your_openai_api_key
```

## 🤝 Contributing

We welcome contributions from the coffee community!

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests and documentation**
5. **Submit a pull request**

### Code Standards

- **TypeScript**: Strict type checking required
- **ESLint**: Follow configured linting rules
- **Comments**: Document complex logic and components
- **Testing**: Include tests for new features

### Areas for Contribution

- 🌐 **Internationalization**: Multi-language support
- 📱 **Mobile App**: React Native implementation
- 📊 **Analytics**: Advanced brewing analytics
- 🔧 **Integrations**: Smart scale and grinder connectivity
- 🎨 **Themes**: Additional UI themes and customization

## 📖 Documentation

### API Documentation
- [API Reference](./docs/api.md) - Detailed API endpoint documentation
- [Type Definitions](./src/types/index.ts) - Complete TypeScript interfaces

### User Guides
- [Getting Started Guide](./docs/getting-started.md) - New user walkthrough
- [AI Features Guide](./docs/ai-features.md) - AI analysis capabilities
- [Brewing Tips](./docs/brewing-tips.md) - Expert brewing advice

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Coffee Community**: Inspiration from specialty coffee enthusiasts worldwide
- **OpenAI**: Advanced vision capabilities for coffee analysis
- **Supabase**: Excellent backend-as-a-service platform
- **Next.js Team**: Outstanding React framework

---

*Built with ☕ and passion for great coffee*