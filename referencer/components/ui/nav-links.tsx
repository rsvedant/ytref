"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" }
]

export function NavLinks() {
    const pathname = usePathname()
    return (
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
    )
}
