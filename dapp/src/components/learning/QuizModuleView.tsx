"use client";

import type { FullModuleData } from "@/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

type Question = {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
};

export function QuizModuleView({
  module,
  onQuizCompleted,
}: {
  module: FullModuleData;
  onQuizCompleted: () => void;
}) {
  const [questions] = useState((module.quiz?.questions as Question[]) || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;
    setIsAnswered(true);
    if (selectedAnswer === currentQuestion.correctAnswerIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-3xl">Kuis Selesai!</CardTitle>
            <CardDescription>Hasil Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-5xl font-bold">
              {Math.round((score / questions.length) * 100)}%
            </p>
            <p className="text-muted-foreground">
              Anda menjawab dengan benar {score} dari {questions.length}{" "}
              pertanyaan.
            </p>
            <Button onClick={onQuizCompleted} size="lg">
              Lanjutkan ke Modul Berikutnya
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion)
    return (
      <div className="p-8">
        Kuis tidak valid atau tidak memiliki pertanyaan.
      </div>
    );

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto">
      <p className="text-sm font-semibold text-primary mb-2">
        Kuis: {module.title}
      </p>
      <h2 className="text-3xl font-bold tracking-tight mb-1">
        {currentQuestion.questionText}
      </h2>
      <p className="text-muted-foreground mb-8">
        Pilih salah satu jawaban yang paling tepat.
      </p>

      <RadioGroup
        value={selectedAnswer !== null ? String(selectedAnswer) : undefined}
        onValueChange={(value) =>
          !isAnswered && setSelectedAnswer(Number(value))
        }
        className="space-y-4"
      >
        {currentQuestion.options.map((option, index) => {
          const isCorrect = index === currentQuestion.correctAnswerIndex;
          const isSelected = index === selectedAnswer;

          return (
            <div key={index}>
              <Label
                htmlFor={`option-${index}`}
                className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
                  isAnswered && isCorrect
                    ? "border-green-500 bg-green-500/10"
                    : isAnswered && isSelected && !isCorrect
                    ? "border-red-500 bg-red-500/10"
                    : "border-border hover:border-primary"
                }`}
              >
                <RadioGroupItem
                  value={String(index)}
                  id={`option-${index}`}
                  disabled={isAnswered}
                />
                <span className="flex-1 text-base">{option}</span>
                {isAnswered && isCorrect && (
                  <CheckCircle className="text-green-500" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="text-red-500" />
                )}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      <div className="mt-8 text-right">
        {isAnswered ? (
          <Button onClick={handleNextQuestion} size="lg">
            {currentQuestionIndex === questions.length - 1
              ? "Lihat Hasil"
              : "Lanjut"}
          </Button>
        ) : (
          <Button
            onClick={handleCheckAnswer}
            size="lg"
            disabled={selectedAnswer === null}
          >
            Periksa Jawaban
          </Button>
        )}
      </div>
    </div>
  );
}
