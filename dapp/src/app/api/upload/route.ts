// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadToPinataServer, type UploadOptions } from "@/lib/pinata-uploader";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const optionsStr = formData.get("options") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Parse options if provided
    let options: UploadOptions = {};
    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr);
      } catch (e) {
        console.warn("Invalid options JSON:", e);
      }
    }

    // Get client IP from headers (NextRequest doesn't have .ip property)
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Upload using server-side method with proper options
    const uploadOptions: UploadOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB default
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      metadata: {
        name: file.name,
        keyvalues: {
          uploadedVia: "api-route",
          clientIP: clientIP,
          userAgent: request.headers.get("user-agent") || "unknown",
          uploadedAt: new Date().toISOString(),
        }
      },
      // Merge with provided options, but prioritize server defaults for security
      ...options
    };

    // Call uploadToPinataServer which returns a string (ipfsUrl)
    const ipfsUrl = await uploadToPinataServer(file, uploadOptions);

    // Extract hash from URL for response
    const ipfsHash = ipfsUrl.replace('ipfs://', '');

    return NextResponse.json({
      success: true,
      ipfsHash: ipfsHash,
      ipfsUrl: ipfsUrl,
      size: file.size // We can use file.size since we have the original file
    });

  } catch (error) {
    console.error("Upload API Error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}