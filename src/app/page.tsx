import FeatureDivider from "@/components/ui/feature-divider"
import Features from "@/components/ui/features"
import { Hero } from "@/components/ui/hero"
import { AgentAnalytics } from "@/components/ui/agent-analytics"

export default function Home() {
  return (
    <main className="relative mx-auto flex flex-col">
      <div className="pt-56">
        <Hero />
      </div>
      <div className="mt-52 px-4 xl:px-0">
        <Features />
      </div>
      <FeatureDivider className="my-16 max-w-6xl" />
      <div className="mt-12 mb-40 px-4 xl:px-0">
        <AgentAnalytics />
      </div>
    </main>
  )
}
