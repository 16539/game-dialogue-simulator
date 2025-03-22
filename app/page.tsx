"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SettingsInterface from "@/components/settings-interface"
import PresetInterface from "@/components/preset-interface"
import DemoInterface from "@/components/demo-interface"
import { DialogueProvider } from "@/contexts/dialogue-context"

export default function Home() {
  const [activeTab, setActiveTab] = useState("settings")

  return (
    <DialogueProvider>
      <div className="min-h-screen bg-white text-gray-800">
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6 text-center text-primary">游戏对话模拟器</h1>

          <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="settings">设置界面</TabsTrigger>
              <TabsTrigger value="presets">预设界面</TabsTrigger>
              <TabsTrigger value="demo">演示界面</TabsTrigger>
            </TabsList>

            <TabsContent value="settings" className="mt-4">
              <SettingsInterface />
            </TabsContent>

            <TabsContent value="presets" className="mt-4">
              <PresetInterface />
            </TabsContent>

            <TabsContent value="demo" className="mt-4">
              <DemoInterface onExit={() => setActiveTab("settings")} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DialogueProvider>
  )
}

