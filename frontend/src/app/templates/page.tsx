"use client"

import { TextAnimate } from "@/components/animations/text-animate"
import { RoughNotation } from "react-rough-notation"
import { TEMPLATES } from "@/utils/data"
import Footer from "@/components/ui/footer"
import { NavBar } from "@/components/headers/tubelight-navbar"
import { RiAppsLine, RiRobot2Line, RiTeamLine, RiCloseLine, RiCheckLine, RiDiscordFill, RiTelegramFill } from "@remixicon/react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Template {
  id: string
  title: string
  description: string
  category: string
  features?: string[]
  details: {
    overview: string
    capabilities: string[]
    useCases: string[]
  }
  integration: {
    discord?: boolean
    telegram?: boolean
  }
}

const TemplateCard = ({ 
  title, 
  description, 
  onClick 
}: { 
  title: string
  description: string
  onClick: () => void 
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="group relative rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
    >
      {isHovered && (
        <motion.div 
          className="absolute inset-0 rounded-2xl ring-2 ring-orange-500/50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="mt-auto pt-4">
          <button 
            onClick={onClick}
            className="inline-flex items-center text-sm text-orange-500 hover:text-orange-600 hover:underline cursor-pointer relative"
          >
            <span>View details</span>
            <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}

const TemplateModal = ({
  isOpen,
  template,
  onClose
}: {
  isOpen: boolean
  template: Template | null
  onClose: () => void
}) => {
  if (!isOpen || !template) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="relative mx-auto max-w-3xl p-4"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={onClose}
                className="rounded-full bg-gray-100 p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-500 cursor-pointer"
              >
                <RiCloseLine className="h-5 w-5" />
              </button>
            </div>

            <div className="relative p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl text-gray-900">{template.title}</h3>
                  <p className="mt-2 text-sm text-gray-500">{template.description}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-900">Overview</span>
                    <p className="mt-2 text-sm text-gray-500">{template.details.overview}</p>
                  </div>

                  <div>
                    <span className="text-sm text-gray-900">Capabilities</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {template.details.capabilities.map((capability, index) => (
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-orange-300 bg-orange-50 px-3 py-1 text-xs text-orange-600"
                        >
                          <RiCheckLine className="h-3 w-3" />
                          {capability}
                        </motion.span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-900">Use Cases</span>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {template.details.useCases.map((useCase, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-2"
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400" />
                          <span className="text-sm text-gray-500">{useCase}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 pt-4 sm:grid-cols-2">
                  {template.integration.discord && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#4752C4] cursor-pointer"
                    >
                      <RiDiscordFill className="h-4 w-4" />
                      Add to Discord
                    </motion.button>
                  )}
                  {template.integration.telegram && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center justify-center gap-2 rounded-lg bg-[#229ED9] px-4 py-2.5 text-sm text-white transition-colors hover:bg-[#1C85B7] cursor-pointer"
                    >
                      <RiTelegramFill className="h-4 w-4" />
                      Add to Telegram
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

const Templates: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filterItems = [
    { name: "All", url: "#", icon: RiAppsLine },
    { name: "DeFAI", url: "#", icon: RiRobot2Line },
    { name: "Social", url: "#", icon: RiTeamLine },
  ]

  const handleFilterChange = (tab: string) => {
    setSelectedCategory(tab)
  }

  const handleOpenModal = (template: Template) => {
    setSelectedTemplate(template)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTemplate(null)
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
                <TemplateCard 
                  key={template.id}
                  title={template.title}
                  description={template.description}
                  onClick={() => handleOpenModal(template)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <TemplateModal 
        isOpen={isModalOpen}
        template={selectedTemplate}
        onClose={handleCloseModal}
      />
      
      <Footer />
    </div>
  )
}

export default Templates