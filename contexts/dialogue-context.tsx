"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { openDB } from "idb"
import { debounce } from "@/lib/utils"

export type KeyFrame = {
  percentage: number
  scale?: number
  rotation?: number
  rotationType?: "uniform" | "backAndForth" | "accelerate" | "decelerate"
  position?: { x: number; y: number }
  movementType?: "uniform" | "backAndForth" | "accelerate" | "decelerate" | "elastic"
  screenColor?: string
  cameraShake?: boolean
  vibration?: boolean
}

export type Animation = {
  startTime: number
  duration: number
  repeatCount: number
  keyframes: KeyFrame[]
}

export type Dialogue = {
  id: string
  speaker: string
  content: string
  voiceUrl?: string
  animation?: Animation
}

export type Paragraph = {
  id: string
  videoUrl: string
  videoTimeRange?: { start: number; end: number }
  videoMuted: boolean
  videoLoop: boolean
  dialogues: Dialogue[]
}

export type DialogueScript = {
  id: string
  name: string
  playerName: string
  paragraphs: Paragraph[]
  createdAt: number
  updatedAt: number
}

// 修改 PresetGroup 类型，将 presetIds 改为 presets 数组存储完整预设数据
export type PresetGroup = {
  id: string
  name: string
  presets: DialogueScript[] // 改为存储完整的预设数据，而不是仅存储ID
  createdAt: number
}

export type DialogueSettings = {
  dialogueBox: {
    style: string
    color: string
    height: number
    width: number
    borderRadius: number
    opacity: number
  }
  text: {
    fontFamily: string
    fontSize: number
    fontWeight: string
    fontStyle: string
    textDecoration: string
    color: string
  }
}

type DialogueContextType = {
  currentScript: DialogueScript
  setCurrentScript: (script: DialogueScript) => void
  presets: DialogueScript[]
  presetGroups: PresetGroup[]
  settings: DialogueSettings
  saveCurrentAsPreset: () => void
  loadPreset: (id: string) => void
  deletePreset: (id: string) => void
  createPresetGroup: (name: string, presetIds: string[]) => void
  loadPresetGroup: (id: string) => void
  deletePresetGroup: (id: string) => void
  exportPreset: (id: string) => string
  exportPresetGroup: (id: string) => string
  importFromJson: (json: string) => void
  updateSettings: (newSettings: DialogueSettings) => void
}

const defaultSettings: DialogueSettings = {
  dialogueBox: {
    style: "default",
    color: "#000000",
    height: 200,
    width: 80,
    borderRadius: 10,
    opacity: 0.8,
  },
  text: {
    fontFamily: "sans-serif",
    fontSize: 16,
    fontWeight: "normal",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#ffffff",
  },
}

const defaultScript: DialogueScript = {
  id: "default",
  name: "新剧本",
  playerName: "玩家",
  paragraphs: [
    {
      id: "p1",
      videoUrl: "",
      videoMuted: true,
      videoLoop: true,
      dialogues: [
        {
          id: "d1",
          speaker: "NPC",
          content: "你好，@player！欢迎来到游戏对话模拟器。",
        },
      ],
    },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

const DialogueContext = createContext<DialogueContextType | undefined>(undefined)

export function DialogueProvider({ children }: { children: ReactNode }) {
  const [currentScript, setCurrentScript] = useState<DialogueScript>(defaultScript)
  const [presets, setPresets] = useState<DialogueScript[]>([])
  const [presetGroups, setPresetGroups] = useState<PresetGroup[]>([])
  const [settings, setSettings] = useState<DialogueSettings>(defaultSettings)
  const [dbInitialized, setDbInitialized] = useState(false)

  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
      const db = await openDB("dialogueSimulatorDB", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("presets")) {
            db.createObjectStore("presets", { keyPath: "id" })
          }
          if (!db.objectStoreNames.contains("presetGroups")) {
            db.createObjectStore("presetGroups", { keyPath: "id" })
          }
          if (!db.objectStoreNames.contains("settings")) {
            db.createObjectStore("settings", { keyPath: "id" })
          }
        },
      })

      // Load presets
      const presetTx = db.transaction("presets", "readonly")
      const presetStore = presetTx.objectStore("presets")
      const loadedPresets = await presetStore.getAll()
      setPresets(loadedPresets)

      // Load preset groups
      const groupTx = db.transaction("presetGroups", "readonly")
      const groupStore = groupTx.objectStore("presetGroups")
      const loadedGroups = await groupStore.getAll()
      setPresetGroups(loadedGroups)

      // Load settings
      const settingsTx = db.transaction("settings", "readonly")
      const settingsStore = settingsTx.objectStore("settings")
      const loadedSettings = await settingsStore.get("userSettings")
      if (loadedSettings) {
        setSettings(loadedSettings.value)
      }

      setDbInitialized(true)
    }

    initDB()
  }, [])

  // Save changes with debounce
  const saveToIndexedDB = debounce(async () => {
    if (!dbInitialized) return

    const db = await openDB("dialogueSimulatorDB", 1)

    // Save presets
    const presetTx = db.transaction("presets", "readwrite")
    const presetStore = presetTx.objectStore("presets")
    for (const preset of presets) {
      await presetStore.put(preset)
    }

    // Save preset groups
    const groupTx = db.transaction("presetGroups", "readwrite")
    const groupStore = groupTx.objectStore("presetGroups")
    for (const group of presetGroups) {
      await groupStore.put(group)
    }

    // Save settings
    const settingsTx = db.transaction("settings", "readwrite")
    const settingsStore = settingsTx.objectStore("settings")
    await settingsStore.put({ id: "userSettings", value: settings })
  }, 500)

  // Save changes when state updates
  useEffect(() => {
    if (dbInitialized) {
      saveToIndexedDB()
    }
  }, [presets, presetGroups, settings, dbInitialized])

  const saveCurrentAsPreset = () => {
    const newPreset = {
      ...currentScript,
      id: `preset_${Date.now()}`,
      updatedAt: Date.now(),
    }
    setPresets([...presets, newPreset])
  }

  const loadPreset = (id: string) => {
    const preset = presets.find((p) => p.id === id)
    if (preset) {
      setCurrentScript({
        ...preset,
        playerName: currentScript.playerName, // Keep current player name
      })
    }
  }

  // 修改 deletePreset 函数，不再从预设组中移除预设
  const deletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id))
    // 不再从预设组中移除预设ID，因为预设组现在存储的是完整数据
  }

  // 修改 createPresetGroup 函数，存储预设的完整数据
  const createPresetGroup = (name: string, presetIds: string[]) => {
    // 获取选中预设的完整数据
    const groupPresets = presets.filter((p) => presetIds.includes(p.id))

    const newGroup: PresetGroup = {
      id: `group_${Date.now()}`,
      name,
      presets: groupPresets, // 存储完整的预设数据
      createdAt: Date.now(),
    }
    setPresetGroups([...presetGroups, newGroup])
  }

  // 修改 loadPresetGroup 函数，加载预设组中的完整预设数据
  const loadPresetGroup = (id: string) => {
    const group = presetGroups.find((g) => g.id === id)
    if (group) {
      // 直接使用预设组中存储的完整预设数据
      setPresets((prevPresets) => {
        // 移除已存在的同ID预设
        const existingIds = group.presets.map((p) => p.id)
        const filteredPresets = prevPresets.filter((p) => !existingIds.includes(p.id))
        // 添加预设组中的预设
        return [...filteredPresets, ...group.presets]
      })
    }
  }

  const deletePresetGroup = (id: string) => {
    setPresetGroups(presetGroups.filter((g) => g.id !== id))
  }

  // 修改 exportPresetGroup 函数，适应新的数据结构
  const exportPresetGroup = (id: string) => {
    const group = presetGroups.find((g) => g.id === id)
    if (group) {
      return JSON.stringify({
        group: {
          id: group.id,
          name: group.name,
          createdAt: group.createdAt,
        },
        presets: group.presets,
      })
    }
    return ""
  }

  const exportPreset = (id: string) => {
    const preset = presets.find((p) => p.id === id)
    if (preset) {
      return JSON.stringify(preset)
    }
    return ""
  }

  // 修改 importFromJson 函数，适应新的数据结构
  const importFromJson = (json: string) => {
    try {
      const data = JSON.parse(json)

      // 检查是否是预设
      if (data.paragraphs) {
        const newPreset: DialogueScript = {
          ...data,
          id: `preset_${Date.now()}`,
          updatedAt: Date.now(),
        }
        setPresets([...presets, newPreset])
      }
      // 检查是否是预设组
      else if (data.group && data.presets) {
        // 更新导入的预设ID
        const importedPresets = data.presets.map((p: DialogueScript) => ({
          ...p,
          id: `preset_${Date.now()}_${p.id}`,
          updatedAt: Date.now(),
        }))

        const newGroup: PresetGroup = {
          ...data.group,
          id: `group_${Date.now()}`,
          createdAt: Date.now(),
          presets: importedPresets, // 使用新的数据结构
        }

        setPresets([...presets, ...importedPresets])
        setPresetGroups([...presetGroups, newGroup])
      }
    } catch (error) {
      console.error("导入JSON失败:", error)
      alert(`JSON格式错误: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const updateSettings = (newSettings: DialogueSettings) => {
    setSettings(newSettings)
  }

  return (
    <DialogueContext.Provider
      value={{
        currentScript,
        setCurrentScript,
        presets,
        presetGroups,
        settings,
        saveCurrentAsPreset,
        loadPreset,
        deletePreset,
        createPresetGroup,
        loadPresetGroup,
        deletePresetGroup,
        exportPreset,
        exportPresetGroup,
        importFromJson,
        updateSettings,
      }}
    >
      {children}
    </DialogueContext.Provider>
  )
}

export function useDialogue() {
  const context = useContext(DialogueContext)
  if (context === undefined) {
    throw new Error("useDialogue must be used within a DialogueProvider")
  }
  return context
}

