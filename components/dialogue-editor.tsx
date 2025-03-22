"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Play, MinusCircle } from "lucide-react"
import type { Dialogue, Animation } from "@/contexts/dialogue-context"
import AnimationEditor from "@/components/animation-editor"

interface DialogueEditorProps {
  dialogue: Dialogue
  onUpdate: (dialogue: Dialogue) => void
  playerName: string
}

export default function DialogueEditor({ dialogue, onUpdate, playerName }: DialogueEditorProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const handleSpeakerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...dialogue,
      speaker: e.target.value,
    })
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      ...dialogue,
      content: e.target.value,
    })
  }

  const handleVoiceUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      ...dialogue,
      voiceUrl: e.target.value,
    })
  }

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAudioFile(file)

      // Create object URL for the audio file
      const objectUrl = URL.createObjectURL(file)
      onUpdate({
        ...dialogue,
        voiceUrl: objectUrl,
      })
    }
  }

  const handleAnimationUpdate = (animation: Animation) => {
    onUpdate({
      ...dialogue,
      animation,
    })
  }

  const removeAnimation = () => {
    onUpdate({
      ...dialogue,
      animation: undefined,
    })
  }

  const createDefaultAnimation = () => {
    const defaultAnimation: Animation = {
      startTime: 0,
      duration: 2,
      repeatCount: 1,
      keyframes: [
        { percentage: 0, scale: 100 },
        { percentage: 100, scale: 100 },
      ],
    }

    onUpdate({
      ...dialogue,
      animation: defaultAnimation,
    })
  }

  // Preview content with player name replaced
  const previewContent = dialogue.content.replace(/@player/g, playerName)
  const displaySpeaker = dialogue.speaker === "@player" ? playerName : dialogue.speaker

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`speaker-${dialogue.id}`} className="text-gray-700">
              说话人
            </Label>
            <Input
              id={`speaker-${dialogue.id}`}
              value={dialogue.speaker}
              onChange={handleSpeakerChange}
              placeholder="输入说话人名称，使用@player表示玩家"
              className="bg-white border-gray-300"
            />
            {dialogue.speaker && <p className="text-sm text-gray-500">显示为: {displaySpeaker}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`content-${dialogue.id}`} className="text-gray-700">
              对话内容
            </Label>
            <Textarea
              id={`content-${dialogue.id}`}
              value={dialogue.content}
              onChange={handleContentChange}
              placeholder="输入对话内容，使用@player表示玩家名字"
              className="bg-white border-gray-300 min-h-[120px] resize-y"
            />
            {dialogue.content && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700">预览:</p>
                <p className="mt-1 text-gray-800">{previewContent}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`voiceUrl-${dialogue.id}`} className="text-gray-700">
              配音链接
            </Label>
            <div className="flex gap-2">
              <Input
                id={`voiceUrl-${dialogue.id}`}
                value={dialogue.voiceUrl || ""}
                onChange={handleVoiceUrlChange}
                placeholder="输入音频URL或上传本地文件"
                className="bg-white border-gray-300 flex-1"
              />
              <div className="relative">
                <Input
                  type="file"
                  accept="audio/*"
                  id={`audioFile-${dialogue.id}`}
                  onChange={handleAudioFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Button type="button" variant="outline" className="h-full border-gray-300">
                  <Upload size={16} className="mr-2" />
                  上传
                </Button>
              </div>
            </div>
          </div>

          {dialogue.voiceUrl && (
            <div className="mt-2">
              <audio controls src={dialogue.voiceUrl} className="w-full" />
            </div>
          )}

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <Label className="text-gray-700">背景视频动画效果</Label>
              {!dialogue.animation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={createDefaultAnimation}
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
                >
                  <Play size={14} />
                  添加动画
                </Button>
              )}
            </div>

            {dialogue.animation ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-700">动画效果设置</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeAnimation}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 flex items-center gap-1 border-red-200"
                  >
                    <MinusCircle size={14} />
                    删除动画
                  </Button>
                </div>
                <AnimationEditor animation={dialogue.animation} onUpdate={handleAnimationUpdate} />
              </div>
            ) : (
              <div className="p-4 text-center bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">暂无动画效果</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

