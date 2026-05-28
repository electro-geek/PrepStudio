"use client";

import { useConversation } from "@11labs/react";
import { useRef, useState } from "react";

export interface TranscriptEntry {
  source: "ai" | "user";
  message: string;
}

interface UseElevenLabsConversationOptions {
  onInterviewComplete?: (transcript: string) => void;
}

export function useElevenLabsConversation(opts: UseElevenLabsConversationOptions = {}) {
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptEntry[]>([]);
  const [error, setError] = useState<string>("");
  const completeFiredRef = useRef(false);

  const conversation = useConversation({
    onMessage: ({ message, source }: { message: string; source: "ai" | "user" }) => {
      const entry: TranscriptEntry = { source, message };
      transcriptRef.current = [...transcriptRef.current, entry];
      setLiveTranscript([...transcriptRef.current]);

      if (
        source === "ai" &&
        message.includes("INTERVIEW_COMPLETE") &&
        !completeFiredRef.current
      ) {
        completeFiredRef.current = true;
        const fullTranscript = transcriptRef.current
          .map((e) => `${e.source === "ai" ? "Interviewer" : "Candidate"}: ${e.message}`)
          .join("\n\n");
        opts.onInterviewComplete?.(fullTranscript);
      }
    },
    onError: (msg: string) => {
      setError(typeof msg === "string" ? msg : "Connection error. Check microphone permissions.");
    },
  });

  const startWithSignedUrl = async (signedUrl: string) => {
    transcriptRef.current = [];
    completeFiredRef.current = false;
    setLiveTranscript([]);
    setError("");
    await conversation.startSession({ signedUrl });
  };

  const endSession = async () => {
    await conversation.endSession();
  };

  const buildTranscript = (): string =>
    transcriptRef.current
      .map((e) => `${e.source === "ai" ? "Interviewer" : "Candidate"}: ${e.message}`)
      .join("\n\n");

  return {
    startWithSignedUrl,
    endSession,
    buildTranscript,
    liveTranscript,
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    getOutputVolume: conversation.getOutputVolume,
    error,
    setError,
  };
}
