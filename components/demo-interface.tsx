"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, SkipBack, Eye, PlayCircle, Maximize, Minimize } from "lucide-react"
import { useDialogue } from "@/contexts/dialogue-context"
import DialogueBox from "@/components/dialogue-box"
import DialogueSettingsPanel from "@/components/dialogue-settings-panel"

interface DemoInterfaceProps {
  onExit: () => void
}

export default function DemoInterface({ onExit }: DemoInterfaceProps) {
  const { currentScript, settings } = useDialogue()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0)
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const [isDialogueHidden, setIsDialogueHidden] = useState(false)
  const [isAutoPlay, setIsAutoPlay] = useState(false)
  const [isVideoFitWidth, setIsVideoFitWidth] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // 1. 首先，添加一个状态来跟踪各种媒体是否已完成
  const [mediaStatus, setMediaStatus] = useState({
    typing: false, // 打字机效果是否完成
    audio: true, // 音频是否播放完成（默认为true，如果没有音频）
    animation: true, // 动画是否播放完成（默认为true，如果没有动画）
  })

  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentParagraph = currentScript.paragraphs[currentParagraphIndex]
  const currentDialogue = currentParagraph?.dialogues[currentDialogueIndex]

  // Initialize Web Worker for animations
  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    // Initialize Web Worker
    if (typeof window !== "undefined") {
      const workerCode = `
        self.onmessage = function(e) {
          const { type, data } = e.data;
          
          if (type === 'calculateAnimation') {
            const { animation, elapsedTime } = data;
            
            // Calculate current animation state
            const { keyframes, duration } = animation;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // Find the two keyframes to interpolate between
            let startFrame = keyframes[0];
            let endFrame = keyframes[keyframes.length - 1];
            
            for (let i = 0; i < keyframes.length - 1; i++) {
              if (progress >= keyframes[i].percentage / 100 && progress <= keyframes[i + 1].percentage / 100) {
                startFrame = keyframes[i];
                endFrame = keyframes[i + 1];
                break;
              }
            }
            
            // Calculate segment progress
            const segmentStart = startFrame.percentage / 100;
            const segmentEnd = endFrame.percentage / 100;
            const segmentProgress = (progress - segmentStart) / (segmentEnd - segmentStart);
            
            // Interpolate values
            const result = {
              scale: interpolate(startFrame.scale, endFrame.scale, segmentProgress, startFrame.rotationType || 'uniform'),
              rotation: interpolate(startFrame.rotation, endFrame.rotation, segmentProgress, startFrame.rotationType || 'uniform'),
              position: {
                x: interpolate(startFrame.position?.x, endFrame.position?.x, segmentProgress, startFrame.movementType || 'uniform'),
                y: interpolate(startFrame.position?.y, endFrame.position?.y, segmentProgress, startFrame.movementType || 'uniform'),
              },
              screenColor: interpolateColor(startFrame.screenColor, endFrame.screenColor, segmentProgress),
              cameraShake: endFrame.cameraShake,
              vibration: endFrame.vibration,
            };
            
            self.postMessage({ type: 'animationResult', data: result });
          }
        };
        
        function interpolate(start, end, progress, type) {
          if (start === undefined || end === undefined) return undefined;
          
          switch (type) {
            case 'backAndForth':
              // Sine wave interpolation
              return start + (end - start) * Math.sin(progress * Math.PI);
            case 'accelerate':
              // Quadratic ease-in
              return start + (end - start) * (progress * progress);
            case 'decelerate':
              // Quadratic ease-out
              return start + (end - start) * (1 - (1 - progress) * (1 - progress));
            case 'elastic':
              // Elastic effect
              const p = progress * 2 - 1;
              if (p < 0) {
                return start + (end - start) * (0.5 * Math.sin(13 * Math.PI/2 * p) * Math.pow(2, 10 * p));
              } else {
                return start + (end - start) * (0.5 * (Math.sin(-13 * Math.PI/2 * p) * Math.pow(2, -10 * p) + 2));
              }
            case 'uniform':
            default:
              // Linear interpolation
              return start + (end - start) * progress;
          }
        }
        
        function interpolateColor(startColor, endColor, progress) {
          if (!startColor || !endColor) return undefined;
          
          // Parse colors
          const start = parseColor(startColor);
          const end = parseColor(endColor);
          
          if (!start || !end) return undefined;
          
          // Interpolate RGB values
          const r = Math.round(start.r + (end.r - start.r) * progress);
          const g = Math.round(start.g + (end.g - start.g) * progress);
          const b = Math.round(start.b + (end.b - start.b) * progress);
          
          // Convert back to hex
          return rgbToHex(r, g, b);
        }
        
        function parseColor(color) {
          if (!color) return null;
          
          // Handle hex format
          if (color.startsWith('#')) {
            const hex = color.substring(1);
            if (hex.length === 3) {
              return {
                r: parseInt(hex[0] + hex[0], 16),
                g: parseInt(hex[1] + hex[1], 16),
                b: parseInt(hex[2] + hex[2], 16)
              };
            } else if (hex.length === 6) {
              return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
              };
            }
          }
          
          return null;
        }
        
        function rgbToHex(r, g, b) {
          return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
      `

      const blob = new Blob([workerCode], { type: "application/javascript" })
      workerRef.current = new Worker(URL.createObjectURL(blob))

      workerRef.current.onmessage = (e) => {
        const { type, data } = e.data

        if (type === "animationResult") {
          applyAnimationResult(data)
        }
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  // Apply animation result to video element
  const applyAnimationResult = (result: any) => {
    if (!videoRef.current) return

    const video = videoRef.current

    // Apply scale
    if (result.scale !== undefined) {
      video.style.transform = `scale(${result.scale / 100})`
    }

    // Apply rotation
    if (result.rotation !== undefined) {
      video.style.transform += ` rotate(${result.rotation}deg)`
    }

    // Apply position
    if (result.position && result.position.x !== undefined && result.position.y !== undefined) {
      video.style.transform += ` translate(${result.position.x}%, ${result.position.y}%)`
    }

    // Apply screen color overlay
    if (result.screenColor) {
      const overlay = document.getElementById("screen-overlay")
      if (overlay) {
        overlay.style.backgroundColor = result.screenColor
        overlay.style.opacity = "0.3"
      }
    } else {
      const overlay = document.getElementById("screen-overlay")
      if (overlay) {
        overlay.style.opacity = "0"
      }
    }

    // Apply camera shake
    if (result.cameraShake) {
      video.style.animation = "shake 0.1s infinite"
    } else {
      video.style.animation = ""
    }

    // Apply vibration
    if (result.vibration) {
      if ("vibrate" in navigator) {
        navigator.vibrate(100)
      }
    }
  }

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  // Initialize video and dialogue
  useEffect(() => {
    if (currentScript.paragraphs.length === 0) return

    loadParagraph(0)
    loadDialogue(0)
  }, [currentScript])

  // Load paragraph
  const loadParagraph = (index: number) => {
    if (index < 0 || index >= currentScript.paragraphs.length) return

    const paragraph = currentScript.paragraphs[index]

    // Stop any ongoing animations
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Reset video styles
    if (videoRef.current) {
      videoRef.current.style.transform = ""
      videoRef.current.style.animation = ""
    }

    // Reset screen overlay
    const overlay = document.getElementById("screen-overlay")
    if (overlay) {
      overlay.style.opacity = "0"
    }

    // Load video
    if (videoRef.current && paragraph.videoUrl) {
      videoRef.current.src = paragraph.videoUrl
      videoRef.current.muted = paragraph.videoMuted
      videoRef.current.loop = paragraph.videoLoop

      // Set time range if specified
      if (paragraph.videoTimeRange) {
        videoRef.current.currentTime = paragraph.videoTimeRange.start
      }

      videoRef.current.play().catch((error) => {
        console.error("Video playback failed:", error)
      })
    }

    setCurrentParagraphIndex(index)
    setCurrentDialogueIndex(0)
  }

  // Load dialogue
  const loadDialogue = (index: number) => {
    if (!currentParagraph || index < 0 || index >= currentParagraph.dialogues.length) return

    // Stop any previous audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Stop any ongoing animations
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Reset video styles
    if (videoRef.current) {
      videoRef.current.style.transform = ""
      videoRef.current.style.animation = ""
    }

    // Reset screen overlay
    const overlay = document.getElementById("screen-overlay")
    if (overlay) {
      overlay.style.opacity = "0"
    }

    // Clear any auto-play timeout
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
      autoPlayTimeoutRef.current = null
    }

    const dialogue = currentParagraph.dialogues[index]

    // 重置媒体状态
    setMediaStatus({
      typing: false,
      audio: !dialogue.voiceUrl, // 如果没有音频，则标记为已完成
      animation: !dialogue.animation, // 如果没有动画，则标记为已完成
    })

    // Start typewriter effect
    setIsTyping(true)
    setDisplayedText("")

    // Play audio if available
    if (dialogue.voiceUrl && audioRef.current) {
      audioRef.current.src = dialogue.voiceUrl
      audioRef.current.onended = () => {
        setMediaStatus((prev) => ({ ...prev, audio: true }))
        checkAutoPlay()
      }
      audioRef.current.play().catch((error) => {
        console.error("Audio playback failed:", error)
        setMediaStatus((prev) => ({ ...prev, audio: true })) // 出错时也标记为完成
      })
    }

    // Start animation if available
    if (dialogue.animation) {
      startAnimation(dialogue.animation)
    }

    setCurrentDialogueIndex(index)
  }

  // Typewriter effect
  useEffect(() => {
    if (!currentDialogue || !isTyping) return

    let content = currentDialogue.content
    content = content.replace(/@player/g, currentScript.playerName)

    let index = 0
    const speed = 50 // ms per character

    const typeWriter = () => {
      if (index < content.length) {
        setDisplayedText(content.substring(0, index + 1))
        index++
        setTimeout(typeWriter, speed)
      } else {
        setIsTyping(false)
        setMediaStatus((prev) => ({ ...prev, typing: true }))
        checkAutoPlay()
      }
    }

    typeWriter()

    return () => {
      // Clean up any ongoing typewriter effect
      setIsTyping(false)
    }
  }, [currentDialogue, isTyping, currentScript.playerName, isAutoPlay])

  // Start animation
  const startAnimation = (animation: any) => {
    if (!animation || !videoRef.current) return

    const startTime = performance.now()
    const duration = animation.duration * 1000 // Convert to milliseconds

    const animate = (currentTime: number) => {
      const elapsedTime = (currentTime - startTime) / 1000 // Convert to seconds

      if (elapsedTime < animation.duration * animation.repeatCount) {
        // Calculate current animation cycle
        const cycleTime = elapsedTime % animation.duration

        // Use Web Worker to calculate animation state
        if (workerRef.current) {
          workerRef.current.postMessage({
            type: "calculateAnimation",
            data: {
              animation,
              elapsedTime: cycleTime,
            },
          })
        }

        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Animation complete
        animationRef.current = null
        setMediaStatus((prev) => ({ ...prev, animation: true }))
        checkAutoPlay()
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  // Handle dialogue box click
  const handleDialogueClick = () => {
    // If typing, complete the text immediately
    if (isTyping) {
      setIsTyping(false)
      if (currentDialogue) {
        let content = currentDialogue.content
        content = content.replace(/@player/g, currentScript.playerName)
        setDisplayedText(content)
      }
      return
    }

    // Clear any auto-play timeout
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current)
      autoPlayTimeoutRef.current = null
    }

    // Move to next dialogue
    const nextDialogueIndex = currentDialogueIndex + 1

    if (nextDialogueIndex < currentParagraph.dialogues.length) {
      loadDialogue(nextDialogueIndex)
    } else {
      // Move to next paragraph
      const nextParagraphIndex = currentParagraphIndex + 1

      if (nextParagraphIndex < currentScript.paragraphs.length) {
        loadParagraph(nextParagraphIndex)
        loadDialogue(0)
      } else {
        // End of script
        console.log("End of script reached")
      }
    }
  }

  // Handle back button
  const handleBackClick = () => {
    // Go to previous dialogue
    if (currentDialogueIndex > 0) {
      loadDialogue(currentDialogueIndex - 1)
    } else if (currentParagraphIndex > 0) {
      // Go to previous paragraph, last dialogue
      const prevParagraph = currentScript.paragraphs[currentParagraphIndex - 1]
      loadParagraph(currentParagraphIndex - 1)
      loadDialogue(prevParagraph.dialogues.length - 1)
    }
  }

  // Handle video time update
  useEffect(() => {
    if (!videoRef.current || !currentParagraph || !currentParagraph.videoTimeRange) return

    const handleTimeUpdate = () => {
      if (!videoRef.current || !currentParagraph.videoTimeRange) return

      if (videoRef.current.currentTime >= currentParagraph.videoTimeRange.end) {
        if (currentParagraph.videoLoop) {
          videoRef.current.currentTime = currentParagraph.videoTimeRange.start
        } else {
          videoRef.current.pause()
        }
      }
    }

    videoRef.current.addEventListener("timeupdate", handleTimeUpdate)

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("timeupdate", handleTimeUpdate)
      }
    }
  }, [currentParagraph])

  // Handle video error
  useEffect(() => {
    if (!videoRef.current) return

    const handleError = () => {
      console.error("Video error occurred")

      // Set black background as fallback
      if (videoRef.current) {
        videoRef.current.style.display = "none"
        if (containerRef.current) {
          containerRef.current.style.backgroundColor = "#000"
        }
      }
    }

    videoRef.current.addEventListener("error", handleError)

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("error", handleError)
      }
    }
  }, [])

  // Handle network resource timeout
  useEffect(() => {
    if (!videoRef.current || !currentParagraph || !currentParagraph.videoUrl) return

    let timeoutId: NodeJS.Timeout | null = null

    const handleLoadStart = () => {
      // Set 10-second timeout for loading
      timeoutId = setTimeout(() => {
        console.error("Video loading timeout")

        // Set black background as fallback
        if (videoRef.current) {
          videoRef.current.style.display = "none"
          if (containerRef.current) {
            containerRef.current.style.backgroundColor = "#000"
          }
        }
      }, 10000)
    }

    const handleLoadedData = () => {
      // Clear timeout when video loads successfully
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }

    videoRef.current.addEventListener("loadstart", handleLoadStart)
    videoRef.current.addEventListener("loadeddata", handleLoadedData)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (videoRef.current) {
        videoRef.current.removeEventListener("loadstart", handleLoadStart)
        videoRef.current.removeEventListener("loadeddata", handleLoadedData)
      }
    }
  }, [currentParagraph])

  // 5. 添加检查自动播放的函数
  const checkAutoPlay = () => {
    if (isAutoPlay && mediaStatus.typing && mediaStatus.audio && mediaStatus.animation) {
      // 所有媒体都已播放完成，等待0.5秒后自动进入下一个对话
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current)
      }

      autoPlayTimeoutRef.current = setTimeout(() => {
        handleDialogueClick()
      }, 500) // 固定等待0.5秒
    }
  }

  // 6. 在媒体状态或自动播放状态变化时检查自动播放
  useEffect(() => {
    checkAutoPlay()
  }, [mediaStatus, isAutoPlay])

  // 7. 在组件卸载时清理
  useEffect(() => {
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-white" : "h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-md"}`}
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        className={`absolute inset-0 ${isVideoFitWidth ? "w-full h-auto" : "h-full w-auto"} object-center z-0`}
        muted
        playsInline
      />

      {/* Screen Overlay for Color Effects */}
      <div id="screen-overlay" className="absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity" />

      {/* Audio Element */}
      <audio ref={audioRef} className="hidden" />

      {/* Control Buttons */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onExit}
          className="bg-white/80 hover:bg-white/90 border-gray-300 text-gray-700 shadow-sm"
        >
          <ArrowLeft size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleBackClick}
          className="bg-white/80 hover:bg-white/90 border-gray-300 text-gray-700 shadow-sm"
        >
          <SkipBack size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDialogueHidden(!isDialogueHidden)}
          className="bg-white/80 hover:bg-white/90 border-gray-300 text-gray-700 shadow-sm"
        >
          <Eye size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`${isAutoPlay ? "bg-primary text-white" : "bg-white/80 hover:bg-white/90 text-gray-700"} border-gray-300 shadow-sm`}
        >
          <PlayCircle size={20} />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsVideoFitWidth(!isVideoFitWidth)}
          className="bg-white/80 hover:bg-white/90 border-gray-300 text-gray-700 shadow-sm"
        >
          {isVideoFitWidth ? <Maximize size={20} /> : <Minimize size={20} />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={toggleFullscreen}
          className="bg-white/80 hover:bg-white/90 border-gray-300 text-gray-700 shadow-sm"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </Button>
      </div>

      {/* Dialogue Box */}
      {!isDialogueHidden && currentDialogue && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
          <DialogueBox
            speaker={currentDialogue.speaker === "@player" ? currentScript.playerName : currentDialogue.speaker}
            content={displayedText}
            settings={settings}
            onClick={handleDialogueClick}
            onSettingsClick={() => setIsSettingsOpen(true)}
          />
        </div>
      )}

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-800">对话框设置</DialogTitle>
          </DialogHeader>
          <DialogueSettingsPanel />
        </DialogContent>
      </Dialog>
    </div>
  )
}

