import type { FullModuleData } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video } from "lucide-react";

export function LiveSessionModuleView({ module }: { module: FullModuleData }) {
  if (!module.liveSession)
    return <div className="p-8">Informasi sesi tidak tersedia.</div>;

  const sessionTime = new Date(module.liveSession.sessionTime);
  const formattedDate = sessionTime.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = sessionTime.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-4">{module.title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="text-primary" />
            Sesi Live Terjadwal
          </CardTitle>
          <CardDescription>
            Bergabunglah dengan sesi interaktif ini untuk belajar langsung dari
            kreator.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-start gap-4">
            <Calendar className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Tanggal</p>
              <p className="text-muted-foreground">{formattedDate}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">Waktu</p>
              <p className="text-muted-foreground">{formattedTime}</p>
            </div>
          </div>
          <Button asChild size="lg" className="w-full">
            <a
              href={module.liveSession.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Gabung Sesi Sekarang
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
