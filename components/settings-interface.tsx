"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PlusCircle, MinusCircle, ChevronDown, Save } from "lucide-react"
import { useDialogue, type Paragraph } from "@/contexts/dialogue-context"
import ParagraphEditor from "@/components/paragraph-editor"
import { v4 as uuidv4 } from "uuid"

export default function SettingsInterface() {
  const { currentScript, setCurrentScript, saveCurrentAsPreset } = useDialogue()

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentScript({
      ...currentScript,
      playerName: e.target.value,
      updatedAt: Date.now(),
    })
  }

  const handleScriptNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentScript({
      ...currentScript,
      name: e.target.value,
      updatedAt: Date.now(),
    })
  }

  const addParagraph = () => {
    const newParagraph: Paragraph = {
      id: uuidv4(),
      videoUrl: "",
      videoMuted: true,
      videoLoop: true,
      dialogues: [
        {
          id: uuidv4(),
          speaker: "NPC",
          content: "新对话内容",
        },
      ],
    }

    setCurrentScript({
      ...currentScript,
      paragraphs: [...currentScript.paragraphs, newParagraph],
      updatedAt: Date.now(),
    })
  }

  const deleteParagraph = (paragraphId: string) => {
    setCurrentScript({
      ...currentScript,
      paragraphs: currentScript.paragraphs.filter((p) => p.id !== paragraphId),
      updatedAt: Date.now(),
    })
  }

  const updateParagraph = (updatedParagraph: Paragraph) => {
    setCurrentScript({
      ...currentScript,
      paragraphs: currentScript.paragraphs.map((p) => (p.id === updatedParagraph.id ? updatedParagraph : p)),
      updatedAt: Date.now(),
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">设置界面</h2>
        <Button onClick={saveCurrentAsPreset} className="flex items-center gap-2 bg-primary hover:bg-primary/90">
          <Save size={16} />
          保存为预设
        </Button>
      </div>

      <div className="space-y-4 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">基本信息</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="scriptName" className="text-gray-700">
              剧本名称
            </Label>
            <Input
              id="scriptName"
              value={currentScript.name}
              onChange={handleScriptNameChange}
              className="bg-white border-gray-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-gray-700">
              玩家名字
            </Label>
            <Input
              id="playerName"
              value={currentScript.playerName}
              onChange={handlePlayerNameChange}
              className="bg-white border-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">段落列表</h3>
          <Button
            onClick={addParagraph}
            variant="outline"
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
          >
            <PlusCircle size={16} />
            添加段落
          </Button>
        </div>

        {currentScript.paragraphs.length === 0 ? (
          <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">暂无段落，请点击"添加段落"按钮创建</p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentScript.paragraphs.map((paragraph, index) => (
              <div key={paragraph.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <Collapsible defaultOpen={index === 0}>
                  <div className="flex items-center justify-between p-4 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger className="flex items-center gap-2">
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 collapsible-closed:rotate-[-90deg] text-gray-600" />
                        <span className="font-medium text-gray-800">段落 {index + 1}</span>
                      </CollapsibleTrigger>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteParagraph(paragraph.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <MinusCircle size={16} />
                    </Button>
                  </div>

                  <CollapsibleContent>
                    <div className="p-4 bg-white">
                      <ParagraphEditor
                        paragraph={paragraph}
                        onUpdate={updateParagraph}
                        isFirstParagraph={index === 0}
                        playerName={currentScript.playerName}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

