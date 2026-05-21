"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { useVoice } from "@/hooks/useVoice";
import { useInterviewStore } from "@/store/interviewStore";
import api from "@/lib/api";
import { ArrowLeft, Mic, MicOff, Volume2, Sparkles, AlertCircle, RefreshCw, ChevronRight, Award, Trophy, ListChecks } from "lucide-react";

export default function VoiceInterview() {
  const { planId } = useParams();
  const router = useRouter();

  const {
    transcript,
    setTranscript,
    isListening,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    browserSupportsSpeech
  } = useVoice();

  const {
    questions,
    answers,
    currentQuestionIndex,
    interviewId,
    score,
    feedback,
    isFinished,
    setInterviewSession,
    submitAnswer,
    nextQuestion,
    finishInterview,
    reset
  } = useInterviewStore();

  const [loading, setLoading] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [error, setError] = useState("");
  const [customTextAnswer, setCustomTextAnswer] = useState("");
  const [currentQuestionText, setCurrentQuestionText] = useState("");

  // Start interview session
  const handleStartInterview = async () => {
    setLoading(true);
    setError("");
    reset();
    try {
      const res = await api.post("/interviews", { plan_id: planId });
      setInterviewSession(res.data);
      setCurrentQuestionText(res.data.first_question);
      
      // Auto speak first question
      setTimeout(() => {
        speak(res.data.first_question, () => {
          // Auto trigger microphone once speech finishes
          startListening();
        });
      }, 500);
    } catch (e: any) {
      console.error("Failed to start interview:", e);
      setError("Failed to initialize interview. Ensure backend server is responsive.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleStartInterview();
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [planId]);

  // Sync transcript to scratch area
  useEffect(() => {
    if (transcript) {
      setCustomTextAnswer(transcript);
    }
  }, [transcript]);

  const handleSubmitAnswer = async () => {
    const finalAnswer = customTextAnswer.trim();
    if (!finalAnswer || answering) return;

    setAnswering(true);
    stopListening();
    stopSpeaking();
    
    try {
      const res = await api.post(`/interviews/${interviewId}/answer`, {
        answer: finalAnswer
      });

      submitAnswer(finalAnswer);
      setCustomTextAnswer("");
      setTranscript("");

      if (res.data.is_finished) {
        finishInterview(res.data.score, res.data.feedback);
      } else {
        nextQuestion();
        setCurrentQuestionText(res.data.next_question);
        
        // Speak next question
        speak(res.data.next_question, () => {
          startListening();
        });
      }
    } catch (e) {
      console.error("Failed to submit answer:", e);
      setError("Failed to grade this answer. Check server status.");
    } finally {
      setAnswering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center px-6">
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
          <h3 className="font-bold text-lg text-white">Assembling Oral Exam...</h3>
          <p className="text-slate-400 text-xs leading-relaxed animate-pulse">
            Gemini is compiling exactly 8 complex, personalized technical questions mapped to your study modules. Stand by...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Link href={`/plan/${planId}`} className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-extrabold text-sm text-white leading-tight">AI Vocal Examination</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-0.5">PrepStudio Oral Lab</p>
            </div>
          </div>

          {!isFinished && questions.length > 0 && (
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              Question {currentQuestionIndex + 1} of 8
            </div>
          )}
        </header>

        <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-10 flex flex-col justify-center">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start space-x-2 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isFinished ? (
            /* scorecard view */
            <div className="space-y-8 animate-fade-in">
              <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl backdrop-blur-sm text-center relative overflow-hidden shadow-2xl">
                {/* Background design glow */}
                <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />

                <div className="bg-indigo-500/10 text-indigo-400 p-4 rounded-full w-fit mx-auto mb-6">
                  <Trophy className="h-10 w-10 text-indigo-400" />
                </div>
                
                <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Examination Complete!</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Your spoken definitions were parsed, graded, and compiled by the Gemini evaluator agent.
                </p>

                <div className="my-10">
                  <div className="inline-flex flex-col items-center justify-center bg-slate-950 border border-slate-850 h-32 w-32 rounded-full ring-4 ring-indigo-500/20">
                    <span className="text-4xl font-extrabold text-white">{score}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Score</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left border-t border-slate-850 pt-8 mt-6">
                  <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl">
                    <h3 className="font-bold text-sm text-indigo-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                      <ListChecks className="h-4 w-4" />
                      <span>Conceptual Strengths</span>
                    </h3>
                    <div className="text-slate-300 text-xs space-y-2 leading-relaxed">
                      {feedback?.strengths ? (
                        feedback.strengths.split("\n").map((line: string, i: number) => (
                          <p key={i}>{line}</p>
                        ))
                      ) : (
                        <p>No strengths listed.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl">
                    <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                      <Sparkles className="h-4 w-4" />
                      <span>Areas for Improvement</span>
                    </h3>
                    <div className="text-slate-300 text-xs space-y-2 leading-relaxed">
                      {feedback?.improvements ? (
                        feedback.improvements.split("\n").map((line: string, i: number) => (
                          <p key={i}>{line}</p>
                        ))
                      ) : (
                        <p>No suggestions listed.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Link
                  href={`/plan/${planId}`}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-xl font-bold transition shadow-lg shadow-indigo-600/10 flex items-center space-x-2"
                >
                  <span>Return to Study Track</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={handleStartInterview}
                  className="border border-slate-800 hover:bg-slate-800/80 text-slate-300 px-6 py-4 rounded-xl font-semibold transition"
                >
                  Retake Examination
                </button>
              </div>
            </div>
          ) : (
            /* interactive exam track */
            <div className="space-y-8 flex-grow flex flex-col justify-between">
              
              {/* Question Screen Card */}
              <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-4 left-4 flex items-center space-x-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>AI Oral Examiner</span>
                </div>

                <div className="my-8 max-w-2xl">
                  <p className="text-lg md:text-xl font-semibold text-slate-200 leading-relaxed italic">
                    "{currentQuestionText || "Pre-loading question details..."}"
                  </p>
                </div>

                {/* Speech audio speaking wave simulation */}
                {!isListening && (
                  <div className="flex space-x-1 items-center h-4">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <span key={bar} className="w-1 bg-indigo-500 rounded-full h-full animate-pulse" />
                    ))}
                  </div>
                )}
              </div>

              {/* Visual Microphone Visualizer Deck */}
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-full blur-xl opacity-30 bg-indigo-500 transition duration-500 ${
                      isListening ? "scale-125 opacity-55 animate-pulse" : "scale-100"
                    }`}
                  />
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={answering}
                    className={`relative z-10 p-8 rounded-full border shadow-2xl transition duration-300 ${
                      isListening
                        ? "bg-red-500 border-red-400 text-white"
                        : "bg-indigo-600 border-indigo-500 hover:bg-indigo-500 text-white"
                    }`}
                  >
                    {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                  </button>
                </div>

                {/* Animated Speech Recognition Waveform */}
                {isListening && (
                  <div className="flex items-center space-x-1 h-6">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-400 rounded-full h-full wave-bar"
                        style={{ height: `${Math.floor(Math.random() * 80) + 20}%` }}
                      />
                    ))}
                  </div>
                )}

                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isListening ? "System is listening to your answer..." : "Microphone Idle — Click to speak"}
                </span>

                {!browserSupportsSpeech && (
                  <p className="text-[10px] text-amber-400 bg-amber-400/5 px-3 py-1 rounded border border-amber-400/10">
                    ⚠️ Speech recognition not supported in this browser. Please type your answer below instead.
                  </p>
                )}
              </div>

              {/* Text fallback submission dashboard */}
              <div className="space-y-4 max-w-2xl w-full mx-auto">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                  <span>Answer Editor</span>
                  <span>Supports Keyboard Input</span>
                </div>
                <textarea
                  value={customTextAnswer}
                  onChange={(e) => setCustomTextAnswer(e.target.value)}
                  disabled={answering}
                  placeholder="Your spoken response will translate here automatically, or you can type here directly..."
                  className="bg-slate-950 border border-slate-850 rounded-2xl p-5 w-full h-32 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition leading-relaxed"
                />

                <button
                  onClick={handleSubmitAnswer}
                  disabled={answering || !customTextAnswer.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-xl py-4 w-full font-semibold transition text-sm flex items-center justify-center space-x-2"
                >
                  {answering ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" />
                      <span>Evaluating answer with AI agent...</span>
                    </>
                  ) : (
                    <span>Submit & Get Next Question</span>
                  )}
                </button>
              </div>

            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
