"use client";

import { useParams } from "next/navigation";
import { getTemplateById } from "../../../utils/data";
import { motion } from "framer-motion";
import { RiDiscordFill, RiTelegramFill, RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";

export default function TemplatePage() {
  const params = useParams();
  const template = getTemplateById(params.id as string);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Template not found</h1>
          <Link 
            href="/templates"
            className="mt-4 text-orange-500 hover:text-orange-600"
          >
            Back to templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/templates"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <RiArrowLeftLine className="h-4 w-4" />
          Back to Templates
        </Link>

        <div className="mt-8">
          <h1 className="text-4xl font-bold text-gray-900">{template.title}</h1>
          <p className="mt-4 text-lg text-gray-600">{template.description}</p>
        </div>

        <div className="mt-12 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Overview</h2>
            <p className="mt-4 text-gray-600">{template.details.overview}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Capabilities</h2>
            <ul className="mt-4 space-y-2">
              {template.details.capabilities.map((capability, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  {capability}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">Use Cases</h2>
            <ul className="mt-4 space-y-2">
              {template.details.useCases.map((useCase, index) => (
                <li 
                  key={index}
                  className="flex items-center gap-2 text-gray-600"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  {useCase}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-12 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {template.integration.discord && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3 text-white"
              >
                <RiDiscordFill className="h-5 w-5" />
                Add to Discord
              </motion.button>
            )}
            {template.integration.telegram && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] px-6 py-3 text-white"
              >
                <RiTelegramFill className="h-5 w-5" />
                Add to Telegram
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}