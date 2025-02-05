import {
  RiRobot2Fill,
  RiDiscordFill,
  RiTelegramFill,
  RiRocket2Fill,
} from "@remixicon/react"
import { Divider } from "../divider"
import { StickerCard } from "./sticker-card"

export function AgentAnalytics() {
  return (
    <section
      aria-labelledby="agent-analytics"
      className="relative mx-auto w-full max-w-6xl overflow-hidden"
    >
      <div>
        <h2
          id="agent-analytics"
          className="relative scroll-my-24 text-lg font-semibold tracking-tight text-orange-500"
        >
          Trade Analytics
          <div className="absolute top-1 -left-[8px] h-5 w-[3px] rounded-r-sm bg-orange-500" />
        </h2>
        <p className="mt-2 max-w-lg text-3xl font-semibold tracking-tighter text-balance text-gray-900 md:text-4xl">
          Deploy AI trading agents across platforms in minutes
        </p>
      </div>
      <Divider className="mt-0"></Divider>
      <div className="grid grid-cols-1 grid-rows-2 gap-6 md:grid-cols-4 md:grid-rows-1">
        <StickerCard
          Icon={RiDiscordFill}
          title="Discord Ready"
          description="One-click deployment to any Discord server channel"
        />
        <StickerCard
          Icon={RiTelegramFill}
          title="Telegram Integration"
          description="Seamlessly add trading bots to Telegram groups"
        />
        <StickerCard
          Icon={RiRocket2Fill}
          title="Eigenlayer-Powered"
          description="Deploy and validate agents using Eigenlayer"
        />
        <StickerCard
          Icon={RiRobot2Fill}
          title="Agent Templates"
          description="Pre-built strategies ready for customization"
        />
      </div>
    </section>
  )
}