export interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  features: string[];
  integration: {
    discord?: boolean;
    telegram?: boolean;
  };
  details: {
    overview: string;
    capabilities: string[];
    useCases: string[];
    requirements?: string[];
  };
}

export const TEMPLATES: Template[] = [
  {
    id: "defi-1",
    title: "DeFi Trading Bot",
    description: "Automated trading bot with advanced AI capabilities for DeFi markets. Perfect for yield farming and token swaps.",
    category: "DeFAI",
    features: [
      "Multi-DEX Support",
      "Custom Trading Strategies",
      "Real-time Analytics"
    ],
    integration: {
      discord: true,
      telegram: true
    },
    details: {
      overview: "A sophisticated DeFi trading bot that leverages AI to automate trading strategies across multiple DEXs. Perfect for yield farmers and token traders looking to optimize their returns.",
      capabilities: [
        "Automated trading across multiple DEXs",
        "Custom strategy creation and backtesting",
        "Real-time market analysis and alerts",
        "Risk management and position sizing",
        "Portfolio rebalancing"
      ],
      useCases: [
        "Yield Farming Optimization",
        "Token Swap Automation",
        "Arbitrage Trading",
        "Portfolio Management"
      ],
      requirements: [
        "Web3 Wallet Connection",
        "Initial Token Balance",
        "Trading Pair Selection"
      ]
    }
  },
  {
    id: "defi-2",
    title: "DeFi Yield Farming Bot",
    description: "Automated yield farming bot with AI-driven strategies for DeFi protocols.",
    category: "DeFAI",
    features: [
      "Multi-Protocol Support",
      "AI-Powered Yield Optimization",
      "Real-time Analytics"
    ],
    integration: {
      discord: true,
      telegram: true
    },
    details: {
      overview: "A cutting-edge DeFi yield farming bot that leverages AI to optimize your returns across multiple protocols. Perfect for yield farmers looking to maximize their yields.",
      capabilities: [
        "Automated yield farming across multiple protocols",
        "AI-driven strategy optimization",
        "Real-time analytics and alerts",
        "Risk management and position sizing" 
      ],
      useCases: [
        "Yield Farming Optimization",
        "Token Staking Automation",
        "Protocol-Specific Strategies"
      ],
      requirements: [
        "Web3 Wallet Connection",
        "Initial Token Balance",
        "Protocol-Specific Requirements"
      ]
    }
  },
  {
    id: "social-1",
    title: "Social Media Bot",
    description: "Automated social media bot with advanced AI capabilities for social media platforms.",
    category: "Social",
    features: [
      "Multi-Platform Support",
      "AI-Powered Content Generation",
      "Real-time Analytics"
    ],
    integration: {
      discord: true,
      telegram: true
    },
    details: {
      overview: "A sophisticated social media bot that leverages AI to automate content generation and engagement across multiple platforms. Perfect for social media managers and content creators looking to optimize their social media presence.",
      capabilities: [
        "Automated content generation and scheduling",
        "AI-driven engagement optimization",
        "Real-time analytics and insights",
        "Social media management and monitoring",
        "Content curation and recommendation"
      ],
      useCases: [
        "Social media content creation and scheduling",
        "Social media engagement optimization",
        "Social media analytics and insights",
        "Social media management and monitoring"
      ],
      requirements: [
        "Social media account creation and management",
        "Content creation and scheduling",
        "Social media platform integration"
      ]
    }
  },
  
];

export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find(template => template.id === id);
}