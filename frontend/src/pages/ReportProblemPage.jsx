import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clipboard,
  ClipboardCheck,
  FileImage,
  LoaderCircle,
  MapPin,
  Mic,
  MicOff,
  Paperclip,
  SendHorizontal,
  ShieldAlert,
  Upload,
  Video,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CitizenLayout from "../components/citizen/CitizenLayout";
import api from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { readReports, upsertReport } from "../utils/citizenStorage";

const EMPTY_AI_MESSAGE = {
  role: "assistant",
  content:
    "Tell me about the civic problem you are facing. I'll help you prepare the complaint.",
  timestamp: new Date().toISOString(),
};

function getStoredMessageText(message) {
  if (message.role !== "assistant") {
    return message.content;
  }

  try {
    const response = JSON.parse(message.content);

    if (response.question) {
      return response.question;
    }

    if (response.status === "READY") {
      return "Your problem details are ready for review.";
    }

    if (response.status === "POSSIBLE_DUPLICATE") {
      return "A similar problem has already been reported. Please review it below.";
    }

    if (response.status === "CANCELLED") {
      return "The report process was cancelled.";
    }

    if (response.status === "IRRELEVANT") {
      return "This does not appear to be a civic problem report.";
    }
  } catch {
    return message.content;
  }

  return message.content;
}

function ReportProblemPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language, t } = useLanguage();
  const editReportId = searchParams.get("reportId");

  const textareaRef = useRef(null);
  const chatRef = useRef(null);
  const recognitionRef = useRef(null);

  // ======================================================
  // CONVERSATION
  // ======================================================

  const [conversationId, setConversationId] = useState(
    sessionStorage.getItem("citizenConversationId") || ""
  );

  const [messages, setMessages] = useState(() => {
    const savedConversationId =
      sessionStorage.getItem("citizenConversationId") || "";

    // No active conversation = fresh chat
    if (!savedConversationId) {
      return [
        {
          ...EMPTY_AI_MESSAGE,
          timestamp: new Date().toISOString(),
        },
      ];
    }

    const saved = sessionStorage.getItem(
      `citizenMessages_${savedConversationId}`
    );

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          {
            ...EMPTY_AI_MESSAGE,
            timestamp: new Date().toISOString(),
          },
        ];
      }
    }

    return [
      {
        ...EMPTY_AI_MESSAGE,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState("");

  // ======================================================
  // STATES
  // ======================================================

  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const [draftReport, setDraftReport] = useState(null);

  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [submitLoading, setSubmitLoading] = useState(false);

  const [supportedReport, setSupportedReport] = useState(null);
  const [supportLoading, setSupportLoading] = useState(false);

  const [copiedReportId, setCopiedReportId] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  // ======================================================
  // RESTORE CONVERSATION
  // ======================================================

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    let active = true;

    const restoreConversation = async () => {
      try {
        const response = await api.get(
          `/citizen/report/conversation/${encodeURIComponent(
            conversationId
          )}`
        );

        const data = response.data || {};

        if (!active) {
          return;
        }

        // ----------------------------------------------
        // COMPLETED CONVERSATION
        // ----------------------------------------------

        if (data.status === "COMPLETED") {
          sessionStorage.removeItem("citizenConversationId");
          sessionStorage.removeItem(
            `citizenMessages_${conversationId}`
          );

          setConversationId("");

          setMessages([
            {
              ...EMPTY_AI_MESSAGE,
              timestamp: new Date().toISOString(),
            },
          ]);

          setDraftReport(null);
          setSupportedReport(null);

          return;
        }

        // ----------------------------------------------
        // RESTORE MESSAGES
        // ----------------------------------------------

        if (
          Array.isArray(data.messages) &&
          data.messages.length > 0
        ) {
          const restoredMessages = data.messages.map(
            (message) => ({
              role: message.role,
              content: getStoredMessageText(message),
              timestamp: message.createdAt,
            })
          );

          setMessages((currentMessages) => {
            const mergedMessages = [
              ...restoredMessages,
              ...currentMessages,
            ];

            const uniqueMessages =
              mergedMessages.filter(
                (message, index, messages) =>
                  messages.findIndex(
                    (candidate) =>
                      candidate.role === message.role &&
                      candidate.content ===
                        message.content
                  ) === index
              );

            return uniqueMessages.sort(
              (first, second) =>
                new Date(first.timestamp || 0) -
                new Date(second.timestamp || 0)
            );
          });
        }

        // ----------------------------------------------
        // RESTORE DRAFT
        // ----------------------------------------------

        if (data.report?.status === "DRAFT") {
          setDraftReport({
            ...data.report,
            location: {
              address: data.report.address || null,
              city: data.report.city || null,
              district: data.report.district || null,
              state: data.report.state || null,
              pincode: data.report.pincode || null,
            },
            attachments:
              data.report.media?.length || 0,
          });
        }

        // ----------------------------------------------
        // RESTORE DUPLICATE
        // ----------------------------------------------

        const latestStructuredResponse =
          [...(data.messages || [])]
            .reverse()
            .find(
              (message) =>
                message.role === "assistant"
            );

        if (latestStructuredResponse) {
          try {
            const structuredResponse = JSON.parse(
              latestStructuredResponse.content
            );

            const match =
              structuredResponse.duplicateCheck
                ?.matches?.[0];

            if (
              structuredResponse.status ===
                "POSSIBLE_DUPLICATE" &&
              match
            ) {
              setSupportedReport({
                ...match,
                id:
                  match.id ||
                  match.reportId,
                reportId:
                  match.reportId ||
                  match.id,
              });
            }
          } catch {
            // Older assistant messages may contain plain text.
          }
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          console.error(
            "Restore report conversation error:",
            err
          );
        }
      }
    };

    restoreConversation();

    return () => {
      active = false;
    };
  }, [conversationId]);

  // ======================================================
  // LOAD DRAFT
  // ======================================================

  useEffect(() => {
    if (!editReportId) {
      return undefined;
    }

    let active = true;

    const loadDraft = async () => {
      try {
        const response = await api.get(
          `/reports/${encodeURIComponent(editReportId)}`
        );

        const report =
          response.data?.report ||
          response.data;

        if (!active || report?.status !== "DRAFT") {
          return;
        }

        const nextConversationId =
          report.conversationId || "";

        setConversationId(nextConversationId);

        if (nextConversationId) {
          sessionStorage.setItem(
            "citizenConversationId",
            nextConversationId
          );
        }

        setDraftReport({
          ...report,
          location: {
            address: report.address || null,
            city: report.city || null,
            district: report.district || null,
            state: report.state || null,
            pincode: report.pincode || null,
          },
          attachments:
            report.media?.length || 0,
        });
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load the draft report."
          );
        }
      }
    };

    loadDraft();

    return () => {
      active = false;
    };
  }, [editReportId]);

  // ======================================================
  // AUTO SCROLL
  // ======================================================

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop =
        chatRef.current.scrollHeight;
    }
  }, [
    messages,
    isSending,
    draftReport,
    supportedReport,
  ]);

  // ======================================================
  // SAVE CONVERSATION LOCALLY
  // ======================================================

  useEffect(() => {
    // Do not save messages without a conversation
    if (!conversationId) {
      return;
    }

    sessionStorage.setItem(
      `citizenMessages_${conversationId}`,
      JSON.stringify(messages)
    );
  }, [messages, conversationId]);

  // ======================================================
  // COPY REPORT ID
  // ======================================================

  const handleCopyReportId = async (reportId) => {
    if (!reportId) return;

    try {
      await navigator.clipboard.writeText(reportId);

      setCopiedReportId(true);

      setTimeout(() => {
        setCopiedReportId(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Unable to copy report ID:",
        error
      );
    }
  };

  // ======================================================
  // SEND CHAT MESSAGE
  // ======================================================

  const handleSubmit = async () => {
    const message = inputValue.trim();

    if (!message) return;

    if (isSending) return;

    setError("");

    const newUserMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [
      ...prev,
      newUserMessage,
    ]);

    setInputValue("");
    setIsSending(true);

    try {
      // ----------------------------------------------
      // SEND MESSAGE
      // ----------------------------------------------

      const response = await api.post(
        "/citizen/report",
        {
          message,
          conversationId:
            conversationId || undefined,
        }
      );

      const data = response.data || {};

      // ----------------------------------------------
      // IMPORTANT:
      // BACKEND MUST RETURN NEW CONVERSATION ID
      // ----------------------------------------------

      const nextConversationId =
        data.conversationId;

      if (!nextConversationId) {
        throw new Error(
          "Backend did not return a conversationId."
        );
      }

      // ----------------------------------------------
      // SAVE CONVERSATION ID
      // ----------------------------------------------

      setConversationId(
        nextConversationId
      );

      sessionStorage.setItem(
        "citizenConversationId",
        nextConversationId
      );

      // ----------------------------------------------
      // AI RESPONSE
      // ----------------------------------------------

      let aiMessage =
        data.question ||
        data.message ||
        data.response ||
        "";

      // ----------------------------------------------
      // DUPLICATE MESSAGE
      // ----------------------------------------------

      if (
        data.status ===
          "POSSIBLE_DUPLICATE" &&
        !aiMessage
      ) {
        aiMessage =
          "A similar problem has already been reported. Please review the existing report below.";
      }

      // ----------------------------------------------
      // SAVE AI MESSAGE
      // ----------------------------------------------

      if (aiMessage) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: aiMessage,
            status: data.status,
            problem: data.problem,
            reportId: data.reportId,
            duplicateCheck:
              data.duplicateCheck,
            timestamp:
              new Date().toISOString(),
          },
        ]);
      }

      // ==================================================
      // READY → CREATE DRAFT UI
      // ==================================================

      if (
        data.status === "READY" &&
        data.reportId &&
        data.problem
      ) {
        const nextDraft = {
          id: data.reportId,

          title:
            data.problem.title ||
            "Untitled report",

          description:
            data.problem.description ||
            "",

          category:
            data.problem.category ||
            "General",

          priority:
            data.problem.priority ||
            "MEDIUM",

          location:
            data.problem.location || {},

          attachments: 0,

          createdAt:
            new Date().toISOString(),

          status: "DRAFT",
        };

        // ----------------------------------------------
        // SAVE LOCAL DRAFT
        // ----------------------------------------------

        upsertReport({
          ...nextDraft,
          citizenId: "local",
        });

        setDraftReport(nextDraft);

        setAttachments([]);

        setError("");
      }

      // ==================================================
      // POSSIBLE DUPLICATE
      // ==================================================

      if (
        data.status ===
        "POSSIBLE_DUPLICATE"
      ) {
        const match =
          data.similarReport ||
          data.duplicateCheck
            ?.matches?.[0];

        setDraftReport(null);

        if (match) {
          setSupportedReport({
            ...match,

            id:
              match.id ||
              match.reportId,

            reportId:
              match.reportId ||
              match.id,

            score:
              typeof match.score ===
              "number"
                ? match.score
                : null,
          });
        } else {
          setSupportedReport(null);
        }
      }

      // ==================================================
      // IRRELEVANT
      // ==================================================

      if (
        data.status === "IRRELEVANT"
      ) {
        setDraftReport(null);
        setSupportedReport(null);
      }

      // ==================================================
      // CANCELLED
      // ==================================================

      if (
        data.status === "CANCELLED"
      ) {
        setDraftReport(null);
        setSupportedReport(null);
      }
    } catch (err) {
      console.error(
        "Send report message error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I couldn't process that message. Please try again.",
          timestamp:
            new Date().toISOString(),
        },
      ]);
    } finally {
      setIsSending(false);

      textareaRef.current?.focus();
    }
  };

  // ======================================================
  // ENTER KEY
  // ======================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError(
        language === "hi"
          ? "आपके ब्राउज़र में आवाज़ पहचान उपलब्ध नहीं है। Chrome या Edge का उपयोग करें।"
          : "Voice input is not supported in this browser. Please use Chrome or Edge."
      );

      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      language === "hi"
        ? "hi-IN"
        : "en-IN";

    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current =
      recognition;

    recognition.onstart = () => {
      setVoiceError("");
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(
        event.results
      )
        .slice(event.resultIndex)
        .filter(
          (result) => result.isFinal
        )
        .map(
          (result) =>
            result[0]?.transcript || ""
        )
        .join(" ")
        .trim();

      if (transcript) {
        setInputValue((current) =>
          current.trim()
            ? `${current.trim()} ${transcript}`
            : transcript
        );
      }
    };

    recognition.onerror = (event) => {
      const message = {
        "not-allowed":
          language === "hi"
            ? "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र में माइक्रोफ़ोन Allow करें।"
            : "Microphone permission was denied. Allow microphone access in your browser.",

        "service-not-allowed":
          language === "hi"
            ? "ब्राउज़र की speech service उपलब्ध नहीं है। Chrome या Edge आज़माएं।"
            : "The browser speech service is unavailable. Please try Chrome or Edge.",

        "no-speech":
          language === "hi"
            ? "कोई आवाज़ नहीं मिली। माइक्रोफ़ोन के पास बोलकर फिर से प्रयास करें।"
            : "No speech was detected. Speak near the microphone and try again.",
      }[event.error];

      setVoiceError(
        message ||
          (language === "hi"
            ? "आवाज़ पहचान में समस्या हुई। कृपया फिर से प्रयास करें।"
            : "Voice recognition failed. Please try again.")
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (error) {
      recognitionRef.current = null;
      setIsListening(false);

      setVoiceError(
        language === "hi"
          ? "माइक्रोफ़ोन शुरू नहीं हो सका। कृपया फिर से प्रयास करें।"
          : "The microphone could not start. Please try again."
      );
    }
  };

  useEffect(
    () => () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    },
    []
  );

  // ======================================================
  // MEDIA UPLOAD
  // ======================================================

  const handleFiles = async (event) => {
    const selectedFiles = Array.from(
      event.target.files || []
    );

    event.target.value = "";

    if (!draftReport?.id) {
      setError(
        "Please complete the problem details before adding media."
      );

      return;
    }

    if (!selectedFiles.length) return;

    // ----------------------------------------------
    // VALIDATE FILES
    // ----------------------------------------------

    const validFiles =
      selectedFiles.filter(
        (file) =>
          file.type.startsWith("image/") ||
          file.type.startsWith("video/")
      );

    if (!validFiles.length) {
      setError(
        "Please select image or video files."
      );

      return;
    }

    setError("");
    setUploading(true);

    // ----------------------------------------------
    // CREATE LOCAL PREVIEWS
    // ----------------------------------------------

    const mapped = validFiles.map(
      (file) => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,

        file,

        name: file.name,

        type: file.type.startsWith(
          "video/"
        )
          ? "video"
          : "image",

        preview:
          file.type.startsWith(
            "image/"
          )
            ? URL.createObjectURL(file)
            : "",

        uploading: true,
      })
    );

    setAttachments((prev) => [
      ...prev,
      ...mapped,
    ]);

    try {
      // ----------------------------------------------
      // UPLOAD TO BACKEND
      // ----------------------------------------------

      const formData = new FormData();

      validFiles.forEach((file) => {
        formData.append("files", file);
      });

      await api.post(
        `/citizen/${draftReport.id}/media`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      // ----------------------------------------------
      // MARK UPLOAD COMPLETE
      // ----------------------------------------------

      setAttachments((prev) =>
        prev.map((attachment) => ({
          ...attachment,
          uploading: false,
        }))
      );

      setDraftReport((prev) =>
        prev
          ? {
              ...prev,
              attachments:
                prev.attachments +
                validFiles.length,
            }
          : prev
      );
    } catch (err) {
      console.error(
        "Media upload error:",
        err
      );

      const failedIds = mapped.map(
        (item) => item.id
      );

      setAttachments((prev) =>
        prev.filter(
          (item) =>
            !failedIds.includes(
              item.id
            )
        )
      );

      setError(
        err.response?.data?.message ||
          "Unable to upload media."
      );
    } finally {
      setUploading(false);
    }
  };

  // ======================================================
  // REMOVE MEDIA PREVIEW
  // ======================================================

  const removeAttachment = (id) => {
    setAttachments((prev) =>
      prev.filter(
        (attachment) =>
          attachment.id !== id
      )
    );
  };

  // ======================================================
  // SUPPORT EXISTING REPORT
  // ======================================================

  const handleSupport = async (
    reportId
  ) => {
    if (!reportId) return;

    try {
      setSupportLoading(true);
      setError("");

      const response = await api.post(
        `/reports/${reportId}/support`
      );

      const supported =
        response.data?.supportedByMe ||
        response.data?.reportId;

      if (supported) {
        setSupportedReport((prev) =>
          prev
            ? {
                ...prev,
                supportedByMe: true,
              }
            : prev
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to support this problem right now."
      );
    } finally {
      setSupportLoading(false);
    }
  };

  // ======================================================
  // DIFFERENT PROBLEM
  // ======================================================

  const handleDifferentProblem = () => {
    setSupportedReport(null);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",

        content:
          "Please tell me what makes your problem different, such as the exact location, duration, or impact.",

        timestamp:
          new Date().toISOString(),
      },
    ]);

    textareaRef.current?.focus();
  };

  // ======================================================
  // SUBMIT FINAL REPORT
  // ======================================================

  const handleSubmitDraft = async () => {
    if (!draftReport?.id) return;

    try {
      setSubmitLoading(true);
      setError("");

      // ----------------------------------------------
      // SAVE OLD CONVERSATION ID
      // ----------------------------------------------

      const oldConversationId =
        conversationId;

      // ----------------------------------------------
      // SUBMIT DRAFT
      // ----------------------------------------------

      const response = await api.post(
        `/citizen/report/${draftReport.id}/submit`
      );

      const submitted =
        response.data?.report || {
          id: draftReport.id,
        };

      // ----------------------------------------------
      // UPDATE LOCAL REPORT
      // ----------------------------------------------

      const localReports =
        readReports();

      const updatedReports =
        localReports.map((report) =>
          report.id === submitted.id
            ? {
                ...report,
                ...submitted,
                status: "SUBMITTED",
              }
            : report
        );

      localStorage.setItem(
        "janSamadhan_reports",
        JSON.stringify(
          updatedReports
        )
      );

      // ----------------------------------------------
      // CLEAR OLD CONVERSATION
      // ----------------------------------------------

      sessionStorage.removeItem(
        "citizenConversationId"
      );

      if (oldConversationId) {
        sessionStorage.removeItem(
          `citizenMessages_${oldConversationId}`
        );
      }

      // Remove old default cache
      sessionStorage.removeItem(
        "citizenMessages_default"
      );

      // ----------------------------------------------
      // RESET CHAT
      // ----------------------------------------------

      setConversationId("");

      setMessages([
        {
          ...EMPTY_AI_MESSAGE,
          timestamp:
            new Date().toISOString(),
        },
      ]);

      setDraftReport(null);
      setAttachments([]);
      setSupportedReport(null);
      setInputValue("");
      setError("");

      // ----------------------------------------------
      // GO TO TRACKING PAGE
      // ----------------------------------------------

      navigate(
        `/citizen/problems/${submitted.id}`
      );
    } catch (err) {
      console.error(
        "Submit report error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to submit the report right now."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // ======================================================
  // LOCATION TEXT
  // ======================================================

  const getLocationText = (
    location
  ) => {
    if (!location) {
      return "Location not provided";
    }

    return [
      location.address,
      location.city,
      location.district,
      location.state,
      location.pincode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <CitizenLayout
      title={
        t.citizen?.report?.title ||
        "Report a Problem"
      }
    >
      <div className="mx-auto w-full max-w-6xl">

        {/* ==================================================
            MAIN CHAT CARD
        ================================================== */}

        <div className="overflow-hidden border border-slate-200 border-t-4 border-t-emerald-700 bg-white shadow-sm">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">

            <div className="flex items-center justify-between gap-4">

              <div className="flex min-w-0 items-center gap-3">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-emerald-100 text-emerald-800">
                  <ShieldAlert size={22} />
                </div>

                <div className="min-w-0">

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                    Citizen Complaint Intake
                  </p>

                  <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl">
                    {t.citizen?.report?.title ||
                      "Report a Problem"}
                  </h2>

                </div>

              </div>

              {/* CURRENT CONVERSATION */}

              {conversationId &&
                !draftReport && (
                  <div className="hidden rounded-xl bg-slate-50 px-3 py-2 text-right sm:block">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Conversation
                    </p>

                    <p className="max-w-[130px] truncate font-mono text-xs text-slate-600">
                      {conversationId}
                    </p>

                  </div>
                )}

            </div>

          </div>

          {/* ==================================================
              CHAT AREA
          ================================================== */}

          <div
            ref={chatRef}
            className="h-[58vh] min-h-[420px] space-y-5 overflow-y-auto border-t border-slate-200 bg-[#f8faf9] p-4 sm:p-6"
          >

            {/* MESSAGES */}

            {messages.map(
              (message, index) => {
                const isUser =
                  message.role ===
                  "user";

                return (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[78%] ${
                        isUser
                          ? "rounded-br-md bg-emerald-700 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                      }`}
                    >

                      <p
                        className={`whitespace-pre-wrap text-sm leading-6 ${
                          isUser
                            ? "text-white"
                            : "text-slate-700"
                        }`}
                      >
                        {message.content}
                      </p>

                      {/* READY MINI CARD */}

                      {!isUser &&
                        message.status ===
                          "READY" &&
                        message.reportId && (
                          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                            <div className="flex items-center gap-2 text-emerald-700">

                              <CheckCircle2
                                size={18}
                              />

                              <span className="font-bold">
                                Report details are ready
                              </span>

                            </div>

                            <div className="mt-3 grid gap-2 text-sm text-slate-700">

                              <p>
                                <span className="font-semibold">
                                  Title:
                                </span>{" "}
                                {message.problem?.title ||
                                  "Untitled"}
                              </p>

                              <p>
                                <span className="font-semibold">
                                  Category:
                                </span>{" "}
                                {message.problem?.category ||
                                  "General"}
                              </p>

                              <p>
                                <span className="font-semibold">
                                  Priority:
                                </span>{" "}
                                {message.problem?.priority ||
                                  "MEDIUM"}
                              </p>

                            </div>

                          </div>
                        )}

                    </div>

                  </div>
                );
              }
            )}

            {/* AI LOADING */}

            {isSending && (
              <div className="flex justify-start">

                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">

                  <LoaderCircle
                    className="animate-spin"
                    size={16}
                  />

                  <span>
                    {t.citizen?.report?.loading ||
                      "AI is thinking..."}
                  </span>

                </div>

              </div>
            )}

            {/* ERROR */}

            {error && (
              <div className="flex justify-center">

                <div className="flex max-w-xl items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">

                  <AlertCircle
                    className="mt-0.5 shrink-0"
                    size={16}
                  />

                  <span>
                    {error}
                  </span>

                </div>

              </div>
            )}

            {/* ==================================================
                FINAL DRAFT CARD
            ================================================== */}

            {draftReport && (
              <div className="flex justify-center">

                <div className="w-full max-w-2xl border border-emerald-200 border-l-4 border-l-emerald-700 bg-white p-4 shadow-sm sm:p-6">

                  {/* HEADER */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                    <div className="flex items-start gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-emerald-100 text-emerald-800">
                        <CheckCircle2 size={22} />
                      </div>

                      <div>

                        <h3 className="text-lg font-bold text-slate-900">
                          Review Your Report
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Your problem has been understood. Review it before submitting.
                        </p>

                      </div>

                    </div>

                    <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                      DRAFT
                    </span>

                  </div>

                  {/* REPORT ID */}

                  <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4">

                    <div className="flex items-center justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-blue-600">
                          Your Report ID
                        </p>

                        <p className="mt-1 break-all font-mono text-sm font-bold text-blue-900 sm:text-base">
                          {draftReport.id}
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopyReportId(
                            draftReport.id
                          )
                        }
                        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >

                        {copiedReportId ? (
                          <>
                            <ClipboardCheck
                              size={15}
                            />
                            Copied
                          </>
                        ) : (
                          <>
                            <Clipboard
                              size={15}
                            />
                            Copy ID
                          </>
                        )}

                      </button>

                    </div>

                    <p className="mt-2 text-xs text-blue-700">
                      Save this ID to track your problem later.
                    </p>

                  </div>

                  {/* REPORT DETAILS */}

                  <div className="mt-5 space-y-4">

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Title
                      </p>

                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {draftReport.title}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                        Description
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-700">
                        {draftReport.description ||
                          "No description provided."}
                      </p>

                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">

                      <div className="rounded-2xl bg-slate-50 p-3">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Category
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {draftReport.category}
                        </p>

                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3">

                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Priority
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {draftReport.priority}
                        </p>

                      </div>

                    </div>

                    {/* LOCATION */}

                    <div className="rounded-2xl bg-slate-50 p-3">

                      <div className="flex items-start gap-2">

                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />

                        <div>

                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Problem Location
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {getLocationText(
                              draftReport.location
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* MEDIA UPLOAD */}

                  <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                          <Paperclip size={18} />
                        </div>

                        <div>

                          <p className="text-sm font-bold text-slate-800">
                            Add Photos or Videos
                          </p>

                          <p className="text-xs text-slate-500">
                            Optional evidence for your report
                          </p>

                        </div>

                      </div>

                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">

                        {uploading ? (
                          <LoaderCircle
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <Upload size={16} />
                        )}

                        {uploading
                          ? "Uploading..."
                          : "Add Media"}

                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*"
                          className="hidden"
                          onChange={handleFiles}
                          disabled={
                            uploading ||
                            submitLoading
                          }
                        />

                      </label>

                    </div>

                    {/* MEDIA PREVIEWS */}

                    {attachments.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">

                        {attachments.map(
                          (attachment) => (
                            <div
                              key={
                                attachment.id
                              }
                              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                            >

                              {attachment.type ===
                                "image" &&
                              attachment.preview ? (
                                <img
                                  src={
                                    attachment.preview
                                  }
                                  alt={
                                    attachment.name
                                  }
                                  className="h-28 w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-28 items-center justify-center bg-slate-100">

                                  <Video
                                    size={28}
                                    className="text-slate-500"
                                  />

                                </div>
                              )}

                              {/* UPLOADING */}

                              {attachment.uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40">

                                  <LoaderCircle
                                    size={22}
                                    className="animate-spin text-white"
                                  />

                                </div>
                              )}

                              {/* REMOVE */}

                              {!attachment.uploading && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeAttachment(
                                      attachment.id
                                    )
                                  }
                                  className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
                                >
                                  <X size={13} />
                                </button>
                              )}

                              <div className="truncate px-2 py-2 text-xs text-slate-600">
                                {attachment.name}
                              </div>

                            </div>
                          )
                        )}

                      </div>
                    )}

                    {attachments.length > 0 && (
                      <p className="mt-3 text-xs font-medium text-emerald-700">
                        ✓ {attachments.length} media file
                        {attachments.length > 1
                          ? "s"
                          : ""}{" "}
                        attached
                      </p>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={() => {
                        setDraftReport(null);
                        setAttachments([]);
                        textareaRef.current?.focus();
                      }}
                      disabled={
                        submitLoading
                      }
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Continue Editing
                    </button>

                    <button
                      type="button"
                      onClick={
                        handleSubmitDraft
                      }
                      disabled={
                        submitLoading ||
                        uploading ||
                        attachments.some(
                          (item) =>
                            item.uploading
                        )
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {submitLoading ? (
                        <>
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={17}
                          />
                          Submit Report
                        </>
                      )}

                    </button>

                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                DUPLICATE REPORT CARD
            ================================================== */}

            {supportedReport && (
              <div className="flex justify-center">

                <div className="w-full max-w-2xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50 p-4 shadow-sm sm:p-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <ShieldAlert size={22} />
                    </div>

                    <div>

                      <h3 className="text-lg font-bold text-amber-900">
                        Similar Problem Found
                      </h3>

                      <p className="mt-1 text-sm text-amber-700">
                        A similar civic problem has already been reported.
                      </p>

                    </div>

                  </div>

                  {/* EXISTING REPORT */}

                  <div className="mt-5 rounded-2xl border border-amber-200 bg-white p-4">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-base font-bold text-slate-900">
                          {supportedReport.title ||
                            "Existing Report"}
                        </p>

                        <div className="mt-2 space-y-2 text-sm text-slate-600">

                          {supportedReport.category && (
                            <p>
                              <span className="font-semibold">
                                Category:
                              </span>{" "}
                              {supportedReport.category}
                            </p>
                          )}

                          {supportedReport.district && (
                            <p>
                              <span className="font-semibold">
                                District:
                              </span>{" "}
                              {supportedReport.district}
                            </p>
                          )}

                          {[
                            supportedReport.address,
                            supportedReport.city,
                            supportedReport.district,
                            supportedReport.state,
                            supportedReport.pincode,
                          ].some(Boolean) && (
                            <p className="flex items-start gap-1">

                              <MapPin
                                size={15}
                                className="mt-0.5 shrink-0 text-emerald-700"
                              />

                              <span>

                                <span className="font-semibold">
                                  Location:
                                </span>{" "}

                                {[
                                  supportedReport.address,
                                  supportedReport.city,
                                  supportedReport.district,
                                  supportedReport.state,
                                  supportedReport.pincode,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}

                              </span>

                            </p>
                          )}

                          {supportedReport.status && (
                            <p>
                              <span className="font-semibold">
                                Status:
                              </span>{" "}
                              {String(
                                supportedReport.status
                              ).replace(
                                /_/g,
                                " "
                              )}
                            </p>
                          )}

                        </div>

                      </div>

                      {/* SCORE */}

                      {typeof supportedReport.score ===
                        "number" && (
                        <div className="shrink-0 rounded-xl bg-amber-100 px-3 py-2 text-center">

                          <p className="text-[10px] font-bold uppercase text-amber-600">
                            Similarity
                          </p>

                          <p className="text-lg font-bold text-amber-900">
                            {(
                              supportedReport.score *
                              100
                            ).toFixed(0)}
                            %
                          </p>

                        </div>
                      )}

                    </div>

                    {/* REPORT ID */}

                    {(supportedReport.reportId ||
                      supportedReport.id) && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">

                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Existing Report ID
                        </p>

                        <p className="mt-1 break-all font-mono text-sm font-bold text-slate-700">
                          {supportedReport.reportId ||
                            supportedReport.id}
                        </p>

                      </div>
                    )}

                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">

                    <button
                      type="button"
                      onClick={() =>
                        handleSupport(
                          supportedReport.reportId ||
                            supportedReport.id
                        )
                      }
                      disabled={
                        supportLoading ||
                        supportedReport.supportedByMe
                      }
                      className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
                    >

                      {supportLoading
                        ? "Supporting..."
                        : supportedReport.supportedByMe
                        ? "✓ You Supported This"
                        : "Support This Problem"}

                    </button>

                    <button
                      type="button"
                      onClick={
                        handleDifferentProblem
                      }
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      This Is Different
                    </button>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* ==================================================
              INPUT AREA
          ================================================== */}

          {!supportedReport && (
            <div className="border-t border-slate-200 bg-white p-3 sm:p-4">

              <div className="flex items-end gap-2 sm:gap-3">

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(event) =>
                    setInputValue(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    t.citizen?.report
                      ?.inputPlaceholder ||
                    "Describe your problem..."
                  }
                  rows={1}
                  disabled={isSending}
                  className="max-h-32 min-h-[52px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={
                    toggleVoiceInput
                  }
                  disabled={isSending}
                  title={
                    isListening
                      ? language === "hi"
                        ? "आवाज़ बंद करें"
                        : "Stop voice input"
                      : language === "hi"
                      ? "बोलकर लिखें"
                      : "Type with voice"
                  }
                  aria-label={
                    isListening
                      ? "Stop voice input"
                      : "Start voice input"
                  }
                  className={`flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl border text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isListening
                      ? "border-red-200 bg-red-600 hover:bg-red-700"
                      : "border-emerald-700 bg-emerald-700 hover:bg-emerald-800"
                  }`}
                >
                  {isListening ? (
                    <MicOff size={19} />
                  ) : (
                    <Mic size={19} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    isSending ||
                    !inputValue.trim()
                  }
                  className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {isSending ? (
                    <LoaderCircle
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <SendHorizontal
                      size={19}
                    />
                  )}

                </button>

              </div>

              <p className="mt-2 px-1 text-[11px] text-slate-400">
                Press Enter to send • Shift + Enter for a new line
              </p>

              {voiceError && (
                <p className="mt-1 px-1 text-[11px] text-red-600">
                  {voiceError}
                </p>
              )}

            </div>
          )}

        </div>

        {/* ==================================================
            SMALL FOOTER INFORMATION
        ================================================== */}

        {!supportedReport && (
          <div className="mt-3 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">

            <ShieldAlert size={13} />

            <span>
              Your report will only be submitted after you review and click Submit Report.
            </span>

          </div>
        )}

      </div>
    </CitizenLayout>
  );
}

export default ReportProblemPage;