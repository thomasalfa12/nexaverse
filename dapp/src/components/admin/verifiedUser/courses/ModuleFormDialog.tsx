"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, PlusCircle, Trash2, GripVertical } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";

const quizQuestionSchema = z.object({
  questionText: z.string().min(5, "Teks pertanyaan minimal 5 karakter."),
  options: z
    .array(z.string().min(1, "Teks pilihan tidak boleh kosong."))
    .length(4, "Harus ada 4 pilihan jawaban."),
  correctAnswerIndex: z.number().min(0).max(3),
});

const moduleSchema = z.discriminatedUnion("type", [
  z.object({
    title: z.string().min(3, "Judul modul minimal 3 karakter."),
    type: z.literal("CONTENT"),
    textContent: z.string().min(10, "Konten teks minimal 10 karakter."),
  }),
  z.object({
    title: z.string().min(3, "Judul modul minimal 3 karakter."),
    type: z.literal("LIVE_SESSION"),
    meetingUrl: z.string().url("URL meeting tidak valid."),
    sessionTime: z.date({ required_error: "Waktu sesi wajib diisi." }),
  }),
  z.object({
    title: z.string().min(3, "Judul modul minimal 3 karakter."),
    type: z.literal("SUBMISSION"),
    assignmentInstructions: z
      .string()
      .min(10, "Instruksi tugas minimal 10 karakter."),
  }),
  z.object({
    title: z.string().min(3, "Judul modul minimal 3 karakter."),
    type: z.literal("QUIZ"),
    quizData: z.object({
      questions: z
        .array(quizQuestionSchema)
        .min(1, "Kuis harus memiliki setidaknya satu pertanyaan."),
    }),
  }),
]);

type ModuleFormData = z.infer<typeof moduleSchema>;

const formatDateForInput = (date?: Date): string => {
  if (!date) return "";
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

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
      textContent: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "quizData.questions",
  });

  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);
  const moduleType = form.watch("type");

  useEffect(() => {
    if (fields.length > 0 && selectedQuestionIndex === null) {
      setSelectedQuestionIndex(0);
    }
    if (fields.length === 0) {
      setSelectedQuestionIndex(null);
    }
  }, [fields.length, selectedQuestionIndex]);

  const handleAddQuestion = () => {
    const newIndex = fields.length;
    append({
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    });
    setSelectedQuestionIndex(newIndex);
  };

  const handleRemoveQuestion = (index: number) => {
    remove(index);
    if (selectedQuestionIndex === index) {
      if (fields.length - 1 <= 0) {
        setSelectedQuestionIndex(null);
      } else if (index >= fields.length - 1) {
        setSelectedQuestionIndex(index - 1);
      } else {
        setSelectedQuestionIndex(index);
      }
    } else if (selectedQuestionIndex && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const handleTypeChange = (newType: string) => {
    const currentTitle = form.getValues("title");

    switch (newType) {
      case "CONTENT":
        form.reset({
          title: currentTitle,
          type: "CONTENT",
          textContent: "",
        });
        break;
      case "LIVE_SESSION":
        form.reset({
          title: currentTitle,
          type: "LIVE_SESSION",
          meetingUrl: "",
          sessionTime: undefined,
        });
        break;
      case "SUBMISSION":
        form.reset({
          title: currentTitle,
          type: "SUBMISSION",
          assignmentInstructions: "",
        });
        break;
      case "QUIZ":
        form.reset({
          title: currentTitle,
          type: "QUIZ",
          quizData: { questions: [] },
        });
        setSelectedQuestionIndex(null);
        break;
    }
  };

  const onSubmit = async (values: ModuleFormData) => {
    try {
      const validation = moduleSchema.safeParse(values);
      if (!validation.success) {
        toast.error("Data form tidak valid. Periksa kembali isian Anda.");
        return;
      }

      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `HTTP ${response.status}: ${response.statusText}`
        );
      }

      toast.success("Modul baru berhasil ditambahkan!");

      form.reset({
        title: "",
        type: "CONTENT",
        textContent: "",
      });
      setSelectedQuestionIndex(null);
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Gagal menyimpan modul", {
        description:
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan tidak dikenal",
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !form.formState.isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-6xl lg:max-w-7xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold">
            Tambah Modul Baru
          </DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Pilih tipe modul dan isi detailnya.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-grow flex flex-col overflow-hidden"
          >
            <div className="flex-grow flex flex-col overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-6 space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-foreground">
                            Judul Modul
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Contoh: Pengenalan Smart Contract"
                              {...field}
                              className="h-11"
                            />
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
                          <FormLabel className="text-sm font-semibold text-foreground">
                            Tipe Modul
                          </FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleTypeChange(value);
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="CONTENT">
                                📝 Konten Teks
                              </SelectItem>
                              <SelectItem value="LIVE_SESSION">
                                🎥 Sesi Live
                              </SelectItem>
                              <SelectItem value="SUBMISSION">
                                📤 Tugas
                              </SelectItem>
                              <SelectItem value="QUIZ">🧠 Kuis</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {moduleType === "CONTENT" && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                      <FormField
                        control={form.control}
                        name="textContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Materi Teks (Markdown didukung)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tulis materi pembelajaran Anda di sini..."
                                {...field}
                                rows={14}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {moduleType === "LIVE_SESSION" && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="meetingUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>URL Sesi Live</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://zoom.us/j/1234567890"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sessionTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tanggal & Waktu Sesi</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  value={formatDateForInput(field.value)}
                                  onChange={(e) =>
                                    field.onChange(
                                      e.target.value
                                        ? new Date(e.target.value)
                                        : undefined
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}

                  {moduleType === "SUBMISSION" && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-lg p-6 border border-green-200 dark:border-green-800">
                      <FormField
                        control={form.control}
                        name="assignmentInstructions"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instruksi Tugas</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Jelaskan detail tugas yang harus dikerjakan siswa..."
                                {...field}
                                rows={12}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {moduleType === "QUIZ" && (
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 rounded-lg p-6 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 dark:text-orange-300">
                            🧠
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                          Pembuat Kuis Interaktif
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-[400px]">
                        <div className="md:col-span-1 bg-white/50 dark:bg-black/20 rounded-lg p-3 flex flex-col border border-orange-200 dark:border-orange-800/50">
                          <h4 className="font-medium text-sm text-orange-900 dark:text-orange-200 px-2 pb-2 mb-2 border-b border-orange-200 dark:border-orange-800/50">
                            Daftar Pertanyaan
                          </h4>
                          <ScrollArea className="flex-grow pr-2">
                            <div className="space-y-2">
                              {fields.map((field, index) => (
                                <button
                                  key={field.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedQuestionIndex(index)
                                  }
                                  className={`w-full text-left flex items-center gap-2 p-2 rounded-md transition-colors text-sm ${
                                    selectedQuestionIndex === index
                                      ? "bg-orange-200 dark:bg-orange-800 font-semibold"
                                      : "hover:bg-orange-100 dark:hover:bg-orange-900/50"
                                  }`}
                                >
                                  <GripVertical className="h-4 w-4 text-orange-400 flex-shrink-0" />
                                  <span className="flex-grow truncate">
                                    Pertanyaan {index + 1}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddQuestion}
                            className="mt-4 w-full bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-300 dark:bg-orange-900/50 dark:hover:bg-orange-900 dark:text-orange-200 dark:border-orange-700"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                          </Button>
                        </div>

                        <div className="md:col-span-3 bg-white dark:bg-gray-900 rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm relative">
                          {selectedQuestionIndex !== null &&
                          fields[selectedQuestionIndex] ? (
                            <div key={fields[selectedQuestionIndex].id}>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 h-8 w-8 text-gray-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-full"
                                onClick={() =>
                                  handleRemoveQuestion(selectedQuestionIndex)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>

                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center text-sm font-medium text-orange-600 dark:text-orange-300">
                                  {selectedQuestionIndex + 1}
                                </div>
                                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                  Edit Pertanyaan {selectedQuestionIndex + 1}
                                </h4>
                              </div>

                              <FormField
                                control={form.control}
                                name={`quizData.questions.${selectedQuestionIndex}.questionText`}
                                render={({ field }) => (
                                  <FormItem className="mb-6">
                                    <FormLabel className="text-sm font-medium">
                                      Teks Pertanyaan
                                    </FormLabel>
                                    <FormControl>
                                      <Textarea
                                        {...field}
                                        placeholder="Tulis pertanyaan Anda di sini..."
                                        rows={3}
                                        className="resize-none"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`quizData.questions.${selectedQuestionIndex}.correctAnswerIndex`}
                                render={({ field }) => (
                                  <FormItem className="space-y-4">
                                    <FormLabel className="text-sm font-medium">
                                      Pilihan Jawaban{" "}
                                      <span className="text-orange-600 dark:text-orange-400">
                                        (Pilih yang benar)
                                      </span>
                                    </FormLabel>
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={(value) =>
                                          field.onChange(parseInt(value, 10))
                                        }
                                        value={String(field.value)}
                                        className="space-y-3"
                                      >
                                        {[0, 1, 2, 3].map((optionIndex) => (
                                          <div
                                            key={optionIndex}
                                            className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                          >
                                            <RadioGroupItem
                                              value={String(optionIndex)}
                                              id={`q${selectedQuestionIndex}-o${optionIndex}`}
                                              className="flex-shrink-0"
                                            />
                                            <FormLabel
                                              htmlFor={`q${selectedQuestionIndex}-o${optionIndex}`}
                                              className="font-normal flex-grow sr-only"
                                            >
                                              Pilihan {optionIndex + 1}
                                            </FormLabel>
                                            <FormField
                                              control={form.control}
                                              name={`quizData.questions.${selectedQuestionIndex}.options.${optionIndex}`}
                                              render={({
                                                field: optionField,
                                              }) => (
                                                <FormItem className="flex-grow space-y-0">
                                                  <FormControl>
                                                    <Input
                                                      placeholder={`Pilihan ${String.fromCharCode(
                                                        65 + optionIndex
                                                      )}`}
                                                      {...optionField}
                                                      className="border-0 bg-transparent focus:bg-white dark:focus:bg-gray-900 transition-colors"
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
                          ) : (
                            <div className="text-center flex flex-col items-center justify-center h-full">
                              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">❓</span>
                              </div>
                              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                                Belum ada pertanyaan
                              </h4>
                              <p className="text-sm text-orange-600 dark:text-orange-400 mb-4 max-w-xs">
                                Klik tombol &quot;+ Tambah&quot; di panel kiri
                                untuk membuat pertanyaan pertama Anda.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="quizData.questions"
                        render={() => (
                          <FormMessage className="mt-4 text-center" />
                        )}
                      />
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="flex-shrink-0 px-6 py-4 border-t bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between w-full">
                <div className="text-sm text-muted-foreground">
                  {moduleType === "QUIZ" && fields.length > 0 && (
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {fields.length} Pertanyaan
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="px-6"
                    disabled={form.formState.isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {form.formState.isSubmitting && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {form.formState.isSubmitting
                      ? "Menyimpan..."
                      : "Simpan Modul"}
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
