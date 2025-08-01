import { NextRequest, NextResponse } from "next/server";
import { uploadFileToIPFS, type UploadOptions } from "@/lib/ipfs-uploader";
import { getAppSession } from "@/lib/auth";

const MAX_FILE_SIZE_MB = 1;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Keamanan: Pastikan hanya pengguna yang login yang bisa upload
    const session = await getAppSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diberikan" }, { status: 400 });
    }

    // Validasi ukuran file di server
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: `Ukuran file tidak boleh melebihi ${MAX_FILE_SIZE_MB}MB` }, { status: 413 });
    }

    // Buat metadata yang kaya untuk dilampirkan pada file di IPFS
    const clientIP = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip");
    const uploadOptions: UploadOptions = {
      metadata: {
        name: file.name,
        keyvalues: {
          userId: session.user.id,
          userAddress: session.user.address,
          clientIP: clientIP,
          uploadedAt: new Date().toISOString(),
        }
      }
    };

    // Panggil dispatcher utama kita dengan file dan options
    const ipfsUrl = await uploadFileToIPFS(file, uploadOptions);

    return NextResponse.json({
      success: true,
      ipfsUrl: ipfsUrl,
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
