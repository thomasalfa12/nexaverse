"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// --- Props ---
interface ContentViewProps {
  courseId: string;
  moduleId: string | null;
}

// --- Tipe Data Lokal ---
interface ModuleContent {
  title: string;
  type: "CONTENT" | "LIVE_SESSION" | "SUBMISSION" | "QUIZ";
  contentText: string | null;
  contentUrl: string | null;
  quizData?: {
    questions: {
      questionText: string;
      options: string[];
      correctAnswerIndex: number;
    }[];
  };
}

// --- Fungsi Helper untuk YouTube ---
function getYoutubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  let videoId = null;
  const youtubeRegex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  if (match) {
    videoId = match[1];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

// --- Sub-komponen untuk Kuis ---
function QuizPlayer({ quizData }: { quizData: ModuleContent["quizData"] }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  if (!quizData || quizData.questions.length === 0) {
    return <p>Kuis tidak valid.</p>;
  }

  const questions = quizData.questions;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = () => {
    let finalScore = 0;
    questions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswerIndex) {
        finalScore++;
      }
    });
    setScore(finalScore);
    setIsFinished(true);
  };

  if (isFinished) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Hasil Kuis</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg">Anda menjawab dengan benar</p>
          <p className="text-5xl font-bold my-4">
            {score} / {questions.length}
          </p>
          <Button
            onClick={() => {
              setIsFinished(false);
              setCurrentQuestionIndex(0);
              setSelectedAnswers([]);
            }}
          >
            Ulangi Kuis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 font-semibold">{currentQuestion.questionText}</p>
        <RadioGroup
          onValueChange={(value) => handleAnswer(parseInt(value))}
          value={selectedAnswers[currentQuestionIndex]?.toString()}
        >
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-3 border rounded-md"
            >
              <RadioGroupItem
                value={index.toString()}
                id={`q${currentQuestionIndex}-o${index}`}
              />
              <Label htmlFor={`q${currentQuestionIndex}-o${index}`}>
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
          disabled={currentQuestionIndex === 0}
        >
          Sebelumnya
        </Button>
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
            Selanjutnya
          </Button>
        ) : (
          <Button onClick={handleSubmitQuiz}>Selesai & Lihat Hasil</Button>
        )}
      </CardFooter>
    </Card>
  );
}

// --- Sub-komponen untuk Pengumpulan Tugas ---
function SubmissionBox() {
  // Di aplikasi nyata, Anda akan menambahkan state dan fungsi untuk handle submit
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Pengumpulan Tugas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="submission-url">URL Tugas</Label>
          <Input
            id="submission-url"
            placeholder="https://github.com/user/repo"
          />
        </div>
        <div>
          <Label htmlFor="submission-notes">Catatan (Opsional)</Label>
          <Textarea
            id="submission-notes"
            placeholder="Catatan tambahan untuk instruktur..."
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Kumpulkan Tugas</Button>
      </CardFooter>
    </Card>
  );
}

// --- Komponen Utama ---
export function ContentView({ courseId, moduleId }: ContentViewProps) {
  const [content, setContent] = useState<ModuleContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) {
      setContent(null);
      return;
    }

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Gagal memuat konten modul.");
        }
        setContent(await res.json());
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [courseId, moduleId]);

  if (!moduleId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-muted rounded-lg">
        <h2 className="text-xl font-semibold">
          Selamat Datang di Ruang Belajar!
        </h2>
        <p className="mt-2 text-muted-foreground">
          Pilih modul dari daftar di samping untuk memulai pelajaran Anda.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <ShieldAlert className="inline-block mr-2" /> Error: {error}
      </div>
    );
  }

  if (!content) return null;

  // --- Logika Rendering Dinamis ---
  const embedUrl = getYoutubeEmbedUrl(content.contentUrl);

  const renderContent = () => {
    // Prioritas 1: Tampilkan video YouTube jika ada
    if (embedUrl) {
      return (
        <div className="aspect-video w-full">
          <iframe
            className="w-full h-full rounded-lg"
            src={embedUrl}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // Prioritas 2: Render berdasarkan tipe modul
    switch (content.type) {
      case "QUIZ":
        return <QuizPlayer quizData={content.quizData} />;
      case "SUBMISSION":
        return <SubmissionBox />;
      case "LIVE_SESSION":
        return (
          <a
            href={content.contentUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg">Gabung Sesi Live</Button>
          </a>
        );
      case "CONTENT":
      default:
        return (
          <div className="prose max-w-none dark:prose-invert">
            {content.contentText}
          </div>
        );
    }
  };

  return (
    <div className="p-2 md:p-6">
      <h1 className="text-3xl font-bold mb-6 pb-4 border-b">{content.title}</h1>
      {renderContent()}
    </div>
  );
}
