# ☕ Coffee Tracker

A modern, AI-powered coffee tracking application built with Next.js and Supabase.

## Features

- 📸 **AI-Powered Photo Recognition**: Take a photo of your coffee bag and automatically extract all the details
- ☕ **Comprehensive Coffee Data**: Track roasters, coffees, bags, and brewing sessions
- 🎯 **Intelligent Extraction**: Uses OpenAI Vision to extract detailed information including:
  - Roaster background and history
  - Coffee origin, variety, and processing details
  - Flavor profiles and tasting notes
  - Cupping scores and certifications
- 📱 **Mobile-First Design**: Optimized for coffee enthusiasts on the go
- 🎨 **Beautiful UI**: Clean interface with Catppuccin Macchiato color scheme

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: OpenAI GPT-4 Vision API
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+
- Docker (for local Supabase)
- OpenAI API key (optional, has mock mode)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   Add your OpenAI API key (or leave for mock mode)

4. Start local development:
   ```bash
   # Start Supabase
   npx supabase start
   
   # Start Next.js
   npm run dev
   ```

5. Open [http://localhost:3001](http://localhost:3001)

## Database Schema

- **roasters**: Coffee roaster information with background details
- **coffees**: Coffee details with origin, processing, and flavor data
- **bags**: Individual bag purchases with roast dates and prices
- **brews**: Brewing sessions with parameters and ratings

## Development

- Authentication is disabled by default for easier development
- Uses mock data when OpenAI API key is not provided
- All database constraints removed for simplified local development

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test locally
4. Submit a pull request

## License

MIT License