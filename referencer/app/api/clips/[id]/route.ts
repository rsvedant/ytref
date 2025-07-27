import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { allowedOrigins } from '@/lib/cors'

interface UpdateClipBody {
    title?: string
    thumbnail?: string
    startTime?: number
    endTime?: number
    isPublic?: boolean
}


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
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            )
        }

        // Extract and validate ID
        const { id } = await params
        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Invalid clip ID" },
                { status: 400, headers: corsHeaders }
            )
        }

        // Fetch clip from database
        const clip = await prisma.clip.findFirst({
            where: {
                id,
                userId: session.user.id
            },
            select: {
                id: true,
                videoId: true,
                title: true,
                thumbnail: true,
                startTime: true,
                endTime: true,
                isPublic: true,
                shareSlug: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!clip) {
            return NextResponse.json(
                { error: "Clip not found" },
                { status: 404, headers: corsHeaders }
            )
        }

        return NextResponse.json(
            { clip },
            { status: 200, headers: corsHeaders }
        )
    } catch (error) {
        console.error("Error fetching clip:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const origin = request.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            )
        }

        // Extract and validate ID
        const { id } = await params
        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Invalid clip ID" },
                { status: 400, headers: corsHeaders }
            )
        }

        // Parse and validate request body
        let body: UpdateClipBody
        try {
            body = await request.json()
        } catch (error) {
            return NextResponse.json(
                { error: "Invalid JSON body" },
                { status: 400, headers: corsHeaders }
            )
        }

        // Validate field types if present
        const { title, thumbnail, startTime, endTime, isPublic } = body

        if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
            return NextResponse.json(
                { error: "title must be a non-empty string" },
                { status: 400, headers: corsHeaders }
            )
        }

        if (thumbnail !== undefined && (typeof thumbnail !== "string" || thumbnail.trim() === "")) {
            return NextResponse.json(
                { error: "thumbnail must be a non-empty string" },
                { status: 400, headers: corsHeaders }
            )
        }

        if (startTime !== undefined && typeof startTime !== "number") {
            return NextResponse.json(
                { error: "startTime must be a number" },
                { status: 400, headers: corsHeaders }
            )
        }

        if (endTime !== undefined && typeof endTime !== "number") {
            return NextResponse.json(
                { error: "endTime must be a number" },
                { status: 400, headers: corsHeaders }
            )
        }

        if (isPublic !== undefined && typeof isPublic !== "boolean") {
            return NextResponse.json(
                { error: "isPublic must be a boolean" },
                { status: 400, headers: corsHeaders }
            )
        }

        // Get current clip to validate time constraints
        const currentClip = await prisma.clip.findFirst({
            where: {
                id,
                userId: session.user.id
            },
            select: {
                id: true,
                startTime: true,
                endTime: true
            }
        })

        if (!currentClip) {
            return NextResponse.json(
                { error: "Clip not found" },
                { status: 404, headers: corsHeaders }
            )
        }

        // Validate time constraints
        const finalStartTime = startTime !== undefined ? startTime : currentClip.startTime
        const finalEndTime = endTime !== undefined ? endTime : currentClip.endTime

        if (finalEndTime <= finalStartTime) {
            return NextResponse.json(
                { error: "endTime must be greater than startTime" },
                { status: 400, headers: corsHeaders }
            )
        }

        // Build update data object
        const updateData: Partial<UpdateClipBody> = {}
        if (title !== undefined) updateData.title = title
        if (thumbnail !== undefined) updateData.thumbnail = thumbnail
        if (startTime !== undefined) updateData.startTime = startTime
        if (endTime !== undefined) updateData.endTime = endTime
        if (isPublic !== undefined) updateData.isPublic = isPublic

        // Update clip in database
        const updatedClip = await prisma.clip.update({
            where: {
                id: currentClip.id
            },
            data: updateData,
            select: {
                id: true,
                videoId: true,
                title: true,
                thumbnail: true,
                startTime: true,
                endTime: true,
                isPublic: true,
                shareSlug: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return NextResponse.json(
            { clip: updatedClip },
            { status: 200, headers: corsHeaders }
        )
    } catch (error) {
        console.error("Error updating clip:", error)
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500, headers: corsHeaders }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const origin = request.headers.get("origin")
    const corsHeaders = getCorsHeaders(origin)

    try {
        // Check authentication
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401, headers: corsHeaders }
            )
        }

        // Extract and validate ID
        const { id } = await params
        if (!id || typeof id !== "string") {
            return NextResponse.json(
                { error: "Invalid clip ID" },
                { status: 400, headers: corsHeaders }
            )
        }

        // Delete clip from database
        const deletedClip = await prisma.clip.deleteMany({
            where: {
                id,
                userId: session.user.id
            }
        })

        // Check if any record was deleted
        if (deletedClip.count === 0) {
            return NextResponse.json(
                { error: "Clip not found" },
                { status: 404, headers: corsHeaders }
            )
        }

        // Return success with no content
        return new NextResponse(null, { status: 204, headers: corsHeaders })
    } catch (error) {
        console.error("Error deleting clip:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500, headers: corsHeaders }
        )
    }
}
