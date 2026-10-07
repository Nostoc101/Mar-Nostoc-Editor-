"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Scissors,
  Download,
  Upload,
  Plus,
  Trash2,
  Sliders,
  Type,
  Crop,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Film,
  Sparkles,
  Music,
  Smile,
  FastForward,
  Volume2,
  VolumeX,
  Copy,
  Wand2,
  CheckCircle2,
  User as UserIcon,
  Crown,
  Lock,
  LogOut,
  X,
  CreditCard,
  ShieldCheck,
  Star,
} from "lucide-react";

// --- INTERFACES & SAAS TYPES ---
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
  tier: "Free" | "Pro Lifetime" | "Pro Monthly";
  joinedDate: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: number;
}

export interface SplitSegment {
  id: string;
  start: number;
  end: number;
  speed: number;
  transition: "none" | "crossfade" | "whiteflash" | "wipe";
}

export interface TextOverlay {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  bgColor: string;
  animation: "none" | "fade" | "typewriter";
  startTime: number;
  endTime: number;
}

export interface StickerOverlay {
  id: string;
  emoji: string;
  x: number;
  y: number;
  size: number;
  startTime: number;
  endTime: number;
}

export interface AudioTrackItem {
  id: string;
  name: string;
  url?: string;
  type: "upload" | "sfx_swish" | "sfx_bass" | "sfx_pop" | "sfx_glitch";
  startTime: number;
  duration: number;
  volume: number;
}

export type FilterPreset = "none" | "cyberpunk" | "vintage" | "noir" | "golden" | "vhs";
export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";

export default function MarNostocEditor() {
  // --- USER AUTH & SAAS STATE ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Load existing session from storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mar_nostoc_session");
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("mar_nostoc_session");
        }
      }
    }
  }, []);

  const handleSaveUserSession = (user: UserProfile) => {
    setCurrentUser(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("mar_nostoc_session", JSON.stringify(user));
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim()) return;

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: authEmail.trim(),
      name: authEmail.split("@")[0],
      isPro: false,
      tier: "Free",
      joinedDate: new Date().toLocaleDateString(),
    };

    handleSaveUserSession(newUser);
    setShowAuthModal(false);
    setAuthEmail("");
    setAuthPassword("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("mar_nostoc_session");
    }
  };

  const handleUpgradeToPro = (planName: "Pro Monthly" | "Pro Lifetime") => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      const upgraded: UserProfile = {
        id: currentUser ? currentUser.id : `usr_${Date.now()}`,
        email: currentUser ? currentUser.email : "pro_user@marnostoc.com",
        name: currentUser ? currentUser.name : "Pro Creator",
        isPro: true,
        tier: planName,
        joinedDate: currentUser ? currentUser.joinedDate : new Date().toLocaleDateString(),
      };
      handleSaveUserSession(upgraded);
      setIsProcessingPayment(false);
      setShowUpgradeModal(false);
    }, 1200);
  };

  // --- EDITOR WORKSPACE STATE ---
  const [activeTab, setActiveTab] = useState<
    "media" | "audio" | "text" | "stickers" | "effects" | "transitions" | "speed" | "adjust" | "crop"
  >("media");

  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(10);
  const [timelineZoom, setTimelineZoom] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const [segments, setSegments] = useState<SplitSegment[]>([]);
  const [textList, setTextList] = useState<TextOverlay[]>([
    {
      id: "txt_default",
      text: "Mar Nostoc Studio",
      x: 50,
      y: 40,
      fontSize: 32,
      color: "#00f2fe",
      bgColor: "rgba(0,0,0,0.6)",
      animation: "fade",
      startTime: 0,
      endTime: 5,
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>("txt_default");

  const [stickers, setStickers] = useState<StickerOverlay[]>([
    { id: "stk_1", emoji: "🔥", x: 75, y: 70, size: 48, startTime: 1, endTime: 6 },
  ]);

  const [audioTracks, setAudioTracks] = useState<AudioTrackItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>("none");
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);

  const [keyframeZoom, setKeyframeZoom] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<number>(1.25);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const previewBoxRef = useRef<HTMLDivElement | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioFileInputRef = useRef<HTMLInputElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Web Audio Context initialization
  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    if (!audioContextRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current?.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const playSynthesizedSFX = (type: AudioTrackItem["type"]) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === "sfx_swish") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "sfx_bass") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === "sfx_pop") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === "sfx_glitch") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        osc.frequency.setValueAtTime(80, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, "#08080a");
      grad.addColorStop(0.5, "#141419");
      grad.addColorStop(1, "#033249");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      ctx.fillStyle = "#00f2fe";
      ctx.font = "bold 60px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MAR NOSTOC EDITOR", 640, 340);

      ctx.fillStyle = "#ffffff";
      ctx.font = "24px sans-serif";
      ctx.fillText("Pro Multimedia Suite • Import Media to Begin", 640, 400);

      const stream = canvas.captureStream(30);
      const mr = new MediaRecorder(stream, { mimeType: "video/webm" });
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const placeholder: MediaAsset = {
          id: "marnostoc-sample",
          name: "Sample Project.webm",
          url,
          thumbnail: canvas.toDataURL(),
          duration: 12,
        };
        setMediaAssets([placeholder]);
        setActiveAssetId(placeholder.id);
        setDuration(12);
        setSegments([{ id: "seg_1", start: 0, end: 12, speed: 1.0, transition: "none" }]);
      };
      mr.start();
      setTimeout(() => mr.stop(), 500);
    }
  }, []);

  useEffect(() => {
    const active = mediaAssets.find((a) => a.id === activeAssetId);
    if (videoRef.current && active) {
      videoRef.current.src = active.url;
      videoRef.current.load();
      setCurrentTime(0);
      setSegments([{ id: `seg_${Date.now()}`, start: 0, end: active.duration || 10, speed: 1.0, transition: "none" }]);
    }
  }, [activeAssetId, mediaAssets]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 10;
      setDuration(dur);
      if (segments.length === 0) {
        setSegments([{ id: "seg_init", start: 0, end: dur, speed: 1.0, transition: "none" }]);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      audioTracks.forEach((at) => {
        if (Math.abs(t - at.startTime) < 0.08 && isPlaying) {
          playSynthesizedSFX(at.type);
        }
      });
    }
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      getAudioContext();
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const temp = document.createElement("video");
      temp.src = url;
      temp.muted = true;
      temp.playsInline = true;

      temp.onloadeddata = () => {
        temp.currentTime = 0.5;
      };

      temp.onseeked = () => {
        const c = document.createElement("canvas");
        c.width = 160;
        c.height = 90;
        const ctx = c.getContext("2d");
        if (ctx) ctx.drawImage(temp, 0, 0, 160, 90);

        const newAsset: MediaAsset = {
          id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          url,
          thumbnail: c.toDataURL("image/jpeg", 0.75),
          duration: temp.duration || 10,
        };

        setMediaAssets((prev) => [newAsset, ...prev]);
        setActiveAssetId(newAsset.id);
        setDuration(newAsset.duration || 10);
      };
    });
  };

  const handleAudioUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    const newAudio: AudioTrackItem = {
      id: `audio_${Date.now()}`,
      name: file.name,
      url,
      type: "upload",
      startTime: currentTime,
      duration: 6,
      volume: 1.0,
    };
    setAudioTracks((prev) => [...prev, newAudio]);
  };

  const handleSplitSegment = () => {
    if (!videoRef.current) return;
    const cutTime = currentTime;
    const idx = segments.findIndex((s) => cutTime > s.start && cutTime < s.end);

    if (idx !== -1) {
      const target = segments[idx];
      const left: SplitSegment = {
        id: `seg_${Date.now()}_l`,
        start: target.start,
        end: cutTime,
        speed: target.speed,
        transition: target.transition,
      };
      const right: SplitSegment = {
        id: `seg_${Date.now()}_r`,
        start: cutTime,
        end: target.end,
        speed: target.speed,
        transition: "crossfade",
      };
      const nextSegs = [...segments];
      nextSegs.splice(idx, 1, left, right);
      setSegments(nextSegs);
    }
  };

  const handleDeleteSegment = () => {
    if (segments.length <= 1) return;
    const filtered = segments.filter((s) => !(currentTime >= s.start && currentTime <= s.end));
    if (filtered.length > 0) {
      setSegments(filtered);
      setCurrentTime(filtered[0].start);
      if (videoRef.current) videoRef.current.currentTime = filtered[0].start;
    }
  };

  const handleDuplicateSegment = () => {
    const cur = segments.find((s) => currentTime >= s.start && currentTime <= s.end);
    if (!cur) return;
    const dur = cur.end - cur.start;
    const copy: SplitSegment = {
      id: `seg_${Date.now()}_copy`,
      start: cur.end,
      end: cur.end + dur,
      speed: cur.speed,
      transition: "none",
    };
    setSegments((p) => [...p, copy]);
  };

  const calculateMagneticSnap = (target: number): number => {
    const candidates = [0, duration];
    segments.forEach((s) => {
      candidates.push(s.start);
      candidates.push(s.end);
    });
    for (const pt of candidates) {
      if (Math.abs(target - pt) <= 0.22) {
        return pt;
      }
    }
    return target;
  };

  const isScrubbingRef = useRef<boolean>(false);
  const handleTimelinePointerDown = (e: React.PointerEvent) => {
    isScrubbingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    seekFromPointer(e);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent) => {
    if (isScrubbingRef.current) seekFromPointer(e);
  };

  const handleTimelinePointerUp = () => {
    isScrubbingRef.current = false;
  };

  const seekFromPointer = (e: React.PointerEvent) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const target = calculateMagneticSnap(ratio * duration);
    setCurrentTime(target);
    if (videoRef.current) videoRef.current.currentTime = target;
  };

  const isDraggingItem = useRef<"text" | "sticker" | null>(null);
  const draggingItemId = useRef<string | null>(null);

  const handlePointerDownText = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingItem.current = "text";
    draggingItemId.current = id;
    setSelectedTextId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerDownSticker = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingItem.current = "sticker";
    draggingItemId.current = id;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePreviewPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingItem.current || !draggingItemId.current || !previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const px = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const py = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    if (isDraggingItem.current === "text") {
      setTextList((prev) =>
        prev.map((t) => (t.id === draggingItemId.current ? { ...t, x: px, y: py } : t))
      );
    } else if (isDraggingItem.current === "sticker") {
      setStickers((prev) =>
        prev.map((s) => (s.id === draggingItemId.current ? { ...s, x: px, y: py } : s))
      );
    }
  };

  const handlePreviewPointerUp = () => {
    isDraggingItem.current = null;
    draggingItemId.current = null;
  };

  // Paywalled Feature Checker
  const checkProAccess = (action: () => void) => {
    if (currentUser?.isPro) {
      action();
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleSetSpeed = (newSpeed: number) => {
    if (newSpeed >= 4.0 || newSpeed <= 0.25) {
      checkProAccess(() => applySpeed(newSpeed));
    } else {
      applySpeed(newSpeed);
    }
  };

  const applySpeed = (newSpeed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = newSpeed;
    setSegments((prev) =>
      prev.map((s) => (currentTime >= s.start && currentTime <= s.end ? { ...s, speed: newSpeed } : s))
    );
  };

  const handleSetTransition = (trans: SplitSegment["transition"]) => {
    setSegments((prev) =>
      prev.map((s) => (currentTime >= s.start && currentTime <= s.end ? { ...s, transition: trans } : s))
    );
  };

  const getFilterCSS = () => {
    let base = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) hue-rotate(${hueRotate}deg)`;
    if (activeFilter === "cyberpunk") base += " saturate(180%) hue-rotate(290deg) contrast(140%)";
    if (activeFilter === "vintage") base += " sepia(60%) contrast(110%) brightness(90%)";
    if (activeFilter === "noir") base += " grayscale(100%) contrast(160%) brightness(85%)";
    if (activeFilter === "golden") base += " sepia(30%) saturate(140%) brightness(105%)";
    if (activeFilter === "vhs") base += " contrast(130%) hue-rotate(15deg) saturate(160%)";
    return base;
  };

  const calculateKeyframeScale = () => {
    if (!keyframeZoom) return 1;
    const progress = currentTime / (duration || 1);
    return 1 + progress * (zoomScale - 1);
  };

  // --- 1080P EXPORT ENGINE WITH HARDCODED WATERMARK & PRO REMOVAL ---
  const handleExportVideo = async () => {
    if (!videoRef.current || isExporting) return;
    setIsExporting(true);
    setExportProgress(0);

    const video = videoRef.current;
    const wasPlaying = !video.paused;
    video.pause();

    const canvas = document.createElement("canvas");
    let outW = 1920;
    let outH = 1080;
    if (aspectRatio === "9:16") {
      outW = 1080;
      outH = 1920;
    } else if (aspectRatio === "1:1") {
      outW = 1080;
      outH = 1080;
    } else if (aspectRatio === "4:5") {
      outW = 1080;
      outH = 1350;
    }

    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    const stream = canvas.captureStream(60);
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
      ? "video/mp4;codecs=avc1"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 14000000,
    });

    const recordedChunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `Mar_Nostoc_${currentUser?.isPro ? "PRO" : "Free"}_${Date.now()}.${
        mimeType.includes("mp4") ? "mp4" : "webm"
      }`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setIsExporting(false);
      setExportProgress(100);
      if (wasPlaying) video.play();
    };

    recorder.start();

    const fps = 30;
    const totalFrames = Math.floor(duration * fps);
    let frame = 0;

    const renderLoop = async () => {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const t = frame / fps;
      video.currentTime = t;

      await new Promise<void>((resolve) => {
        const onSeek = () => {
          video.removeEventListener("seeked", onSeek);
          resolve();
        };
        video.addEventListener("seeked", onSeek);
      });

      // 1. Draw Background & Filtered Video
      ctx.save();
      ctx.filter = getFilterCSS();

      if (keyframeZoom && currentUser?.isPro) {
        const scale = 1 + (t / duration) * (zoomScale - 1);
        ctx.translate(outW / 2, outH / 2);
        ctx.scale(scale, scale);
        ctx.translate(-outW / 2, -outH / 2);
      }

      const sx = (cropBox.x / 100) * (video.videoWidth || outW);
      const sy = (cropBox.y / 100) * (video.videoHeight || outH);
      const sw = (cropBox.width / 100) * (video.videoWidth || outW);
      const sh = (cropBox.height / 100) * (video.videoHeight || outH);

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, outW, outH);
      ctx.restore();

      // 2. Render Transitions
      const currentSeg = segments.find((s) => t >= s.start && t <= s.end);
      if (currentSeg && currentSeg.transition !== "none") {
        const timeFromCut = t - currentSeg.start;
        if (timeFromCut < 0.5) {
          const transProgress = 1 - timeFromCut / 0.5;
          if (currentSeg.transition === "whiteflash") {
            ctx.fillStyle = `rgba(255, 255, 255, ${transProgress * 0.9})`;
            ctx.fillRect(0, 0, outW, outH);
          } else if (currentSeg.transition === "crossfade") {
            ctx.fillStyle = `rgba(0, 0, 0, ${transProgress * 0.7})`;
            ctx.fillRect(0, 0, outW, outH);
          } else if (currentSeg.transition === "wipe") {
            ctx.fillStyle = "#00f2fe";
            ctx.fillRect(0, 0, outW * transProgress, outH);
          }
        }
      }

      // 3. Render Stickers
      stickers.forEach((stk) => {
        if (t >= stk.startTime && t <= stk.endTime) {
          ctx.save();
          const px = (stk.x / 100) * outW;
          const py = (stk.y / 100) * outH;
          const scaleSize = Math.floor((stk.size / 360) * outH);
          ctx.font = `${scaleSize}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(stk.emoji, px, py);
          ctx.restore();
        }
      });

      // 4. Render Text Tracks
      textList.forEach((item) => {
        if (t >= item.startTime && t <= item.endTime) {
          ctx.save();
          const px = (item.x / 100) * outW;
          const py = (item.y / 100) * outH;
          const scaleFont = Math.floor((item.fontSize / 360) * outH);

          let displayText = item.text;
          if (item.animation === "typewriter") {
            const ratio = (t - item.startTime) / (item.endTime - item.startTime);
            const charCount = Math.floor(ratio * item.text.length);
            displayText = item.text.substring(0, Math.max(1, charCount));
          }

          ctx.font = `bold ${scaleFont}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const metrics = ctx.measureText(displayText);
          const pad = scaleFont * 0.35;
          ctx.fillStyle = item.bgColor;

          const rx = px - metrics.width / 2 - pad;
          const ry = py - scaleFont / 2 - pad / 2;
          const rw = metrics.width + pad * 2;
          const rh = scaleFont + pad;

          if (typeof (ctx as any).roundRect === "function") {
            (ctx as any).roundRect(rx, ry, rw, rh, 8);
          } else {
            ctx.rect(rx, ry, rw, rh);
          }
          ctx.fill();

          ctx.fillStyle = item.color;
          ctx.fillText(displayText, px, py);
          ctx.restore();
        }
      });

      // 5. HARDCODED WATERMARK (BAKED INTO EXPORT IF NOT PRO)
      if (!currentUser?.isPro) {
        ctx.save();
        const watermarkTitle = "MAR NOSTOC EDITOR";
        const watermarkSub = "Created with Free Tier • Upgrade to Remove";
        const wmFontSize = Math.floor(outH * 0.024);
        const pad = Math.floor(outH * 0.016);

        ctx.font = `bold ${wmFontSize}px sans-serif`;
        const metrics = ctx.measureText(watermarkTitle);
        const boxW = metrics.width + pad * 2.8;
        const boxH = wmFontSize * 2.4;
        const boxX = outW - boxW - Math.floor(outW * 0.03);
        const boxY = outH - boxH - Math.floor(outH * 0.03);

        ctx.fillStyle = "rgba(10, 10, 14, 0.85)";
        if (typeof (ctx as any).roundRect === "function") {
          (ctx as any).roundRect(boxX, boxY, boxW, boxH, 10);
        } else {
          ctx.rect(boxX, boxY, boxW, boxH);
        }
        ctx.fill();

        ctx.strokeStyle = "rgba(0, 242, 254, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#00f2fe";
        ctx.fillText(watermarkTitle, boxX + pad, boxY + wmFontSize + 2);

        ctx.font = `${Math.floor(wmFontSize * 0.55)}px sans-serif`;
        ctx.fillStyle = "#a1a1aa";
        ctx.fillText(watermarkSub, boxX + pad, boxY + wmFontSize * 1.8 + 2);
        ctx.restore();
      }

      frame++;
      setExportProgress(Math.floor((frame / totalFrames) * 100));
      setTimeout(renderLoop, 8);
    };

    renderLoop();
  };

  const formatTimestamp = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 10);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms}`;
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#08080a] select-none text-white overflow-hidden font-sans">
      {/* --- TOP HEADER NAVIGATION --- */}
      <header className="h-14 border-b border-[#1c1c24] bg-[#0d0d12] px-4 flex items-center justify-between z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] font-black text-black text-sm tracking-wider shadow-lg shadow-cyan-500/20">
            MN
          </div>
          <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
            Mar Nostoc editor
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border ${
              currentUser?.isPro
                ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                : "bg-cyan-950/80 border-cyan-700/50 text-cyan-300"
            }`}
          >
            {currentUser?.isPro ? (
              <>
                <Crown className="w-3 h-3 text-amber-400 fill-amber-400" /> PRO STUDIO
              </>
            ) : (
              "FREE PLAN"
            )}
          </span>
        </div>

        {/* Global Controls & User Profile */}
        <div className="flex items-center space-x-3">
          {!currentUser?.isPro && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition"
            >
              <Crown className="w-3.5 h-3.5 fill-black" />
              Remove Watermark (Go Pro)
            </button>
          )}

          <button
            onClick={() => {
              setBrightness(100);
              setContrast(100);
              setSaturation(100);
              setHueRotate(0);
              setBlur(0);
              setActiveFilter("none");
              setKeyframeZoom(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-[#1a1a24] rounded-md transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* User Account Button */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#242433]">
              <div className="text-right hidden sm:block">
                <span className="text-xs font-semibold block text-white truncate max-w-[120px]">
                  {currentUser.email}
                </span>
                <span className="text-[10px] text-zinc-400 block">{currentUser.tier}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-[#181822] hover:bg-red-950/40 text-zinc-400 hover:text-red-300 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a24] hover:bg-[#252533] text-zinc-200 text-xs font-semibold border border-[#2b2b3b] transition"
            >
              <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
              Sign In
            </button>
          )}

          {/* 1080p Render Export */}
          <button
            onClick={handleExportVideo}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs tracking-wide shadow-lg transition ${
              isExporting
                ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#00f2fe] to-[#4facfe] hover:opacity-90 text-black shadow-cyan-500/25"
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                <span>Exporting ({exportProgress}%)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export 1080p Video</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* --- MAIN WORKSPACE --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT TOOL BAR */}
        <nav className="w-16 border-r border-[#1a1a24] bg-[#0c0c11] flex flex-col items-center py-3 space-y-4 z-20">
          {[
            { id: "media", icon: Film, label: "Media" },
            { id: "audio", icon: Music, label: "Audio" },
            { id: "text", icon: Type, label: "Text" },
            { id: "stickers", icon: Smile, label: "Stickers" },
            { id: "effects", icon: Wand2, label: "Effects" },
            { id: "transitions", icon: Sparkles, label: "Trans" },
            { id: "speed", icon: FastForward, label: "Speed" },
            { id: "adjust", icon: Sliders, label: "Adjust" },
            { id: "crop", icon: Crop, label: "Ratio" },
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTab === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTab(tool.id as typeof activeTab)}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                  isActive ? "text-[#00f2fe]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition ${
                    isActive ? "bg-cyan-500/15 border border-cyan-500/30" : "hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{tool.label}</span>
              </button>
            );
          })}
        </nav>

        {/* DRAWER PANEL */}
        <aside className="w-80 border-r border-[#1c1c24] bg-[#121218] flex flex-col overflow-y-auto p-4 z-10">
          {/* MEDIA DRAWER */}
          {activeTab === "media" && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-100">Media Library</h3>
                <span className="text-xs text-zinc-500">{mediaAssets.length} loaded</span>
              </div>

              <div
                onClick={() => mediaFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2b2b3b] hover:border-cyan-400/60 bg-[#0c0c11] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition group"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-cyan-400 transition mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-300">Upload Video File</span>
                <span className="text-[10px] text-zinc-500 mt-1">MP4, WebM (Android 10+ Compatible)</span>
                <input
                  type="file"
                  ref={mediaFileInputRef}
                  accept="video/mp4,video/webm"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                {mediaAssets.map((asset) => {
                  const isActive = asset.id === activeAssetId;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setActiveAssetId(asset.id)}
                      className={`relative group rounded-lg overflow-hidden border cursor-pointer transition ${
                        isActive ? "border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg" : "border-[#252533] hover:border-zinc-500"
                      }`}
                    >
                      <img src={asset.thumbnail} alt={asset.name} className="w-full h-24 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                        <span className="text-[10px] text-white font-medium truncate w-full">{asset.name}</span>
                        <span className="text-[9px] text-zinc-400">{formatTimestamp(asset.duration)}</span>
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 bg-cyan-400 text-black rounded-full p-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUDIO & SFX DRAWER */}
          {activeTab === "audio" && (
            <div className="flex flex-col space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-100">Audio & SFX</h3>
                <button
                  onClick={() => audioFileInputRef.current?.click()}
                  className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload MP3
                </button>
                <input
                  type="file"
                  ref={audioFileInputRef}
                  accept="audio/mp3,audio/wav"
                  className="hidden"
                  onChange={(e) => handleAudioUpload(e.target.files)}
                />
              </div>

              <span className="text-[11px] font-semibold text-zinc-400 pt-2 uppercase tracking-wider">
                Built-in SFX Synthesizer
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Swish / Whoosh", type: "sfx_swish" as const },
                  { label: "Bass Drop", type: "sfx_bass" as const },
                  { label: "UI Bubble Pop", type: "sfx_pop" as const },
                  { label: "Glitch Static", type: "sfx_glitch" as const },
                ].map((sfx) => (
                  <button
                    key={sfx.type}
                    onClick={() => {
                      playSynthesizedSFX(sfx.type);
                      setAudioTracks((p) => [
                        ...p,
                        {
                          id: `sfx_${Date.now()}`,
                          name: sfx.label,
                          type: sfx.type,
                          startTime: currentTime,
                          duration: 1.5,
                          volume: 1,
                        },
                      ]);
                    }}
                    className="p-2.5 rounded-lg border border-[#272738] bg-[#0c0c11] hover:border-cyan-400 text-left transition group"
                  >
                    <span className="text-zinc-200 font-semibold block">{sfx.label}</span>
                    <span className="text-[9px] text-zinc-500 group-hover:text-cyan-400">+ Add at playhead</span>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-[#20202e] space-y-2">
                <span className="font-semibold text-zinc-300">Active Audio Tracks</span>
                {audioTracks.length === 0 ? (
                  <span className="text-zinc-500 italic block">No audio tracks added.</span>
                ) : (
                  audioTracks.map((trk) => (
                    <div
                      key={trk.id}
                      className="flex items-center justify-between p-2 rounded bg-[#181822] border border-[#272738]"
                    >
                      <div className="truncate pr-2">
                        <span className="font-medium text-white block truncate">{trk.name}</span>
                        <span className="text-[9px] text-zinc-400">At {formatTimestamp(trk.startTime)}</span>
                      </div>
                      <button
                        onClick={() => setAudioTracks((p) => p.filter((t) => t.id !== trk.id))}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TEXT DRAWER */}
          {activeTab === "text" && (
            <div className="flex flex-col space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-100">Text & Titles</h3>
                <button
                  onClick={() => {
                    const newTxt: TextOverlay = {
                      id: `txt_${Date.now()}`,
                      text: "New Text Track",
                      x: 50,
                      y: 50,
                      fontSize: 28,
                      color: "#ffffff",
                      bgColor: "rgba(0,0,0,0.6)",
                      animation: "none",
                      startTime: currentTime,
                      endTime: Math.min(currentTime + 4, duration),
                    };
                    setTextList((p) => [...p, newTxt]);
                    setSelectedTextId(newTxt.id);
                  }}
                  className="flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Text
                </button>
              </div>

              {selectedTextId ? (
                (() => {
                  const target = textList.find((t) => t.id === selectedTextId);
                  if (!target) return null;
                  return (
                    <div className="space-y-3 bg-[#0d0d12] p-3 rounded-xl border border-[#232333]">
                      <div>
                        <label className="text-zinc-400 block mb-1">Content</label>
                        <input
                          type="text"
                          value={target.text}
                          onChange={(e) =>
                            setTextList((p) => p.map((t) => (t.id === target.id ? { ...t, text: e.target.value } : t)))
                          }
                          className="w-full bg-[#181822] border border-[#2e2e42] rounded px-2.5 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1">Animation</label>
                        <select
                          value={target.animation}
                          onChange={(e) =>
                            setTextList((p) =>
                              p.map((t) => (t.id === target.id ? { ...t, animation: e.target.value as any } : t))
                            )
                          }
                          className="w-full bg-[#181822] border border-[#2e2e42] rounded px-2.5 py-1.5 text-white"
                        >
                          <option value="none">Static</option>
                          <option value="typewriter">Typewriter</option>
                          <option value="fade">Smooth Fade</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Font Size</span>
                          <span>{target.fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="14"
                          max="72"
                          value={target.fontSize}
                          onChange={(e) =>
                            setTextList((p) =>
                              p.map((t) => (t.id === target.id ? { ...t, fontSize: Number(e.target.value) } : t))
                            )
                          }
                          className="w-full h-1 bg-zinc-800 rounded accent-cyan-400"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-zinc-400 block mb-1">Color</label>
                          <input
                            type="color"
                            value={target.color}
                            onChange={(e) =>
                              setTextList((p) => p.map((t) => (t.id === target.id ? { ...t, color: e.target.value } : t)))
                            }
                            className="w-full h-8 bg-transparent cursor-pointer rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-zinc-400 block mb-1">Background</label>
                          <button
                            onClick={() =>
                              setTextList((p) =>
                                p.map((t) =>
                                  t.id === target.id
                                    ? { ...t, bgColor: t.bgColor === "transparent" ? "rgba(0,0,0,0.6)" : "transparent" }
                                    : t
                                )
                              )
                            }
                            className="w-full h-8 bg-[#181822] border border-[#2e2e42] rounded text-zinc-300"
                          >
                            {target.bgColor === "transparent" ? "None" : "Dark"}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTextList((p) => p.filter((t) => t.id !== target.id));
                          setSelectedTextId(null);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 text-red-400 bg-red-950/20 border border-red-900/30 py-1.5 rounded hover:bg-red-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Text
                      </button>
                    </div>
                  );
                })()
              ) : (
                <span className="text-zinc-500 italic">Select or add a text track to edit.</span>
              )}
            </div>
          )}

          {/* STICKERS DRAWER */}
          {activeTab === "stickers" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Emoji & Badges</h3>
              <div className="grid grid-cols-4 gap-2 text-2xl">
                {["🔥", "⚡", "✨", "🎬", "🚀", "💯", "❤️", "💎"].map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      setStickers((p) => [
                        ...p,
                        {
                          id: `stk_${Date.now()}`,
                          emoji: em,
                          x: 50,
                          y: 50,
                          size: 48,
                          startTime: currentTime,
                          endTime: Math.min(currentTime + 5, duration),
                        },
                      ]);
                    }}
                    className="h-12 flex items-center justify-center rounded-xl bg-[#0c0c11] border border-[#272738] hover:border-cyan-400 hover:scale-105 transition"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EFFECTS & PAYWALLED FILTERS */}
          {activeTab === "effects" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Cinematic Filters (LUTs)</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "none", name: "Standard (Free)", pro: false },
                  { id: "vintage", name: "Vintage 1970s", pro: false },
                  { id: "golden", name: "Golden Hour", pro: false },
                  { id: "noir", name: "B&W Noir", pro: false },
                  { id: "cyberpunk", name: "Cyberpunk Glow", pro: true },
                  { id: "vhs", name: "VHS Glitch", pro: true },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      if (f.pro && !currentUser?.isPro) {
                        setShowUpgradeModal(true);
                      } else {
                        setActiveFilter(f.id as FilterPreset);
                      }
                    }}
                    className={`p-3 rounded-lg border text-left font-medium relative transition ${
                      activeFilter === f.id
                        ? "border-cyan-400 bg-cyan-950/40 text-cyan-300"
                        : "border-[#252538] bg-[#0c0c11] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold block truncate">{f.name}</span>
                      {f.pro && !currentUser?.isPro && <Lock className="w-3 h-3 text-amber-400" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-[#20202e] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                    Ken Burns Dynamic Zoom
                    {!currentUser?.isPro && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.5 rounded border border-amber-500/30">
                        PRO
                      </span>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={keyframeZoom}
                    onChange={(e) => {
                      if (!currentUser?.isPro) {
                        setShowUpgradeModal(true);
                      } else {
                        setKeyframeZoom(e.target.checked);
                      }
                    }}
                    className="w-4 h-4 accent-cyan-400 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TRANSITIONS */}
          {activeTab === "transitions" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Cut Transitions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "none", name: "Cut (None)" },
                  { id: "crossfade", name: "Crossfade" },
                  { id: "whiteflash", name: "Flash White" },
                  { id: "wipe", name: "Cyan Wipe" },
                ].map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => handleSetTransition(tr.id as SplitSegment["transition"])}
                    className="p-3 rounded-lg border border-[#252538] bg-[#0c0c11] hover:border-cyan-400 text-left font-medium transition"
                  >
                    {tr.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SPEED WITH PRO GATING */}
          {activeTab === "speed" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Speed Control (Ramping)</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { spd: 0.25, pro: true },
                  { spd: 0.5, pro: false },
                  { spd: 0.75, pro: false },
                  { spd: 1.0, pro: false },
                  { spd: 1.5, pro: false },
                  { spd: 2.0, pro: false },
                  { spd: 4.0, pro: true },
                ].map((item) => (
                  <button
                    key={item.spd}
                    onClick={() => handleSetSpeed(item.spd)}
                    className="py-2.5 rounded-lg border border-[#252538] bg-[#0c0c11] hover:border-cyan-400 font-bold flex items-center justify-center gap-1 transition"
                  >
                    <span>{item.spd}x</span>
                    {item.pro && !currentUser?.isPro && <Lock className="w-2.5 h-2.5 text-amber-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ADJUSTMENTS */}
          {activeTab === "adjust" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Color Grading</h3>
              <div className="space-y-3">
                {[
                  { label: "Brightness", val: brightness, set: setBrightness, max: 200 },
                  { label: "Contrast", val: contrast, set: setContrast, max: 200 },
                  { label: "Saturation", val: saturation, set: setSaturation, max: 200 },
                  { label: "Hue Shift", val: hueRotate, set: setHueRotate, max: 360 },
                  { label: "Blur", val: blur, set: setBlur, max: 20 },
                ].map((ctl) => (
                  <div key={ctl.label}>
                    <div className="flex justify-between text-zinc-400 mb-1">
                      <span>{ctl.label}</span>
                      <span>{ctl.val}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={ctl.max}
                      value={ctl.val}
                      onChange={(e) => ctl.set(Number(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded accent-cyan-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RATIO & CROP */}
          {activeTab === "crop" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Canvas Ratio & Crop</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "16:9 (Landscape)", val: "16:9" },
                  { label: "9:16 (TikTok/Shorts)", val: "9:16" },
                  { label: "1:1 (Square)", val: "1:1" },
                  { label: "4:5 (Portrait)", val: "4:5" },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => setAspectRatio(item.val as AspectRatio)}
                    className={`py-2 px-2.5 rounded-lg border font-medium transition ${
                      aspectRatio === item.val
                        ? "border-cyan-400 bg-cyan-950/40 text-cyan-300"
                        : "border-[#252538] bg-[#0c0c11] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* CENTER PREVIEW PLAYER WITH LIVE WATERMARK */}
        <section
          className="flex-1 bg-[#060608] flex flex-col items-center justify-center relative overflow-hidden select-none"
          onPointerMove={handlePreviewPointerMove}
          onPointerUp={handlePreviewPointerUp}
        >
          <div
            ref={previewBoxRef}
            className={`relative overflow-hidden bg-black shadow-2xl rounded-lg border border-[#222230] ${
              aspectRatio === "9:16"
                ? "aspect-[9/16] max-h-[58vh]"
                : aspectRatio === "1:1"
                ? "aspect-square max-h-[58vh]"
                : aspectRatio === "4:5"
                ? "aspect-[4/5] max-h-[58vh]"
                : "aspect-video max-h-[58vh]"
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              muted={isMuted}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain pointer-events-none transition-transform duration-75"
              style={{
                filter: getFilterCSS(),
                transform: `scale(${calculateKeyframeScale()})`,
                clipPath: `inset(${cropBox.y}% ${100 - (cropBox.x + cropBox.width)}% ${
                  100 - (cropBox.y + cropBox.height)
                }% ${cropBox.x}%)`,
              }}
            />

            {/* LIVE PREVIEW WATERMARK PILL FOR FREE USERS */}
            {!currentUser?.isPro && (
              <div
                onClick={() => setShowUpgradeModal(true)}
                className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md border border-cyan-400/40 rounded-lg px-2.5 py-1 flex items-center gap-2 cursor-pointer hover:border-amber-400 transition group shadow-2xl"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-black tracking-wider text-cyan-300 group-hover:text-amber-300">
                    MAR NOSTOC EDITOR
                  </span>
                  <span className="text-[8px] text-zinc-400">Click to remove watermark</span>
                </div>
              </div>
            )}

            {/* Draggable Stickers */}
            {stickers.map((stk) => {
              const isVisible = currentTime >= stk.startTime && currentTime <= stk.endTime;
              if (!isVisible) return null;
              return (
                <div
                  key={stk.id}
                  onPointerDown={(e) => handlePointerDownSticker(stk.id, e)}
                  style={{
                    left: `${stk.x}%`,
                    top: `${stk.y}%`,
                    fontSize: `${stk.size}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                  className="absolute cursor-move select-none touch-none hover:scale-110 transition-transform"
                >
                  {stk.emoji}
                </div>
              );
            })}

            {/* Draggable Text Overlays */}
            {textList.map((txt) => {
              const isVisible = currentTime >= txt.startTime && currentTime <= txt.endTime;
              if (!isVisible) return null;
              const isSelected = txt.id === selectedTextId;

              let content = txt.text;
              if (txt.animation === "typewriter") {
                const ratio = (currentTime - txt.startTime) / (txt.endTime - txt.startTime);
                const charCount = Math.floor(ratio * txt.text.length);
                content = txt.text.substring(0, Math.max(1, charCount));
              }

              return (
                <div
                  key={txt.id}
                  onPointerDown={(e) => handlePointerDownText(txt.id, e)}
                  style={{
                    left: `${txt.x}%`,
                    top: `${txt.y}%`,
                    fontSize: `${txt.fontSize}px`,
                    transform: "translate(-50%, -50%)",
                    color: txt.color,
                    backgroundColor: txt.bgColor,
                  }}
                  className={`absolute cursor-move px-3 py-1 rounded font-bold shadow-xl touch-none whitespace-nowrap transition-shadow ${
                    isSelected ? "ring-2 ring-cyan-400 border border-white" : "border border-transparent"
                  }`}
                >
                  {content}
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-4 flex items-center gap-3 bg-[#111116]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#232333] shadow-2xl">
            <button
              onClick={togglePlay}
              className="p-1 text-cyan-400 hover:text-white transition"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-cyan-400" />}
            </button>
            <button
              onClick={() => setIsMuted((m) => !m)}
              className="p-1 text-zinc-400 hover:text-white transition"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <span className="text-xs font-mono text-zinc-300">
              {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
            </span>
          </div>
        </section>
      </div>

      {/* --- BOTTOM MULTI-TRACK TIMELINE --- */}
      <footer className="h-64 border-t border-[#1a1a24] bg-[#0c0c11] flex flex-col z-20">
        <div className="h-10 border-b border-[#181822] px-4 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSplitSegment}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#181822] hover:bg-[#252538] text-white transition font-medium"
            >
              <Scissors className="w-3.5 h-3.5 text-cyan-400" />
              <span>Split</span>
            </button>
            <button
              onClick={handleDuplicateSegment}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#181822] hover:bg-[#252538] text-white transition font-medium"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleDeleteSegment}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#181822] hover:bg-red-950/40 text-red-400 transition font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimelineZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:bg-zinc-800 rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px]">{timelineZoom.toFixed(1)}x</span>
            <button
              onClick={() => setTimelineZoom((z) => Math.min(3, z + 0.25))}
              className="p-1 hover:bg-zinc-800 rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div
          ref={timelineTrackRef}
          onPointerDown={handleTimelinePointerDown}
          onPointerMove={handleTimelinePointerMove}
          onPointerUp={handleTimelinePointerUp}
          className="flex-1 relative bg-[#09090d] overflow-x-auto overflow-y-hidden cursor-pointer select-none p-3 space-y-2.5"
        >
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-30 pointer-events-none"
            style={{ left: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
          >
            <div className="w-3 h-3 bg-cyan-400 rotate-45 -translate-x-[5px] -translate-y-1 shadow-lg shadow-cyan-400/50" />
          </div>

          {/* TRACK 1: Video Track */}
          <div className="relative h-12 bg-[#121218] rounded-md border border-[#20202e] flex overflow-hidden">
            {segments.map((seg) => {
              const segDur = seg.end - seg.start;
              const widthPct = (segDur / (duration || 1)) * 100;
              return (
                <div
                  key={seg.id}
                  style={{ width: `${widthPct}%` }}
                  className="h-full border-r-2 border-cyan-400 bg-gradient-to-r from-blue-900/30 to-cyan-950/40 relative flex items-center justify-between px-2 text-[10px] font-bold text-cyan-200 truncate"
                >
                  <span className="truncate">Clip ({seg.speed}x)</span>
                  {seg.transition !== "none" && (
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded border border-cyan-500/30 uppercase">
                      {seg.transition}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* TRACK 2: Text Track */}
          <div className="relative h-7 bg-[#0e0e14] rounded-md border border-[#1b1b26] overflow-hidden">
            {textList.map((txt) => {
              const l = (txt.startTime / (duration || 1)) * 100;
              const w = ((txt.endTime - txt.startTime) / (duration || 1)) * 100;
              return (
                <div
                  key={txt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedTextId(txt.id);
                  }}
                  style={{ left: `${l}%`, width: `${Math.max(4, w)}%` }}
                  className={`absolute top-0.5 bottom-0.5 rounded px-1.5 flex items-center text-[9px] font-bold truncate cursor-pointer transition ${
                    selectedTextId === txt.id
                      ? "bg-cyan-400 text-black shadow-md"
                      : "bg-cyan-950/70 text-cyan-300 border border-cyan-800/40"
                  }`}
                >
                  {txt.text}
                </div>
              );
            })}
          </div>

          {/* TRACK 3: Audio Track */}
          <div className="relative h-7 bg-[#0e0e14] rounded-md border border-[#1b1b26] overflow-hidden">
            {audioTracks.map((trk) => {
              const l = (trk.startTime / (duration || 1)) * 100;
              const w = (trk.duration / (duration || 1)) * 100;
              return (
                <div
                  key={trk.id}
                  style={{ left: `${l}%`, width: `${Math.max(4, w)}%` }}
                  className="absolute top-0.5 bottom-0.5 rounded px-1.5 flex items-center text-[9px] font-bold bg-pink-950/60 text-pink-300 border border-pink-700/50 truncate"
                >
                  🎵 {trk.name}
                </div>
              );
            })}
          </div>
        </div>
      </footer>

      {/* --- AUTHENTICATION MODAL (EMAIL LOGIN / SIGNUP) --- */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121218] border border-[#2b2b3b] rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00f2fe] to-[#4facfe] flex items-center justify-center text-black font-black">
                MN
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-white">
                  {authMode === "signup" ? "Create Creator Account" : "Welcome Back"}
                </h3>
                <span className="text-xs text-zinc-400">Mar Nostoc Studio Cloud</span>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@creator.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-[#0c0c11] border border-[#272738] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold block mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-[#0c0c11] border border-[#272738] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-extrabold py-2.5 rounded-lg text-sm hover:brightness-110 shadow-lg shadow-cyan-500/20 transition"
              >
                {authMode === "signup" ? "Get Started (Free)" : "Sign In to Studio"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode((m) => (m === "signup" ? "login" : "signup"))}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  {authMode === "signup"
                    ? "Already have an account? Sign In"
                    : "Need an account? Sign Up Free"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PAYWALL & CHECKOUT MODAL (WATERMARK REMOVAL) --- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#101015] border border-[#2e2e42] rounded-3xl w-full max-w-2xl p-6 sm:p-8 relative shadow-2xl overflow-hidden">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center max-w-md mx-auto mb-6">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 border border-amber-600/40 px-3 py-1 rounded-full inline-block mb-2">
                👑 Mar Nostoc Pro Upgrade
              </span>
              <h2 className="text-2xl font-black text-white">Unlock Studio Video Export</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Remove the watermark permanently and access all professional cinematic tools.
              </p>
            </div>

            {/* Plan Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Monthly Subscription */}
              <div className="border border-[#28283a] bg-[#0c0c11] rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-400 transition">
                <div>
                  <h4 className="font-extrabold text-white text-base">Creator Monthly</h4>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black text-cyan-400">$9.99</span>
                    <span className="text-xs text-zinc-400">/month</span>
                  </div>
                  <ul className="text-xs text-zinc-300 space-y-2 mt-4">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <strong>Remove Export Watermark</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      Unlock VHS Glitch & Cyberpunk LUTs
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      Dynamic Ken Burns Keyframes
                    </li>
                  </ul>
                </div>
                <button
                  disabled={isProcessingPayment}
                  onClick={() => handleUpgradeToPro("Pro Monthly")}
                  className="mt-6 w-full bg-[#1c1c28] hover:bg-cyan-500 hover:text-black text-white font-bold py-2.5 rounded-xl text-xs transition border border-[#2f2f45]"
                >
                  {isProcessingPayment ? "Activating..." : "Select Monthly ($9.99)"}
                </button>
              </div>

              {/* Lifetime Pass (Best Value) */}
              <div className="border-2 border-amber-500/80 bg-gradient-to-b from-[#181512] to-[#0d0c0a] rounded-2xl p-5 flex flex-col justify-between relative shadow-xl shadow-amber-500/10">
                <div className="absolute top-3 right-3 bg-amber-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Best Value
                </div>
                <div>
                  <h4 className="font-extrabold text-amber-300 text-base">Lifetime Pass</h4>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-3xl font-black text-amber-400">$49</span>
                    <span className="text-xs text-zinc-400">one-time payment</span>
                  </div>
                  <ul className="text-xs text-zinc-200 space-y-2 mt-4">
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      <strong>Watermark Removed Forever</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      All Future LUTs & Effects Included
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Priority 4K Canvas Rendering
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      Commercial Monetization Rights
                    </li>
                  </ul>
                </div>
                <button
                  disabled={isProcessingPayment}
                  onClick={() => handleUpgradeToPro("Pro Lifetime")}
                  className="mt-6 w-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-black py-2.5 rounded-xl text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition"
                >
                  {isProcessingPayment ? "Activating Lifetime..." : "Get Lifetime ($49)"}
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] text-zinc-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Instant client-side activation • Works on Android 10+ and Desktop</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}