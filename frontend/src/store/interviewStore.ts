import { create } from "zustand";

interface InterviewState {
  questions: string[];
  answers: string[];
  currentQuestionIndex: number;
  interviewId: string | null;
  score: number | null;
  feedback: { strengths?: string; improvements?: string } | null;
  isFinished: boolean;
  
  setInterviewSession: (session: {
    id: string;
    questions: string[];
    answers?: string[];
    score?: number | null;
    feedback?: any | null;
  }) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  finishInterview: (score: number, feedback: any) => void;
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  interviewId: null,
  score: null,
  feedback: null,
  isFinished: false,

  setInterviewSession: (session) => set({
    interviewId: session.id,
    questions: session.questions,
    answers: session.answers || [],
    currentQuestionIndex: session.answers ? session.answers.length : 0,
    score: session.score || null,
    feedback: session.feedback || null,
    isFinished: session.score !== null
  }),

  submitAnswer: (answer) => set((state) => {
    const updatedAnswers = [...state.answers, answer];
    return {
      answers: updatedAnswers,
    };
  }),

  nextQuestion: () => set((state) => ({
    currentQuestionIndex: state.currentQuestionIndex + 1
  })),

  finishInterview: (score, feedback) => set({
    score,
    feedback,
    isFinished: true
  }),

  reset: () => set({
    questions: [],
    answers: [],
    currentQuestionIndex: 0,
    interviewId: null,
    score: null,
    feedback: null,
    isFinished: false
  })
}));
