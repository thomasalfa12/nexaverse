import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { getAuth } from "@/lib/server/auth";

export async function DELETE(req: Request, { params }: { params: { moduleId: string } }) {
    try {
        const { user } = await getAuth();
        if (!user?.address || !user.roles.includes("VERIFIED_ENTITY")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Prisma akan error jika pengguna mencoba menghapus modul yang bukan miliknya
        await prisma.courseModule.delete({
            where: { 
                id: params.moduleId,
                template: { creator: { walletAddress: user.address } }
            },
        });

        return new NextResponse(null, { status: 204 }); // No Content
    } catch (error) {
        console.error("Error deleting module:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}