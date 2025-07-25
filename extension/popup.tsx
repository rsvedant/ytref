import { useState } from "react";
import { postClip } from "./utils/api";

function IndexPopup() {
  const [videoId, setVideoId] = useState("dQw4w9WgXcQ");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [title, setTitle] = useState("Rick Astley - Never Gonna Give You Up");
  const [thumbnail, setThumbnail] = useState(
    "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  );
  const [message, setMessage] = useState("");

  const handleSaveClip = async () => {
    try {
      await postClip({ videoId, startTime, endTime, title, thumbnail });
      setMessage("Clip saved!");
    } catch (error) {
      if (error.message === "UNAUTHORIZED") {
        window.location.href = "http://localhost:3000/auth/sign-in";
      } else {
        setMessage("Failed to save clip");
        console.log("Error saving clip:", error);
      }
    }
  };

  return (
    <div
      style={{
        padding: 16,
        width: 300,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <h2>Save a Clip</h2>
      <input
        type="text"
        placeholder="Video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <input
        type="number"
        placeholder="Start Time"
        value={startTime}
        onChange={(e) => setStartTime(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="End Time"
        value={endTime}
        onChange={(e) => setEndTime(Number(e.target.value))}
      />
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
       <input
        type="text"
        placeholder="Thumbnail URL"
        value={thumbnail}
        onChange={(e) => setThumbnail(e.target.value)}
      />
      <button onClick={handleSaveClip}>Save Clip</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default IndexPopup;
