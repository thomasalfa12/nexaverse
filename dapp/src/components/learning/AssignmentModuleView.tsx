// File: components/learning/AssignmentModuleView.tsx (REVISI LENGKAP)
import type { FullModuleData } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Check, Clock, FileCheck2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

// Komponen untuk state "Sudah Mengumpulkan"
function SubmittedView({
  submission,
}: {
  submission: FullModuleData["submissions"][0];
}) {
  const submittedAt = new Date(submission.submittedAt).toLocaleString("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <Card className="bg-green-500/10 border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck2 /> Tugas Terkumpul
        </CardTitle>
        <CardDescription>
          Anda telah mengumpulkan tugas ini pada {submittedAt}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submission.isApproved ? (
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
            <Check /> Telah Dinilai: Lulus
          </div>
        ) : (
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 font-semibold">
            <Clock /> Menunggu Penilaian
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="link" asChild>
          <a
            href={submission.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Lihat file yang dikumpulkan
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

// Komponen untuk state "Belum Mengumpulkan"
function SubmissionForm({ deadline }: { deadline?: Date | null }) {
  const handleSubmission = () => {
    toast.info("Fitur pengumpulan tugas akan segera hadir!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kumpulkan Tugas Anda</CardTitle>
        <CardDescription>
          {deadline
            ? `Batas waktu: ${new Date(deadline).toLocaleString("id-ID")}`
            : "Tidak ada batas waktu."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSubmission} size="lg" className="w-full">
          <UploadCloud className="mr-2 h-4 w-4" />
          Unggah File
        </Button>
      </CardContent>
    </Card>
  );
}

export function AssignmentModuleView({ module }: { module: FullModuleData }) {
  if (!module.assignment)
    return (
      <div className="p-8 text-center">Informasi tugas tidak tersedia.</div>
    );

  const latestSubmission = module.submissions?.[0];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
        {module.title}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold border-b pb-2">Instruksi</h2>
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {module.assignment.instructions}
            </ReactMarkdown>
          </article>
        </div>
        <div className="lg:col-span-1 sticky top-24">
          {latestSubmission ? (
            <SubmittedView submission={latestSubmission} />
          ) : (
            <SubmissionForm deadline={module.assignment.deadline} />
          )}
        </div>
      </div>
    </div>
  );
}
