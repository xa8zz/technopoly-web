# Technopoly Web - Tech Market Simulation Game

A modern web-based version of the Technopoly business simulation game, built with Svelte and powered by JavaScript. Build your tech empire from a garage startup to market dominance!

## 🎮 Game Overview

Technopoly is a comprehensive business simulation where you:
- Start with a garage startup and $1M in funding
- Develop innovative products in AI, Cloud Computing, Cybersecurity, and more
- Compete against 20 AI companies across 4 tiers (Startup → Big Tech)
- Manage employees, campuses, finances, and strategic acquisitions
- Achieve victory by controlling 70% market share or acquiring all competitors

## 🚀 Features

### Core Gameplay
- **Product Development**: Launch products in 8+ markets with R&D, Q&A, and Marketing teams
- **Financial Management**: Take loans, invest in bonds, manage cash flow
- **Mergers & Acquisitions**: Acquire competitors to expand your market presence
- **Operations**: Hire employees, build campuses, optimize overhead costs
- **Market Dynamics**: Dynamic market growth, recessions, and competitive revenue distribution

### Technical Features
- **Save/Load System**: Complete game state serialization with localStorage
- **Real-time Analytics**: Company rankings, market insights, victory tracking
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Navigation**: Full keyboard shortcuts support
- **Smooth Animations**: Svelte transitions for enhanced UX
- **Interactive Tutorial**: Comprehensive 6-section learning system

## 🎯 Victory Conditions

Win by achieving either:
1. **Market Dominance**: Control 70% of total market capitalization
2. **Technopoly**: Acquire all competitor companies

Avoid bankruptcy (negative cash for 4 consecutive quarters)!

## ⌨️ Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Next Turn | `Space` / `Enter` |
| Save Game | `Ctrl+S` |
| Load Game | `Ctrl+L` |
| Summary Tab | `1` |
| Products Tab | `2` |
| Finances Tab | `3` |
| Operations Tab | `4` |
| Stock Market Tab | `5` |
| M&A Tab | `6` |
| Show Help | `F1` / `?` |

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd technopoly-web

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
technopoly-web/
├── src/
│   ├── lib/
│   │   ├── components/          # Svelte components
│   │   │   ├── tabs/           # Game interface tabs
│   │   │   ├── modals/         # Modal dialogs
│   │   │   └── shared/         # Reusable components
│   │   └── game/               # Game engine
│   │       ├── engine.js       # Main game logic
│   │       ├── models.js       # Company, Product, Market classes
│   │       ├── ai.js           # AI competitor logic
│   │       ├── finances.js     # Financial calculations
│   │       └── events.js       # Random events system
│   ├── App.svelte              # Main application
│   └── main.js                 # Entry point
├── public/                     # Static assets
└── package.json               # Dependencies and scripts
```

## 🎨 Technology Stack

- **Frontend**: Svelte 4 + Vite
- **Styling**: Tailwind CSS with custom tech theme
- **State Management**: Reactive Svelte stores
- **Persistence**: localStorage for save/load
- **Build Tool**: Vite with HMR support

## 🎲 Game Mechanics

### Markets & Products
- 8 initial markets: AI, Cloud Computing, Cybersecurity, Enterprise SaaS, E-Commerce, Consumer Hardware, FinTech, Social Media
- 12 additional markets spawn over time: Semiconductors, Autonomous Vehicles, Blockchain, etc.
- Product effectiveness based on R&D, Q&A, and Marketing investment
- Revenue redistribution every quarter based on market share

### Financial System
- **Loans**: $10K-$10M, 1-5 years, 6-15% APR with monthly payments
- **Bonds**: $5K-$5M, 1-5 years, 2-10% annual yield with quarterly interest
- **Market Cap**: Calculated from revenue, assets, and debt
- **Campus Types**: Garage (free) → Small Office → Large Office → Large Building

### AI Competitors
- **4 Tiers**: Startup (5 companies) → Medium (7) → Large (5) → Big Tech (3)
- **Dynamic Behavior**: Tier-specific strategies for hiring, products, acquisitions
- **Growth Protection**: High-performing companies reject acquisition offers
- **Spawning**: New competitors enter every 2 years

## 🏆 Strategy Tips

### Early Game (Years 1-2)
- Focus on high-growth markets (>12% annually)
- Assign employees to your initial product immediately
- Hire employees as soon as affordable
- Launch products in 2-3 different markets
- Upgrade from Garage to Small Office early

### Mid Game (Years 3-5)
- Take strategic loans for rapid expansion
- Target smaller competitors for acquisition
- Diversify across multiple markets
- Invest excess cash in bonds for stability
- Monitor competitor growth rates

### End Game (Years 6+)
- Focus on acquiring Large and Big Tech companies
- Use accumulated cash reserves for major acquisitions
- Target companies in markets where you're weak
- Monitor your market cap percentage closely
- Prepare for economic downturns and recessions

## 📊 Game Balance

The game is carefully balanced with:
- **Realistic Growth Rates**: Markets grow 5-15% annually
- **Economic Cycles**: Random recessions affect market size
- **Competitive Dynamics**: 8% revenue churn redistributed quarterly
- **Financial Constraints**: Loan risk limits and cash flow management
- **Strategic Depth**: Multiple paths to victory with meaningful trade-offs

## 🐛 Known Issues

- None currently reported! The game has been thoroughly tested.

## 🤝 Contributing

This is a complete conversion of the original Python Technopoly game to modern web technologies. The codebase is well-documented and modular for easy maintenance and feature additions.

## 📜 License

[Add your license information here]

## 🎉 Credits

- Original Technopoly game concept and mechanics
- Web conversion and modern UI/UX implementation
- Built with love using Svelte and modern web technologies

---

**Ready to build your tech empire? Start playing Technopoly Web today!** 🚀 