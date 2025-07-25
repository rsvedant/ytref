
export const getCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    return tab
}

export const getVideoDetails = () => {
    const videoId = new URLSearchParams(window.location.search).get("v")
    const video = document.querySelector("video")
    const title = document.querySelector("h1.style-scope.ytd-watch-metadata")?.textContent || "Untitled"
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

    if (!video || !videoId) return null

    return {
        videoId,
        title,
        thumbnail,
        startTime: Math.floor(video.currentTime),
        endTime: Math.floor(video.duration),
    }
}
