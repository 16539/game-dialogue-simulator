"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Slider } from "@/components/ui/slider"
import { PlusCircle, MinusCircle, ChevronDown, RotateCw, Move, Palette, Zap } from "lucide-react"
import type { Animation, KeyFrame } from "@/contexts/dialogue-context"

interface AnimationEditorProps {
  animation: Animation
  onUpdate: (animation: Animation) => void
}

export default function AnimationEditor({ animation, onUpdate }: AnimationEditorProps) {
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (isNaN(value)) return

    onUpdate({
      ...animation,
      startTime: value,
    })
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(e.target.value)
    if (isNaN(value)) return

    onUpdate({
      ...animation,
      duration: value,
    })
  }

  const handleRepeatCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (isNaN(value)) return

    onUpdate({
      ...animation,
      repeatCount: value,
    })
  }

  const addKeyframe = () => {
    // Find the highest percentage
    const maxPercentage = Math.max(...animation.keyframes.map((kf) => kf.percentage))
    const newPercentage = maxPercentage < 100 ? maxPercentage + 25 : 100

    // Copy properties from the last keyframe
    const lastKeyframe = animation.keyframes[animation.keyframes.length - 1]
    const newKeyframe: KeyFrame = {
      percentage: Math.min(newPercentage, 100),
      scale: lastKeyframe.scale,
      rotation: lastKeyframe.rotation,
      rotationType: lastKeyframe.rotationType,
      position: lastKeyframe.position,
      movementType: lastKeyframe.movementType,
      screenColor: lastKeyframe.screenColor,
      cameraShake: lastKeyframe.cameraShake,
      vibration: lastKeyframe.vibration,
    }

    onUpdate({
      ...animation,
      keyframes: [...animation.keyframes, newKeyframe].sort((a, b) => a.percentage - b.percentage),
    })
  }

  const updateKeyframe = (index: number, updatedKeyframe: KeyFrame) => {
    const newKeyframes = [...animation.keyframes]
    newKeyframes[index] = updatedKeyframe

    onUpdate({
      ...animation,
      keyframes: newKeyframes.sort((a, b) => a.percentage - b.percentage),
    })
  }

  const deleteKeyframe = (index: number) => {
    // Don't allow deleting if there are only 2 keyframes
    if (animation.keyframes.length <= 2) return

    const newKeyframes = animation.keyframes.filter((_, i) => i !== index)

    onUpdate({
      ...animation,
      keyframes: newKeyframes,
    })
  }

  return (
    <div className="space-y-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="animationStartTime" className="text-gray-700">
            动画启动时间 (秒)
          </Label>
          <Input
            id="animationStartTime"
            type="number"
            min="0"
            step="0.1"
            value={animation.startTime}
            onChange={handleStartTimeChange}
            className="bg-white border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="animationDuration" className="text-gray-700">
            动画持续时间 (秒)
          </Label>
          <Input
            id="animationDuration"
            type="number"
            min="0.1"
            step="0.1"
            value={animation.duration}
            onChange={handleDurationChange}
            className="bg-white border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="animationRepeatCount" className="text-gray-700">
            动画播放次数
          </Label>
          <Input
            id="animationRepeatCount"
            type="number"
            min="1"
            step="1"
            value={animation.repeatCount}
            onChange={handleRepeatCountChange}
            className="bg-white border-gray-300"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-gray-800">关键帧</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={addKeyframe}
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
          >
            <PlusCircle size={14} />
            添加关键帧
          </Button>
        </div>

        <div className="relative w-full h-8 bg-white rounded-md mb-6 border border-gray-300">
          {animation.keyframes.map((keyframe, index) => (
            <div
              key={index}
              className="absolute top-0 w-1 h-8 bg-primary cursor-pointer"
              style={{ left: `${keyframe.percentage}%` }}
              title={`${keyframe.percentage}%`}
            />
          ))}
        </div>

        <div className="space-y-3">
          {animation.keyframes.map((keyframe, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <Collapsible>
                <div className="flex items-center justify-between p-3 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 collapsible-closed:rotate-[-90deg] text-gray-600" />
                      <span className="font-medium text-gray-800">关键帧 {keyframe.percentage}%</span>
                    </CollapsibleTrigger>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={keyframe.percentage}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        if (isNaN(value)) return

                        updateKeyframe(index, {
                          ...keyframe,
                          percentage: Math.min(Math.max(value, 0), 100),
                        })
                      }}
                      className="w-20 h-8 bg-white border-gray-300"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKeyframe(index)}
                      disabled={animation.keyframes.length <= 2}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <MinusCircle size={14} />
                    </Button>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="p-4 bg-white space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* 缩放 */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <RotateCw size={16} className="text-gray-600" />
                          <Label className="text-gray-700">缩放 (%)</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[keyframe.scale || 100]}
                            min={10}
                            max={200}
                            step={1}
                            onValueChange={(value) => {
                              updateKeyframe(index, {
                                ...keyframe,
                                scale: value[0],
                              })
                            }}
                          />
                          <Input
                            type="number"
                            min="10"
                            max="200"
                            value={keyframe.scale || 100}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (isNaN(value)) return

                              updateKeyframe(index, {
                                ...keyframe,
                                scale: Math.min(Math.max(value, 10), 200),
                              })
                            }}
                            className="w-20 bg-white border-gray-300"
                          />
                        </div>
                      </div>

                      {/* 旋转 */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <RotateCw size={16} className="text-gray-600" />
                          <Label className="text-gray-700">旋转角度 (度)</Label>
                        </div>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[keyframe.rotation || 0]}
                            min={-180}
                            max={180}
                            step={1}
                            onValueChange={(value) => {
                              updateKeyframe(index, {
                                ...keyframe,
                                rotation: value[0],
                              })
                            }}
                          />
                          <Input
                            type="number"
                            min="-180"
                            max="180"
                            value={keyframe.rotation || 0}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (isNaN(value)) return

                              updateKeyframe(index, {
                                ...keyframe,
                                rotation: Math.min(Math.max(value, -180), 180),
                              })
                            }}
                            className="w-20 bg-white border-gray-300"
                          />
                        </div>

                        <div className="mt-2">
                          <Label className="mb-2 block text-gray-700">旋转方式</Label>
                          <Select
                            value={keyframe.rotationType || "uniform"}
                            onValueChange={(value) => {
                              updateKeyframe(index, {
                                ...keyframe,
                                rotationType: value as any,
                              })
                            }}
                          >
                            <SelectTrigger className="bg-white border-gray-300">
                              <SelectValue placeholder="选择旋转方式" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="uniform">匀速</SelectItem>
                              <SelectItem value="backAndForth">往返</SelectItem>
                              <SelectItem value="accelerate">加速</SelectItem>
                              <SelectItem value="decelerate">减速</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* 移动 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Move size={16} className="text-gray-600" />
                        <Label className="text-gray-700">移动到坐标</Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-700">X 坐标 (-100 到 100)</Label>
                          <Input
                            type="number"
                            min="-100"
                            max="100"
                            step="0.01"
                            value={keyframe.position?.x || 0}
                            onChange={(e) => {
                              const value = Number.parseFloat(e.target.value)
                              if (isNaN(value)) return

                              updateKeyframe(index, {
                                ...keyframe,
                                position: {
                                  ...(keyframe.position || { x: 0, y: 0 }),
                                  x: Math.min(Math.max(value, -100), 100),
                                },
                              })
                            }}
                            className="bg-white border-gray-300"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-gray-700">Y 坐标 (-100 到 100)</Label>
                          <Input
                            type="number"
                            min="-100"
                            max="100"
                            step="0.01"
                            value={keyframe.position?.y || 0}
                            onChange={(e) => {
                              const value = Number.parseFloat(e.target.value)
                              if (isNaN(value)) return

                              updateKeyframe(index, {
                                ...keyframe,
                                position: {
                                  ...(keyframe.position || { x: 0, y: 0 }),
                                  y: Math.min(Math.max(value, -100), 100),
                                },
                              })
                            }}
                            className="bg-white border-gray-300"
                          />
                        </div>
                      </div>

                      <div className="mt-2">
                        <Label className="mb-2 block text-gray-700">移动方式</Label>
                        <Select
                          value={keyframe.movementType || "uniform"}
                          onValueChange={(value) => {
                            updateKeyframe(index, {
                              ...keyframe,
                              movementType: value as any,
                            })
                          }}
                        >
                          <SelectTrigger className="bg-white border-gray-300">
                            <SelectValue placeholder="选择移动方式" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uniform">匀速</SelectItem>
                            <SelectItem value="backAndForth">往返</SelectItem>
                            <SelectItem value="accelerate">加速</SelectItem>
                            <SelectItem value="decelerate">减速</SelectItem>
                            <SelectItem value="elastic">弹性</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 屏幕颜色 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Palette size={16} className="text-gray-600" />
                        <Label className="text-gray-700">屏幕颜色</Label>
                      </div>

                      <div className="flex items-center gap-4">
                        <Input
                          type="color"
                          value={keyframe.screenColor || "#ffffff"}
                          onChange={(e) => {
                            updateKeyframe(index, {
                              ...keyframe,
                              screenColor: e.target.value,
                            })
                          }}
                          className="w-16 h-10 p-1 bg-white border-gray-300"
                        />
                        <Input
                          type="text"
                          value={keyframe.screenColor || "#ffffff"}
                          onChange={(e) => {
                            updateKeyframe(index, {
                              ...keyframe,
                              screenColor: e.target.value,
                            })
                          }}
                          className="bg-white border-gray-300"
                        />
                      </div>
                    </div>

                    {/* 特效开关 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap size={16} className="text-gray-600" />
                          <Label className="text-gray-700">镜头摇晃</Label>
                        </div>

                        <div className="flex items-center gap-4">
                          <Button
                            variant={keyframe.cameraShake ? "default" : "outline"}
                            onClick={() => {
                              updateKeyframe(index, {
                                ...keyframe,
                                cameraShake: true,
                              })
                            }}
                            className={`flex-1 ${keyframe.cameraShake ? "bg-primary hover:bg-primary/90" : "border-gray-300"}`}
                          >
                            开启
                          </Button>
                          <Button
                            variant={keyframe.cameraShake === false ? "default" : "outline"}
                            onClick={() => {
                              updateKeyframe(index, {
                                ...keyframe,
                                cameraShake: false,
                              })
                            }}
                            className={`flex-1 ${keyframe.cameraShake === false ? "bg-primary hover:bg-primary/90" : "border-gray-300"}`}
                          >
                            关闭
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap size={16} className="text-gray-600" />
                          <Label className="text-gray-700">震动</Label>
                        </div>

                        <div className="flex items-center gap-4">
                          <Button
                            variant={keyframe.vibration ? "default" : "outline"}
                            onClick={() => {
                              updateKeyframe(index, {
                                ...keyframe,
                                vibration: true,
                              })
                            }}
                            className={`flex-1 ${keyframe.vibration ? "bg-primary hover:bg-primary/90" : "border-gray-300"}`}
                          >
                            开启
                          </Button>
                          <Button
                            variant={keyframe.vibration === false ? "default" : "outline"}
                            onClick={() => {
                              updateKeyframe(index, {
                                ...keyframe,
                                vibration: false,
                              })
                            }}
                            className={`flex-1 ${keyframe.vibration === false ? "bg-primary hover:bg-primary/90" : "border-gray-300"}`}
                          >
                            关闭
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

