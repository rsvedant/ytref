"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Triangle } from "lucide-react"
import { ModeToggle } from "./theme-toggle"

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/dashboard", label: "Dashboard" },
]

export function GlassNav() {
	const pathname = usePathname()

	return (
		<>
			<svg style={{ display: "none" }}>
				<filter id="glass-distortion">
					<feTurbulence
						type="turbulence"
						baseFrequency="0.008"
						numOctaves="2"
						result="noise"
					/>
					<feDisplacementMap in="SourceGraphic" in2="noise" scale="77" />
				</filter>
			</svg>
			<nav className="glass-nav w-full max-w-6xl">
				<div className="glass-filter"></div>
				<div className="glass-overlay"></div>
				<div className="glass-specular"></div>
				<div className="glass-content">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<Link href="/" className="flex items-center gap-2">
								<Triangle className="h-5 w-5" />
								<span className="font-bold">YT Referencer</span>
							</Link>
						</div>
						<ul className="nav-list hidden sm:flex">
							{navItems.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className={cn(
											"nav-item",
											pathname === item.href && "active"
										)}
									>
										{item.label}
									</Link>
								</li>
							))}
						</ul>
						<div className="flex items-center gap-4">
							<ModeToggle />
							{/* Add account management button here */}
						</div>
					</div>
				</div>
			</nav>
		</>
	)
}