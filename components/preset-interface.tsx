"use client"

import { Textarea } from "@/components/ui/textarea"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Download, Upload, FolderOpen, Plus, FileText, Link } from "lucide-react"
import { useDialogue } from "@/contexts/dialogue-context"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"

export default function PresetInterface() {
  const {
    presets,
    presetGroups,
    loadPreset,
    deletePreset,
    createPresetGroup,
    loadPresetGroup,
    deletePresetGroup,
    exportPreset,
    exportPresetGroup,
    importFromJson,
  } = useDialogue()

  const [activeTab, setActiveTab] = useState("presets")
  const [importText, setImportText] = useState("")
  const [importUrl, setImportUrl] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [selectedPresets, setSelectedPresets] = useState<string[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const handleImportFromText = () => {
    if (!importText.trim()) return

    try {
      importFromJson(importText)
      setImportText("")
      setIsImporting(false)
    } catch (error) {
      console.error("导入失败:", error)
      alert(`导入失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) return

    try {
      const response = await fetch(importUrl)
      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status} ${response.statusText}`)
      }

      const jsonText = await response.text()
      importFromJson(jsonText)
      setImportUrl("")
      setIsImporting(false)
    } catch (error) {
      console.error("从URL导入失败:", error)
      alert(`从URL导入失败: ${error instanceof Error ? error.message : "未知错误"}`)
    }
  }

  const handleImportFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        try {
          importFromJson(event.target.result)
          setIsImporting(false)
        } catch (error) {
          console.error("从文件导入失败:", error)
          alert(`从文件导入失败: ${error instanceof Error ? error.message : "未知错误"}`)
        }
      }
    }

    reader.readAsText(file)
  }

  // 修改创建预设组的处理函数，适应新的数据结构
  const handleCreateGroup = () => {
    if (!newGroupName.trim() || selectedPresets.length === 0) return

    createPresetGroup(newGroupName, selectedPresets)
    setNewGroupName("")
    setSelectedPresets([])
    setIsCreatingGroup(false)
  }

  const handleExportPreset = (id: string, name: string) => {
    const jsonData = exportPreset(id)
    if (!jsonData) return

    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.replace(/\s+/g, "_")}_preset.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportPresetGroup = (id: string, name: string) => {
    const jsonData = exportPresetGroup(id)
    if (!jsonData) return

    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${name.replace(/\s+/g, "_")}_group.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopyPresetToClipboard = (id: string) => {
    const jsonData = exportPreset(id)
    if (!jsonData) return

    navigator.clipboard
      .writeText(jsonData)
      .then(() => alert("预设已复制到剪贴板"))
      .catch((err) => alert(`复制失败: ${err}`))
  }

  const handleCopyGroupToClipboard = (id: string) => {
    const jsonData = exportPresetGroup(id)
    if (!jsonData) return

    navigator.clipboard
      .writeText(jsonData)
      .then(() => alert("预设组已复制到剪贴板"))
      .catch((err) => alert(`复制失败: ${err}`))
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">预设界面</h2>

      <Tabs defaultValue="presets" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="presets">预设</TabsTrigger>
          <TabsTrigger value="groups">预设组</TabsTrigger>
          <TabsTrigger value="import">导入</TabsTrigger>
        </TabsList>

        <TabsContent value="presets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">预设列表</h3>
            <Dialog open={isCreatingGroup} onOpenChange={setIsCreatingGroup}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10"
                >
                  <Plus size={16} />
                  创建预设组
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-white">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">创建预设组</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName" className="text-gray-700">
                      预设组名称
                    </Label>
                    <Input
                      id="groupName"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="输入预设组名称"
                      className="bg-white border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700">选择预设</Label>
                    <ScrollArea className="h-[200px] border border-gray-300 rounded-md p-2 bg-white">
                      {presets.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">暂无预设</p>
                      ) : (
                        <div className="space-y-2">
                          {presets.map((preset) => (
                            <div key={preset.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`preset-${preset.id}`}
                                checked={selectedPresets.includes(preset.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedPresets([...selectedPresets, preset.id])
                                  } else {
                                    setSelectedPresets(selectedPresets.filter((id) => id !== preset.id))
                                  }
                                }}
                              />
                              <Label htmlFor={`preset-${preset.id}`} className="cursor-pointer text-gray-700">
                                {preset.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingGroup(false)}
                    className="border-gray-300 text-gray-700"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || selectedPresets.length === 0}
                    className="bg-primary hover:bg-primary/90"
                  >
                    创建
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {presets.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">暂无预设，请在设置界面创建并保存</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map((preset) => (
                <Card key={preset.id} className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-800">{preset.name}</CardTitle>
                    <CardDescription className="text-gray-500">
                      {formatDistanceToNow(new Date(preset.updatedAt), { addSuffix: true, locale: zhCN })}更新
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {preset.paragraphs.length} 个段落，
                      {preset.paragraphs.reduce((total, p) => total + p.dialogues.length, 0)} 个对话
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPreset(preset.id)}
                        className="border-gray-300 text-gray-700"
                      >
                        <FolderOpen size={16} className="mr-1" />
                        加载
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePreset(preset.id)}
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} className="mr-1" />
                        删除
                      </Button>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          <Download size={16} className="mr-1" />
                          导出
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px] bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-gray-800">导出预设</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700"
                            onClick={() => handleExportPreset(preset.id, preset.name)}
                          >
                            <Download size={16} className="mr-2" />
                            导出为文件
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700"
                            onClick={() => handleCopyPresetToClipboard(preset.id)}
                          >
                            <FileText size={16} className="mr-2" />
                            复制为JSON文本
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">预设组列表</h3>

          {presetGroups.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">暂无预设组，请点击"创建预设组"按钮创建</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {presetGroups.map((group) => (
                <Card key={group.id} className="bg-white border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-800">{group.name}</CardTitle>
                    <CardDescription className="text-gray-500">
                      {formatDistanceToNow(new Date(group.createdAt), { addSuffix: true, locale: zhCN })}创建
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">包含 {group.presets.length} 个预设</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPresetGroup(group.id)}
                        className="border-gray-300 text-gray-700"
                      >
                        <FolderOpen size={16} className="mr-1" />
                        加载
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePresetGroup(group.id)}
                        className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={16} className="mr-1" />
                        删除
                      </Button>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-gray-300 text-gray-700">
                          <Download size={16} className="mr-1" />
                          导出
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[400px] bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-gray-800">导出预设组</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700"
                            onClick={() => handleExportPresetGroup(group.id, group.name)}
                          >
                            <Download size={16} className="mr-2" />
                            导出为文件
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700"
                            onClick={() => handleCopyGroupToClipboard(group.id)}
                          >
                            <FileText size={16} className="mr-2" />
                            复制为JSON文本
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-800">导入预设</h3>

          <div className="space-y-6">
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <FileText size={20} className="text-gray-600" />
                  从文本导入
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="粘贴JSON格式的预设或预设组数据"
                  className="min-h-[150px] bg-white border-gray-300"
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleImportFromText}
                  disabled={!importText.trim()}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  导入
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Link size={20} className="text-gray-600" />
                  从网络链接导入
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="输入JSON文件的URL"
                  className="bg-white border-gray-300"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                />
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleImportFromUrl}
                  disabled={!importUrl.trim()}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  导入
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Upload size={20} className="text-gray-600" />
                  从本地文件导入
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload size={40} className="text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">点击选择或拖放文件到此处</p>
                  <Input
                    type="file"
                    accept=".json"
                    onChange={handleImportFromFile}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer border-gray-300 text-gray-700">
                      选择文件
                    </Button>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

