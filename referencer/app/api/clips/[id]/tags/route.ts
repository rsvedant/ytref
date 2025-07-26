import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const allowedOrigins = [
    "chrome-extension://gnnmpolacegkhdellgjmpjbmnhabloop",
    "http://localhost:3000"
]

function getCorsHeaders(origin: string | null) {
    const headers = new Headers()
    if (origin && allowedOrigins.includes(origin)) {
        headers.set("Access-Control-Allow-Origin", origin)
    }
    headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PATCH")
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    headers.set("Access-Control-Allow-Credentials", "true")
    return headers
}

export async function OPTIONS(request: NextRequest) {
    const origin = request.headers.get("origin")
    const headers = getCorsHeaders(origin)
    return new NextResponse(null, { status: 204, headers })
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const origin = request.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    try {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
        }

        const { id: clipId } = await params
        if (!clipId) {
            return NextResponse.json({ error: "Clip ID is required" }, { status: 400, headers: corsHeaders })
        }

        // Verify clip ownership
        const clip = await prisma.clip.findFirst({
            where: { id: clipId, userId: session.user.id },
        })

        if (!clip) {
            return NextResponse.json({ error: "Clip not found" }, { status: 404, headers: corsHeaders })
        }

        const clipTags = await prisma.clipTag.findMany({
            where: { clipId: clipId },
            include: {
                tag: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        })

        const tags = clipTags.map(clipTag => ({
            id: clipTag.tag.id,
            name: clipTag.tag.name,
            rating: clipTag.rating,
        }))

        return NextResponse.json({ tags }, { status: 200, headers: corsHeaders })
    } catch (error) {
        console.error("Error fetching clip tags:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const origin = request.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    try {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
        }

        const { id: clipId } = await params
        if (!clipId) {
            return NextResponse.json({ error: "Clip ID is required" }, { status: 400, headers: corsHeaders })
        }

        // Verify clip ownership
        const clip = await prisma.clip.findFirst({
            where: { id: clipId, userId: session.user.id },
        })

        if (!clip) {
            return NextResponse.json({ error: "Clip not found" }, { status: 404, headers: corsHeaders })
        }

        const body = await request.json()
        const { tagId, rating } = body

        if (!tagId || typeof tagId !== 'string') {
            return NextResponse.json({ error: "tagId must be a string" }, { status: 400, headers: corsHeaders })
        }
        
        if (rating === undefined || typeof rating !== 'number') {
            return NextResponse.json({ error: "rating must be a number" }, { status: 400, headers: corsHeaders })
        }

        const clipTag = await prisma.clipTag.upsert({
            where: {
                clipId_tagId: {
                    clipId,
                    tagId,
                },
            },
            create: {
                clipId,
                tagId,
                rating,
            },
            update: {
                rating,
            },
        })

        return NextResponse.json(clipTag, { status: 201, headers: corsHeaders })
    } catch (error) {
        console.error("Error upserting clip tag:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const origin = request.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    try {
        const session = await auth.api.getSession({ headers: await headers() })
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders })
        }

        const { id: clipId } = await params
        if (!clipId) {
            return NextResponse.json({ error: "Clip ID is required" }, { status: 400, headers: corsHeaders })
        }

        // Verify clip ownership first
        const clip = await prisma.clip.findFirst({
            where: { id: clipId, userId: session.user.id },
        })

        if (!clip) {
            return NextResponse.json({ error: "Clip not found or not owned by user" }, { status: 404, headers: corsHeaders })
        }

        const body = await request.json()
        const { tagId } = body

        if (!tagId || typeof tagId !== 'string') {
            return NextResponse.json({ error: "tagId must be a string" }, { status: 400, headers: corsHeaders })
        }

        const deleteResult = await prisma.clipTag.deleteMany({
            where: {
                clipId: clipId,
                tagId: tagId,
            },
        })

        if (deleteResult.count === 0) {
            return NextResponse.json({ error: "Tag association not found" }, { status: 404, headers: corsHeaders })
        }

        return new NextResponse(null, { status: 204, headers: corsHeaders })
    } catch (error) {
        console.error("Error deleting clip tag:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders })
    }
}