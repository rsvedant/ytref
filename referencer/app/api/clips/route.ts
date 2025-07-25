import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface CreateClipBody {
  videoId: string
  title: string
  thumbnail: string
  startTime: number
  endTime: number
}

const allowedOrigins = [
  "chrome-extension://gnnmpolacegkhdellgjmpjbmnhabloop",
  "http://localhost:3000",
];

function getCorsHeaders(origin: string | null) {
  const headers = new Headers();
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = getCorsHeaders(origin);
  return new NextResponse(null, { status: 204, headers });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Parse and validate request body
    let body: CreateClipBody
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate required fields
    const { videoId, title, thumbnail, startTime, endTime } = body

    if (!videoId || typeof videoId !== "string") {
      return NextResponse.json(
        { error: "videoId is required and must be a string" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "title is required and must be a string" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!thumbnail || typeof thumbnail !== "string") {
      return NextResponse.json(
        { error: "thumbnail is required and must be a string" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (typeof startTime !== "number") {
      return NextResponse.json(
        { error: "startTime is required and must be a number" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (typeof endTime !== "number") {
      return NextResponse.json(
        { error: "endTime is required and must be a number" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (endTime <= startTime) {
      return NextResponse.json(
        { error: "endTime must be greater than startTime" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create clip in database
    const clip = await prisma.clip.create({
      data: {
        userId: session.user.id,
        videoId,
        title,
        thumbnail,
        startTime,
        endTime,
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
        updatedAt: true,
      },
    });

    return NextResponse.json(clip, { headers: corsHeaders });
  } catch (error) {
    console.error("Error creating clip:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
