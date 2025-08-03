import type { FullModuleData } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

export function AssignmentModuleView({ module }: { module: FullModuleData }) {
  if (!module.assignment)
    return <div className="p-8">Informasi tugas tidak tersedia.</div>;

  // Placeholder untuk logika pengumpulan tugas di masa depan
  const handleSubmission = () => {
    toast.info("Fitur pengumpulan tugas akan segera hadir!");
  };

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold tracking-tight mb-4">{module.title}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-semibold border-b pb-2 mb-4">
            Instruksi
          </h2>
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {module.assignment.instructions}
            </ReactMarkdown>
          </article>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Kumpulkan Tugas Anda</CardTitle>
              <CardDescription>
                Unggah file Anda di sini untuk dinilai oleh kreator.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSubmission} size="lg" className="w-full">
                <UploadCloud className="mr-2 h-4 w-4" />
                Unggah File
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
