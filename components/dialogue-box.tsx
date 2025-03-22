"use client"

import { Settings } from "lucide-react"
import type { DialogueSettings } from "@/contexts/dialogue-context"

interface DialogueBoxProps {
  speaker: string
  content: string
  settings: DialogueSettings
  onClick: () => void
  onSettingsClick: () => void
}

export default function DialogueBox({ speaker, content, settings, onClick, onSettingsClick }: DialogueBoxProps) {
  const {
    dialogueBox: { style, color, height, width, borderRadius, opacity },
    text: { fontFamily, fontSize, fontWeight, fontStyle, textDecoration, color: textColor },
  } = settings

  return (
    <div
      className="relative"
      style={{
        width: `${width}%`,
        maxWidth: "1200px",
      }}
    >
      <div
        className="p-4 cursor-pointer shadow-lg"
        style={{
          backgroundColor: color,
          borderRadius: `${borderRadius}px`,
          opacity: opacity,
          minHeight: `${height}px`,
        }}
        onClick={onClick}
      >
        <div
          className="font-bold mb-2"
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight,
            fontStyle,
            textDecoration,
            color: textColor,
          }}
        >
          {speaker}
        </div>

        <div
          style={{
            fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight,
            fontStyle,
            textDecoration,
            color: textColor,
          }}
        >
          {content}
        </div>
      </div>

      <button
        className="absolute bottom-2 left-2 p-1 rounded-full bg-white/70 hover:bg-white/90 text-gray-700 transition-colors shadow-md"
        onClick={(e) => {
          e.stopPropagation()
          onSettingsClick()
        }}
      >
        <Settings size={16} />
      </button>
    </div>
  )
}

