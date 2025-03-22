"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDialogue, type DialogueSettings } from "@/contexts/dialogue-context"

export default function DialogueSettingsPanel() {
  const { settings, updateSettings } = useDialogue()
  const [localSettings, setLocalSettings] = useState<DialogueSettings>({ ...settings })

  const handleDialogueBoxChange = (field: keyof DialogueSettings["dialogueBox"], value: any) => {
    setLocalSettings({
      ...localSettings,
      dialogueBox: {
        ...localSettings.dialogueBox,
        [field]: value,
      },
    })
  }

  const handleTextChange = (field: keyof DialogueSettings["text"], value: any) => {
    setLocalSettings({
      ...localSettings,
      text: {
        ...localSettings.text,
        [field]: value,
      },
    })
  }

  const handleSave = () => {
    updateSettings(localSettings)
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dialogueBox">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dialogueBox">对话框</TabsTrigger>
          <TabsTrigger value="text">文本</TabsTrigger>
        </TabsList>

        <TabsContent value="dialogueBox" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="dialogueBoxColor" className="text-gray-700">
              颜色
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                id="dialogueBoxColor"
                value={localSettings.dialogueBox.color}
                onChange={(e) => handleDialogueBoxChange("color", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={localSettings.dialogueBox.color}
                onChange={(e) => handleDialogueBoxChange("color", e.target.value)}
                className="flex-1 bg-white border-gray-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">宽度 ({localSettings.dialogueBox.width}%)</Label>
            <Slider
              value={[localSettings.dialogueBox.width]}
              min={30}
              max={100}
              step={1}
              onValueChange={(value) => handleDialogueBoxChange("width", value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">高度 ({localSettings.dialogueBox.height}px)</Label>
            <Slider
              value={[localSettings.dialogueBox.height]}
              min={100}
              max={400}
              step={10}
              onValueChange={(value) => handleDialogueBoxChange("height", value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">圆角 ({localSettings.dialogueBox.borderRadius}px)</Label>
            <Slider
              value={[localSettings.dialogueBox.borderRadius]}
              min={0}
              max={30}
              step={1}
              onValueChange={(value) => handleDialogueBoxChange("borderRadius", value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">透明度 ({Math.round(localSettings.dialogueBox.opacity * 100)}%)</Label>
            <Slider
              value={[localSettings.dialogueBox.opacity * 100]}
              min={10}
              max={100}
              step={1}
              onValueChange={(value) => handleDialogueBoxChange("opacity", value[0] / 100)}
            />
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fontFamily" className="text-gray-700">
              字体
            </Label>
            <Select
              value={localSettings.text.fontFamily}
              onValueChange={(value) => handleTextChange("fontFamily", value)}
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="选择字体" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sans-serif">Sans-serif</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
                <SelectItem value="cursive">Cursive</SelectItem>
                <SelectItem value="fantasy">Fantasy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">字体大小 ({localSettings.text.fontSize}px)</Label>
            <Slider
              value={[localSettings.text.fontSize]}
              min={12}
              max={36}
              step={1}
              onValueChange={(value) => handleTextChange("fontSize", value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontWeight" className="text-gray-700">
              字体粗细
            </Label>
            <Select
              value={localSettings.text.fontWeight}
              onValueChange={(value) => handleTextChange("fontWeight", value)}
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="选择字体粗细" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">正常</SelectItem>
                <SelectItem value="bold">粗体</SelectItem>
                <SelectItem value="lighter">细体</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontStyle" className="text-gray-700">
              字体风格
            </Label>
            <Select
              value={localSettings.text.fontStyle}
              onValueChange={(value) => handleTextChange("fontStyle", value)}
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="选择字体风格" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">正常</SelectItem>
                <SelectItem value="italic">斜体</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textDecoration" className="text-gray-700">
              文本装饰
            </Label>
            <Select
              value={localSettings.text.textDecoration}
              onValueChange={(value) => handleTextChange("textDecoration", value)}
            >
              <SelectTrigger className="bg-white border-gray-300">
                <SelectValue placeholder="选择文本装饰" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
                <SelectItem value="underline">下划线</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor" className="text-gray-700">
              文本颜色
            </Label>
            <div className="flex gap-2">
              <Input
                type="color"
                id="textColor"
                value={localSettings.text.color}
                onChange={(e) => handleTextChange("color", e.target.value)}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={localSettings.text.color}
                onChange={(e) => handleTextChange("color", e.target.value)}
                className="flex-1 bg-white border-gray-300"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          保存设置
        </Button>
      </div>
    </div>
  )
}

