"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function InstructorBio({
  creator,
}: {
  creator: { name: string; bio?: string | null };
}) {
  return (
    <div className="border rounded-lg p-6 bg-card">
      <h2 className="text-2xl font-bold mb-4">Tentang Instruktur</h2>
      <div className="flex items-start gap-4">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl">
            {creator.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-xl">{creator.name}</h3>
          <p className="text-muted-foreground mt-1">
            {creator.bio || "Instruktur berpengalaman di bidangnya."}
          </p>
        </div>
      </div>
    </div>
  );
}
