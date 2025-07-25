
export async function postClip(data: {
  videoId: string;
  startTime: number;
  endTime: number;
  title: string;
  thumbnail: string;
}) {
  const response = await fetch("http://localhost:3000/api/clips", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error("UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("Failed to save clip");
  }

  return response.json();
}
