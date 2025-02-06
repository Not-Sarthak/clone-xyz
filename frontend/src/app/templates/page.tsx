"use client";

import { useState } from "react";
import { NavBar } from "@/components/headers/tubelight-navbar"
import { RiCoinsLine, RiHome2Fill, RiUser2Fill } from "@remixicon/react"

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
}

const TEMPLATES: Template[] = [
  // All Templates
  {
    id: "template-1",
    title: "Basic Template",
    description: "A versatile template for multiple use cases",
    category: "All",
  },
  {
    id: "template-2",
    title: "Advanced Template",
    description: "Perfect for general purpose applications",
    category: "All",
  },
  
  // DeFAI Templates
  {
    id: "defi-1",
    title: "DeFi Dashboard",
    description: "Complete DeFi portfolio management solution",
    category: "DeFAI",
  },
  {
    id: "defi-2",
    title: "AI Trading Bot",
    description: "Automated trading with AI capabilities",
    category: "DeFAI",
  },
  {
    id: "defi-3",
    title: "Yield Optimizer",
    description: "Smart yield farming and optimization",
    category: "DeFAI",
  },
  
  // Social Templates
  {
    id: "social-1",
    title: "Community Hub",
    description: "Build engaging community platforms",
    category: "Social",
  },
  {
    id: "social-2",
    title: "Social Network",
    description: "Create your own social networking platform",
    category: "Social",
  },
  {
    id: "social-3",
    title: "DAO Governance",
    description: "Decentralized community governance tools",
    category: "Social",
  },
]

const TemplateCard: React.FC<Template> = ({ title, description }) => (
  <div className="rounded-xl border border-gray-200 p-4 hover:border-orange-200 transition-colors hover:shadow-sm">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
)

const Templates: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');

  const navItems = [
    { name: 'All', url: '#', icon: RiHome2Fill },
    { name: 'DeFAI', url: '#', icon: RiCoinsLine },
    { name: 'Social', url: '#', icon: RiUser2Fill },
  ]

  const getFilteredTemplates = () => {
    if (activeTab === 'All') {
      return TEMPLATES.filter((_, index) => index < 6);
    }
    return TEMPLATES.filter(template => template.category === activeTab);
  }

  return (
    <div className="w-full flex justify-center min-h-screen">
      <div className="border-b border-x px-4 pt-20 border-dashed border-gray-300 stroke-gray-300 max-w-6xl w-full">
        <div>Templates</div>
        <div>
          <NavBar 
            items={navItems} 
            onTabChange={setActiveTab}
          />
          <div className="mt-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredTemplates().map((template) => (
                <TemplateCard
                  key={template.id}
                  {...template}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Templates