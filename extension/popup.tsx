import { useEffect, useState } from "react"
import { postClip } from "./utils/api"
import { getCurrentTab, getVideoDetails } from "./utils/tabs"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Card, CardContent } from "./components/ui/card"
import { Play, Clock, Save, CheckCircle, AlertCircle, Scissors, Youtube, Timer, Edit3 } from "lucide-react"
import "./style.css"

interface VideoDetails {
  videoId: string
  title: string
  thumbnail: string
  startTime: number
  endTime: number
}

function IndexPopup() {
  const [details, setDetails] = useState<VideoDetails | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [maxDuration, setMaxDuration] = useState<number>(0)

  useEffect(() => {
    const fetchVideoDetails = async () => {
      const tab = await getCurrentTab()
      if (tab?.url?.includes("youtube.com/watch")) {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id! },
          func: getVideoDetails
        })
        if (result.result) {
          setDetails(result.result)
          setMaxDuration(result.result.endTime) // Store original video duration
        }
      }
      setLoading(false)
    }

    fetchVideoDetails()
  }, [])

  const handleDetailChange = (
    field: keyof VideoDetails,
    value: string | number
  ) => {
    if (details) {
      setDetails({ ...details, [field]: value })
    }
  }

  const handleMinutesChange = (field: 'startTime' | 'endTime', minutes: string) => {
    if (!details) return
    
    const mins = Math.max(0, parseInt(minutes) || 0)
    const currentSeconds = field === 'startTime' 
      ? details.startTime % 60 
      : details.endTime % 60
    
    let totalSeconds = mins * 60 + currentSeconds
    
    // Validate and constrain the time values
    if (field === 'startTime') {
      totalSeconds = Math.max(0, Math.min(totalSeconds, details.endTime - 1))
    } else if (field === 'endTime') {
      totalSeconds = Math.max(details.startTime + 1, Math.min(totalSeconds, maxDuration))
    }
    
    handleDetailChange(field, totalSeconds)
  }

  const handleSecondsChange = (field: 'startTime' | 'endTime', seconds: string) => {
    if (!details) return
    
    const secs = Math.max(0, Math.min(59, parseInt(seconds) || 0))
    const currentMinutes = Math.floor((field === 'startTime' ? details.startTime : details.endTime) / 60)
    
    let totalSeconds = currentMinutes * 60 + secs
    
    // Validate and constrain the time values
    if (field === 'startTime') {
      totalSeconds = Math.max(0, Math.min(totalSeconds, details.endTime - 1))
    } else if (field === 'endTime') {
      totalSeconds = Math.max(details.startTime + 1, Math.min(totalSeconds, maxDuration))
    }
    
    handleDetailChange(field, totalSeconds)
  }

  const handleSaveClip = async () => {
    if (!details) return
    setSaving(true)
    setMessage("")
    try {
      const result = await postClip(details)
      if (result.success) {
        setMessage("Clip saved successfully!")
      }
    } catch (error) {
      if (error.message === "UNAUTHORIZED") {
        // Open the sign-in page in a new tab
        chrome.tabs.create({ url: "http://localhost:3000/auth/sign-in" })
        setMessage("Please sign in to save clips")
      } else {
        setMessage("Failed to save clip")
        console.log("Error saving clip:", error)
      }
    } finally {
      setSaving(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const clipDuration = details ? details.endTime - details.startTime : 0
  const progressPercentage = details && maxDuration > 0 ? (clipDuration / maxDuration) * 100 : 0

  if (loading) {
    return (
      <div className="w-[420px] h-[300px] bg-gray-900 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <Youtube className="w-8 h-8 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="text-white font-medium">Analyzing video...</div>
            <div className="text-gray-300 text-sm mt-1">Extracting clip data</div>
          </div>
        </div>
      </div>
    )
  }

  if (!details) {
    return (
      <div className="w-[420px] h-[300px] bg-gray-900 relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center h-full p-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-700/30">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No YouTube Video Found</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Please navigate to a YouTube video to start clipping amazing content!
            </p>
            <div className="mt-4 px-4 py-2 bg-red-900/10 border border-red-700/20 rounded-lg">
              <p className="text-red-400 text-xs">Make sure you're on youtube.com/watch</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[420px] bg-gray-900 relative overflow-hidden">
      <div className="relative z-10">
        {/* Header with video thumbnail */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10"></div>
          <img
            src={details.thumbnail}
            alt={details.title}
            className="w-full h-48 object-cover"
          />

          {/* Duration badge */}
          <div className="absolute bottom-3 right-3 z-20">
            <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
              {formatTime(Math.floor(maxDuration))}
            </div>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <h2 className="text-white font-bold text-lg leading-tight line-clamp-2 drop-shadow-lg">
              {details.title}
            </h2>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Title editor */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white">
              <Edit3 className="w-4 h-4 text-white" />
              <label className="text-sm font-semibold">Video Title</label>
            </div>
            <Input
              value={details.title}
              onChange={(e) => handleDetailChange("title", e.target.value.trim())}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400/20"
              placeholder="Enter custom title..."
            />
          </div>

          {/* Time controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-400">
                <Timer className="w-4 h-4 text-green-400" />
                <label className="text-sm font-semibold">Start Time</label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max={Math.floor(maxDuration / 60)}
                  value={Math.floor(details.startTime / 60)}
                  onChange={(e) => handleMinutesChange('startTime', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-center focus:border-green-500 focus:ring-green-500/20 w-16 h-10 text-sm px-3 py-2"
                  placeholder="0"
                />
                <span className="text-gray-300 text-sm font-medium">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={Math.floor(details.startTime % 60)}
                  onChange={(e) => handleSecondsChange('startTime', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-center focus:border-green-500 focus:ring-green-500/20 w-16 h-10 text-sm px-3 py-2"
                  placeholder="00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-red-400">
                <Timer className="w-4 h-4 text-red-400" />
                <label className="text-sm font-semibold">End Time</label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  min="0"
                  max={Math.floor(maxDuration / 60)}
                  value={Math.floor(details.endTime / 60)}
                  onChange={(e) => handleMinutesChange('endTime', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-center focus:border-red-500 focus:ring-red-500/20 w-16 h-10 text-sm px-3 py-2"
                  placeholder="0"
                />
                <span className="text-gray-300 text-sm font-medium">:</span>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={Math.floor(details.endTime % 60)}
                  onChange={(e) => handleSecondsChange('endTime', e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white text-center focus:border-red-500 focus:ring-red-500/20 w-16 h-10 text-sm px-3 py-2"
                  placeholder="00"
                />
              </div>
            </div>
          </div>

          {/* Clip duration visualization */}
          <Card className="bg-gray-800 border-gray-600">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">Clip Duration</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-lg">{formatTime(clipDuration)}</div>
                  <div className="text-gray-300 text-xs">{progressPercentage.toFixed(1)}% of video</div>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-white h-full transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save button */}
          <Button
            onClick={handleSaveClip}
            disabled={saving}
            className="w-full h-12 bg-gray-800 text-white hover:bg-gray-700 border border-gray-600 font-medium text-base rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving your clip...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Save className="w-5 h-5 text-white" />
                <span>Save Clip</span>
              </div>
            )}
          </Button>

          {/* Status message */}
          {message && (
            <div className={`p-4 rounded-lg border backdrop-blur-sm ${
              message.includes("success") 
                ? "bg-green-950/50 border-green-800/50 text-green-200" 
                : "bg-red-950/50 border-red-800/50 text-red-200"
            }`}>
              <div className="flex items-center space-x-3">
                {message.includes("success") ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
