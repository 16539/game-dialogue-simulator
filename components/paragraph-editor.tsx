"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { PlusCircle, MinusCircle, ChevronDown, Upload } from "lucide-react"
import type { Paragraph, Dialogue } from "@/contexts/dialogue-context"
import DialogueEditor from "@/components/dialogue-editor"
import { v4 as uuidv4 } from "uuid"

interface ParagraphEditorProps {
  paragraph: Paragraph
  onUpdate: (paragraph: Paragraph) => void
  isFirstParagraph: boolean
  playerName: string
}

export default function ParagraphEditor({ paragraph, onUpdate, isFirstParagraph, playerName }: ParagraphEditorProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const handleVideoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...paragraph,
      videoUrl: e.target.value,
    })
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setVideoFile(file)

      // Create object URL for the video file
      const objectUrl = URL.createObjectURL(file)
      onUpdate({
        ...paragraph,
        videoUrl: objectUrl,
      })
    }
  }

  const handleVideoMutedChange = (checked: boolean) => {
    onUpdate({
      ...paragraph,
      videoMuted: checked,
    })
  }

  const handleVideoLoopChange = (checked: boolean) => {
    onUpdate({
      ...paragraph,
      videoLoop: checked,
    })
  }

  const handleVideoTimeRangeChange = (field: "start" | "end", value: string) => {
    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) return

    onUpdate({
      ...paragraph,
      videoTimeRange: {
        ...(paragraph.videoTimeRange || { start: 0, end: 0 }),
        [field]: numValue,
      },
    })
  }

  const addDialogue = () => {
    const newDialogue: Dialogue = {
      id: uuidv4(),
      speaker: "NPC",
      content: "新对话内容",
    }

    onUpdate({
      ...paragraph,
      dialogues: [...paragraph.dialogues, newDialogue],
    })
  }

  const updateDialogue = (updatedDialogue: Dialogue) => {
    onUpdate({
      ...paragraph,
      dialogues: paragraph.dialogues.map((d) => (d.id === updatedDialogue.id ? updatedDialogue : d)),
    })
  }

  const deleteDialogue = (dialogueId: string) => {
    onUpdate({
      ...paragraph,
      dialogues: paragraph.dialogues.filter((d) => d.id !== dialogueId),
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-800">背景视频设置</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor={`videoUrl-${paragraph.id}`} className="text-gray-700">
              视频链接 {isFirstParagraph && <span className="text-red-500">*</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                id={`videoUrl-${paragraph.id}`}
                value={paragraph.videoUrl}
                onChange={handleVideoUrlChange}
                placeholder="输入视频URL或上传本地文件"
                className="bg-white border-gray-300 flex-1"
                required={isFirstParagraph}
              />
              <div className="relative">
                <Input
                  type="file"
                  accept="video/*"
                  id={`videoFile-${paragraph.id}`}
                  onChange={handleVideoFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button type="button" variant="outline" className="h-full border-gray-300">
                  <Upload size={16} className="mr-2" />
                  上传
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`videoStart-${paragraph.id}`} className="text-gray-700">
                  开始时间 (秒)
                </Label>
                <Input
                  id={`videoStart-${paragraph.id}`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={paragraph.videoTimeRange?.start || 0}
                  onChange={(e) => handleVideoTimeRangeChange("start", e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`videoEnd-${paragraph.id}`} className="text-gray-700">
                  结束时间 (秒)
                </Label>
                <Input
                  id={`videoEnd-${paragraph.id}`}
                  type="number"
                  min="0"
                  step="0.1"
                  value={paragraph.videoTimeRange?.end || 0}
                  onChange={(e) => handleVideoTimeRangeChange("end", e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`videoMuted-${paragraph.id}`}
                  checked={paragraph.videoMuted}
                  onCheckedChange={handleVideoMutedChange}
                />
                <Label htmlFor={`videoMuted-${paragraph.id}`} className="text-gray-700">
                  视频静音
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id={`videoLoop-${paragraph.id}`}
                  checked={paragraph.videoLoop}
                  onCheckedChange={handleVideoLoopChange}
                />
                <Label htmlFor={`videoLoop-${paragraph.id}`} className="text-gray-700">
                  循环播放
                </Label>
              </div>
            </div>
          </div>
        </div>

        {paragraph.videoUrl && (
          <div className="mt-4 bg-gray-50 rounded-lg p-2 border border-gray-200">
            <video src={paragraph.videoUrl} controls muted className="w-full h-auto max-h-[200px] object-contain" />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-lg font-medium text-gray-800">对话列表</h4>
          <Button
            onClick={addDialogue}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
          >
            <PlusCircle size={16} />
            添加对话
          </Button>
        </div>

        {paragraph.dialogues.length === 0 ? (
          <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500">暂无对话，请点击"添加对话"按钮创建</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paragraph.dialogues.map((dialogue, index) => (
              <div key={dialogue.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <Collapsible defaultOpen={index === 0}>
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger className="flex items-center gap-2">
                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 collapsible-closed:rotate-[-90deg] text-gray-600" />
                        <span className="font-medium text-gray-800">
                          对话 {index + 1}: {dialogue.speaker === "@player" ? playerName : dialogue.speaker}
                        </span>
                      </CollapsibleTrigger>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteDialogue(dialogue.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <MinusCircle size={16} />
                    </Button>
                  </div>

                  <CollapsibleContent>
                    <div className="p-4 bg-white">
                      <DialogueEditor dialogue={dialogue} onUpdate={updateDialogue} playerName={playerName} />
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

