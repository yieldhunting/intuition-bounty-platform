# Intuition Bounty Board 🏆

A revolutionary decentralized marketplace for data bounties and reputation intelligence, built natively on the Intuition Protocol. Features dual bounty types, complete trust escrow system, community validation, and professional arbitration.

## 🚀 Live Demo

[🌐 **Try the Live Application**](https://intuition-bounty-board.vercel.app) *(Coming Soon)*

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
- **Professional UI/UX** - Dark theme with responsive design
- **Role-Based Access** - Dynamic interfaces for creators, solvers, arbitrators

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Next.js 14** with App Router
- **TypeScript** with strict typing
- **Tailwind CSS** with dark theme
- **RainbowKit + wagmi** for wallet integration

### **Blockchain Integration**
- **Intuition Protocol SDK** v2.0.0-alpha.2
- **Intuition Testnet** (Chain ID: 13579)
- **Real GraphQL** integration for live data
- **MultiVault** escrow system

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
git clone https://github.com/calummacdonald/intuition-bounty-board.git
cd intuition-bounty-board

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
- **BountyDiscovery** - Marketplace with real-time data
- **CreateBounty** - Dual-type bounty creation
- **SubmitSolution** - Instant submission interface
- **ReputationAnalysis** - Expert analysis framework
- **CommunityStaking** - Validation and voting
- **ArbitratorDashboard** - Professional dispute resolution
- **EscrowManager** - Fund management and security

### Infrastructure
- **GraphQL Client** - Live Intuition Protocol data
- **Escrow System** - MultiVault integration
- **Reputation Framework** - Multi-dimensional analysis
- **Role Management** - Dynamic permission system

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

- **Issues**: [GitHub Issues](https://github.com/calummacdonald/intuition-bounty-board/issues)
- **Discussions**: [GitHub Discussions](https://github.com/calummacdonald/intuition-bounty-board/discussions)

---

**Built with ❤️ for the Intuition ecosystem and decentralized knowledge graphs**
