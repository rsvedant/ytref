import { cn } from "@/lib/utils"
import React from "react"

export default function GridSmallBackgroundDemo() {
  return (
    <div className="h-full w-full bg-white dark:bg-black">
      <div
        className={cn(
          "h-full w-full",
          "[background-size:20px_20px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]",
        )}
      />
    </div>
  )
}
