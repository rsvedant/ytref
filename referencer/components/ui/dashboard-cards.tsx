"use client"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useState } from "react"

export const HoverEffect = ({
    items,
    className,
}: {
    items: {
        title: string
        punchline: string
        description: string
        link?: string
        productImage: string
    }[]
    className?: string
}) => {
    let [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
                className
            )}
        >
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="relative group  block p-2 h-full w-full"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === idx && (
                            <motion.span
                                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block  rounded-3xl"
                                layoutId="hoverBackground"
                                initial={{ opacity: 0 }}
                                animate={{
                                    opacity: 1,
                                    transition: { duration: 0.15 },
                                }}
                                exit={{
                                    opacity: 0,
                                    transition: { duration: 0.15, delay: 0.2 },
                                }}
                            />
                        )}
                    </AnimatePresence>
                    {item.link ? (
                        <Link href={item.link}>
                            <Card productImage={item.productImage}>
                                <CardTitle>{item.title}</CardTitle>
                                <CardPunchline>{item.punchline}</CardPunchline>
                                <CardDescription>{item.description}</CardDescription>
                            </Card>
                        </Link>
                    ) : (
                        <Card productImage={item.productImage}>
                            <CardTitle>{item.title}</CardTitle>
                            <CardPunchline>{item.punchline}</CardPunchline>
                            <CardDescription>{item.description}</CardDescription>
                        </Card>
                    )}
                </div>
            ))}
        </div>
    )
}

export const Card = ({
    className,
    children,
    productImage,
}: {
    className?: string
    children: React.ReactNode
    productImage?: string
}) => {
    const [isBought, setIsBought] = useState(false)

    return (
        <div
            className={cn(
                "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
                className
            )}
        >
            <div className="relative z-50">
                {productImage && (
                    <img
                        src={productImage}
                        alt="Product Image"
                        className="w-full h-64 object-contain rounded-t-lg"
                    />
                )}
                <div className="p-4">
                    {children}
                    {!isBought && (
                        <motion.button
                            className="mt-4 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-700 text-white transition-colors duration-300"
                            onClick={() => setIsBought(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Buy
                        </motion.button>
                    )}
                    {isBought && (
                        <motion.div
                            className="mt-4 px-4 py-2 rounded-md bg-green-500 text-white flex items-center justify-center"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <svg
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const CardTitle = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return (
        <h4 className={cn("text-zinc-100 font-bold tracking-wide", className)}>
            {children}
        </h4>
    )
}

export const CardPunchline = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return (
        <p
            className={cn(
                "mt-2 text-zinc-300 font-medium tracking-wide",
                className
            )}
        >
            {children}
        </p>
    )
}

export const CardDescription = ({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) => {
    return (
        <p
            className={cn(
                "mt-4 text-zinc-400 tracking-wide leading-relaxed text-sm",
                className
            )}
        >
            {children}
        </p>
    )
}
