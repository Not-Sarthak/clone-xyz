"use client"

import { TextAnimate } from "@/components/animations/text-animate"
import { RoughNotation } from "react-rough-notation"
import { TEMPLATES } from "@/utils/data"
import { TemplateCard } from "@/components/cards/template-card"
import Footer from "@/components/ui/footer"
import { NavBar } from "@/components/headers/tubelight-navbar"
import { RiAppsLine, RiRobot2Line, RiTeamLine } from "@remixicon/react"
import { useState } from "react"

const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All")

  const filterItems = [
    { name: "All", url: "#", icon: RiAppsLine },
    { name: "DeFAI", url: "#", icon: RiRobot2Line },
    { name: "Social", url: "#", icon: RiTeamLine },
  ]

  const handleFilterChange = (tab: string) => {
    setSelectedCategory(tab)
  }

  const filteredTemplates = TEMPLATES.filter((template) => {
    if (selectedCategory === "All") {
      return true
    }
    return template.category === selectedCategory
  })

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 bg-gray-50/50">
        <div className="px-4 pt-16">
          <div className="mx-auto max-w-6xl border-x border-dashed border-gray-300">
            <div className="text-center">
              <RoughNotation
                type="underline"
                show={true}
                strokeWidth={3}
                animationDuration={400}
                animationDelay={0}
                color="#F97316"
                brackets={["left", "right"]}
              >
                <span className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Agent Templates
                </span>
              </RoughNotation>

              <TextAnimate
                animation="fadeIn"
                by="line"
                delay={0.5}
                className="mx-auto mt-2 max-w-2xl text-base text-gray-600"
              >
                Choose from our curated collection of AI agent templates or
                create your own custom solution
              </TextAnimate>
            </div>

            <div className="mt-8 flex justify-start px-4">
            <NavBar 
              items={filterItems}
              onTabChange={handleFilterChange}
              className="max-w-md"
            />
          </div>

            <div className="mt-10 grid gap-6 px-4 pb-16 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template) => (
                <TemplateCard key={template.id} {...template} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Templates
