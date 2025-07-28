"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";

// Skema Zod yang sama persis dengan backend
const quizQuestionSchema = z.object({
  questionText: z.string().min(1, "Teks pertanyaan tidak boleh kosong."),
  options: z
    .array(z.string().min(1, "Teks pilihan tidak boleh kosong."))
    .length(4, "Harus ada 4 pilihan jawaban."),
  correctAnswerIndex: z.coerce
    .number({ invalid_type_error: "Anda harus memilih jawaban yang benar" })
    .min(0)
    .max(3),
});

const moduleSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter."),
  type: z.enum(["CONTENT", "LIVE_SESSION", "SUBMISSION", "QUIZ"]),
  contentText: z.string().optional(),
  contentUrl: z.string().url("URL tidak valid.").or(z.literal("")).optional(),
  quizData: z
    .object({
      questions: z.array(quizQuestionSchema),
    })
    .optional(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

interface ModuleFormDialogProps {
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ModuleFormDialog({
  courseId,
  isOpen,
  onClose,
  onSuccess,
}: ModuleFormDialogProps) {
  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      title: "",
      type: "CONTENT",
      contentText: "",
      contentUrl: "",
      quizData: { questions: [] },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "quizData.questions",
  });

  const moduleType = form.watch("type");

  const onSubmit = async (values: ModuleFormData) => {
    if (values.type !== "QUIZ") {
      delete values.quizData;
    }
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error("Gagal membuat modul.");
      toast.success("Modul baru berhasil ditambahkan.");
      form.reset();
      onSuccess();
    } catch (error) {
      toast.error("Gagal menyimpan", { description: (error as Error).message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Tambah Modul Baru</DialogTitle>
          <DialogDescription>
            Isi detail modul pembelajaran Anda.
          </DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto pr-6 -mr-6 flex-grow">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 py-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Judul Modul</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipe Modul</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONTENT">Konten</SelectItem>
                        <SelectItem value="LIVE_SESSION">Sesi Live</SelectItem>
                        <SelectItem value="SUBMISSION">Tugas</SelectItem>
                        <SelectItem value="QUIZ">Kuis</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {moduleType === "CONTENT" && (
                <FormField
                  control={form.control}
                  name="contentText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Materi Teks (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tulis materi Anda..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {moduleType === "LIVE_SESSION" && (
                <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Sesi Live</FormLabel>
                      <FormControl>
                        <Input placeholder="https://zoom.us/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {moduleType === "QUIZ" && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Pembuat Kuis</h3>
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border rounded-lg space-y-3 bg-muted/50 relative"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <h4 className="font-medium">Pertanyaan {index + 1}</h4>
                      <FormField
                        control={form.control}
                        name={`quizData.questions.${index}.questionText`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teks Pertanyaan</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`quizData.questions.${index}.correctAnswerIndex`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Pilihan Jawaban (Pilih yang benar)
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={String(field.value)}
                                className="space-y-2"
                              >
                                {[0, 1, 2, 3].map((optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex items-center gap-2"
                                  >
                                    <RadioGroupItem
                                      value={String(optionIndex)}
                                      id={`q${index}-o${optionIndex}`}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`quizData.questions.${index}.options.${optionIndex}`}
                                      render={({ field }) => (
                                        <FormItem className="flex-grow">
                                          <FormControl>
                                            <Input
                                              placeholder={`Pilihan ${
                                                optionIndex + 1
                                              }`}
                                              {...field}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        questionText: "",
                        options: ["", "", "", ""],
                        correctAnswerIndex: 0,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah Pertanyaan
                  </Button>
                </div>
              )}

              {/* FIX: Memindahkan DialogFooter ke dalam <form> tetapi di luar area scroll */}
              <DialogFooter className="pt-4 sticky bottom-0 bg-background">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Batal
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan Modul
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
