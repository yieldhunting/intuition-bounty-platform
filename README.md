# Intuition Bounty Board 🏆

A revolutionary decentralized marketplace for data bounties and reputation intelligence, built natively on the Intuition Protocol. Features dual bounty types, complete trust escrow system, community validation, and professional arbitration.

## 🚀 Live Demo

[🌐 **Try the Live Application**](https://intuition-bounty-platform.vercel.app/) ✨ **LIVE NOW!**

### 🎯 **Demo Features Currently Active:**
- ✅ **Wallet Connection** - Connect to Intuition testnet
- ✅ **Bounty Discovery** - Browse real bounties from Intuition Protocol
- ✅ **Dual Creation** - Create both Data and Reputation bounties
- ✅ **Instant Submissions** - Submit solutions with local state management
- ✅ **Visual Classification** - Color-coded bounty type labels
- ✅ **Reputation Analysis** - Complete expert analysis framework
- ✅ **Responsive Design** - Full mobile and desktop support

## ✨ Key Features

### 🎯 **Dual Bounty System**
- **📊 Data Bounties** - Traditional dataset and analysis requests
- **🏆 Reputation Bounties** - Expert reputation analysis for any Intuition atom

### 🛡️ **Complete Trust Infrastructure** 
- **MultiVault Escrow** - Secure fund locking with automatic release/refund
- **Community Staking** - Decentralized quality validation through stake-weighted voting
- **Professional Arbitration** - Expert dispute resolution for contested submissions
- **Automated Resolution** - Smart contract-based consensus processing

### 🌟 **Revolutionary UX**
- **Instant Submissions** - No blockchain delays for solution submission
- **Hybrid State Management** - Combines blockchain security with local performance
- **Professional UI/UX** - Dark theme with responsive design and visual bounty type labels
- **Visual Distinction** - Color-coded labels (📊 Data / 🏆 Reputation) for easy identification
- **Role-Based Access** - Dynamic interfaces for creators, solvers, arbitrators

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Next.js 16** with App Router and webpack build mode
- **TypeScript** with strict typing
- **Tailwind CSS** with dark theme
- **RainbowKit + wagmi** for wallet integration

### **Blockchain Integration**
- **Intuition Protocol SDK** v2.0.0-alpha.2
- **Intuition Testnet** (Chain ID: 13579)
- **Real GraphQL** integration for live data
- **MultiVault** escrow system (demo mode for hackathon)
- **Advanced Deployment** - Vercel with custom webpack configuration

### **Key Innovation: Reputation Intelligence Marketplace**
The first decentralized platform enabling expert reputation analysis for any atom in the Intuition ecosystem, creating a knowledge marketplace for reputation intelligence.

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/yieldhunting/intuition-bounty-platform.git
cd intuition-bounty-platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Wallet Setup
1. **Connect** MetaMask or compatible wallet
2. **Add Intuition Testnet**:
   - Network Name: `Intuition Testnet`
   - RPC URL: `https://testnet.rpc.intuition.systems/http`
   - Chain ID: `13579`
   - Currency: `tTRUST`
3. **Get testnet tokens** from Intuition faucet

## 📖 How to Use

### Creating Bounties
1. **Choose Type**: Data bounty or Reputation bounty
2. **Fill Details**: Title, description/criteria, reward, deadline
3. **Create Escrow**: Lock funds in secure MultiVault
4. **Go Live**: Bounty becomes available for submissions

### Submitting Solutions

#### Data Bounties
- Submit Portal URLs linking to your data solutions
- Instant local submission with blockchain verification

#### Reputation Bounties  
- Complete comprehensive reputation analysis
- 5-category scoring system with qualitative reasoning
- Expert credential verification required

### Community Validation
- **Stake FOR/AGAINST** submissions based on quality
- **70% threshold** for automatic approval/rejection
- **Disputed submissions** go to arbitration

### Arbitration & Resolution
- **Professional arbitrators** resolve disputed cases
- **Automated resolution** for clear consensus
- **Transparent decision tracking** with reasoning

## 🎭 Component Architecture

### Core Components
- **BountyDiscovery** - Marketplace with real-time data and visual type labels
- **CreateBounty** - Dual-type bounty creation with comprehensive forms
- **SubmitSolution** - Instant submission interface for data bounties
- **ReputationAnalysis** - Expert analysis framework with 5-category scoring
- **ReputationAnalysisViewer** - Interactive display for submitted analyses
- **CommunityStaking** - Validation and voting (demo implementation)
- **ReputationSystem** - Multi-dimensional reputation tracking with badges
- **EscrowManager** - Fund management and security (demo mode)

### Infrastructure
- **GraphQL Client** - Live Intuition Protocol data fetching
- **Escrow System** - MultiVault integration with demo functionality
- **Reputation Framework** - Multi-dimensional analysis and scoring
- **Role Management** - Dynamic permission system
- **Advanced Webpack** - Custom configuration for Web3 dependencies

## 🌐 Network Configuration

```typescript
// Intuition Testnet
{
  id: 13579,
  name: 'Intuition Testnet',
  nativeCurrency: { name: 'tTRUST', symbol: 'tTRUST', decimals: 18 },
  rpcUrls: { 
    default: { http: ['https://testnet.rpc.intuition.systems/http'] }
  }
}
```

## 📚 Documentation

- **[Intuition Protocol Docs](https://docs.intuition.systems)** - Core protocol documentation
- **[Testnet Explorer](https://testnet.explorer.intuition.systems)** - Transaction explorer
- **[GraphQL API](https://testnet.intuition.sh/v1/graphql)** - Data query endpoint

## 🤝 Contributing

This project demonstrates advanced integration with the Intuition Protocol. Contributions welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Intuition Protocol** for the revolutionary knowledge graph infrastructure
- **Next.js Team** for the outstanding React framework
- **Tailwind CSS** for the utility-first CSS framework
- **RainbowKit** for seamless Web3 wallet integration

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yieldhunting/intuition-bounty-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yieldhunting/intuition-bounty-platform/discussions)

---

**Built with ❤️ for the Intuition ecosystem and decentralized knowledge graphs**
