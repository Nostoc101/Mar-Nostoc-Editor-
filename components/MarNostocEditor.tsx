"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type PointerEvent as ReactPointerEvent,
  type ChangeEvent,
} from "react";
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
  Radio,
  Disc3,
  Move,
  Maximize,
  Grid,
  Undo2,
  Redo2,
  ShieldAlert,
  KeyRound,
  ExternalLink,
  Send,
  Search,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

// ============================================================================
// 1. DATA CONTRACTS & TYPE DEFINITIONS
// ============================================================================

export type SubscriptionTier = "Free" | "Premium Pro";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  tier: SubscriptionTier;
  isBanned: boolean;
  createdAt: string;
  lastActive: string;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface InteractiveCropBox {
  x: number; // Percent 0 - 100
  y: number; // Percent 0 - 100
  width: number; // Percent 0 - 100
  height: number; // Percent 0 - 100
}

export type CornerAnchor = "tl" | "tr" | "bl" | "br" | "edge-t" | "edge-b" | "edge-l" | "edge-r" | "center";

export interface InpaintRegion {
  id: string;
  name: string;
  x: number; // Percent 0 - 100
  y: number; // Percent 0 - 100
  width: number; // Percent 0 - 100
  height: number; // Percent 0 - 100
  blurStrength: number; // 1 to 25 px
  enabled: boolean;
}

export type TextFontFamily = "Inter, sans-serif" | "'Cinzel', serif" | "'Courier New', monospace" | "'Orbitron', sans-serif";

export interface TextOverlayTrack {
  id: string;
  text: string;
  x: number; // Percent 0 - 100
  y: number; // Percent 0 - 100
  fontSize: number;
  fontFamily: TextFontFamily;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  glowColor: string;
  glowRadius: number;
  bgColor: string;
  animation: "none" | "fade" | "typewriter";
  startTime: number;
  endTime: number;
}

export interface StickerOverlayTrack {
  id: string;
  emoji: string;
  x: number; // Percent 0 - 100
  y: number; // Percent 0 - 100
  size: number;
  rotation: number; // Degrees
  startTime: number;
  endTime: number;
}

export type TransitionType = "none" | "crossfade" | "whiteflash" | "glitch" | "rgbsplit" | "zoom";

export interface VideoSegment {
  id: string;
  name: string;
  start: number; // Seconds
  end: number; // Seconds
  speed: number;
  transition: TransitionType;
}

export type TrendingGenre = "Afrobeats" | "Phonk" | "Lofi" | "Synthwave";

export interface AudioTrackItem {
  id: string;
  title: string;
  artist: string;
  genre: TrendingGenre;
  bpm: number;
  startTime: number;
  duration: number;
  volume: number;
  isCustom: boolean;
  peaks: number[];
}

export type ColorFilterPreset = "none" | "cyberpunk" | "vintage" | "noir" | "golden" | "vhs";

export interface EditorSnapshot {
  crop: InteractiveCropBox;
  inpaintBoxes: InpaintRegion[];
  textList: TextOverlayTrack[];
  stickers: StickerOverlayTrack[];
  segments: VideoSegment[];
  filter: ColorFilterPreset;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  blur: number;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  duration: number;
  width: number;
  height: number;
}

// ============================================================================
// 2. CONSTANTS & SYSTEM PRESETS
// ============================================================================

const TELEGRAM_SUPPORT_URL = "https://t.me/Nostoc102";
const OWNER_PASSCODE_HASH = "NOSTOC777";
const DATABASE_NAME = "MarNostocEditor_DB";
const DB_VERSION = 1;
const USERS_STORE_NAME = "tenant_users";
const SNAP_THRESHOLD_SECONDS = 0.2;

const VIRAL_AUDIO_CATALOG: AudioTrackItem[] = [
  {
    id: "trk-amapiano-01",
    title: "Lagos Night Amapiano",
    artist: "Nostoc SoundLab",
    genre: "Afrobeats",
    bpm: 115,
    startTime: 0,
    duration: 30,
    volume: 0.85,
    isCustom: false,
    peaks: [18, 45, 90, 60, 20, 85, 100, 75, 30, 95, 80, 45, 15, 88, 70, 35],
  },
  {
    id: "trk-phonk-02",
    title: "Tokyo Drift Phonk 808",
    artist: "Vortex Cyber",
    genre: "Phonk",
    bpm: 142,
    startTime: 0,
    duration: 25,
    volume: 0.9,
    isCustom: false,
    peaks: [40, 85, 100, 95, 50, 90, 100, 88, 45, 92, 100, 85, 40, 95, 100, 90],
  },
  {
    id: "trk-lofi-03",
    title: "Midnight Lofi Nostalgia",
    artist: "Aura Beats",
    genre: "Lofi",
    bpm: 82,
    startTime: 0,
    duration: 35,
    volume: 0.75,
    isCustom: false,
    peaks: [10, 25, 40, 30, 15, 35, 50, 40, 20, 45, 35, 25, 15, 30, 40, 20],
  },
  {
    id: "trk-synth-04",
    title: "Cyber Horizon 1984",
    artist: "Obsidian Core",
    genre: "Synthwave",
    bpm: 126,
    startTime: 0,
    duration: 32,
    volume: 0.8,
    isCustom: false,
    peaks: [25, 60, 80, 70, 35, 75, 90, 85, 30, 80, 85, 75, 25, 70, 80, 65],
  },
];

const PRESET_WATERMARK_INPAINTS: InpaintRegion[] = [
  {
    id: "wp-tiktok-tl",
    name: "TikTok Top Left Tag",
    x: 4,
    y: 5,
    width: 28,
    height: 7,
    blurStrength: 14,
    enabled: true,
  },
  {
    id: "wp-tiktok-br",
    name: "TikTok Bottom Right ID",
    x: 68,
    y: 86,
    width: 28,
    height: 7,
    blurStrength: 14,
    enabled: true,
  },
  {
    id: "wp-ig-reels",
    name: "Reels / Shorts Overlay",
    x: 72,
    y: 78,
    width: 24,
    height: 8,
    blurStrength: 12,
    enabled: false,
  },
];

const STICKER_LIBRARY = [
  "🔥", "⚡", "✨", "🎬", "🚀", "💯", "❤️", "💎",
  "👑", "🎧", "👾", "🤖", "⭐", "🎉", "💥", "🎯"
];

// ============================================================================
// 3. SECURE PERSISTENT IDENTIFIER & INDEXEDDB ENGINE
// ============================================================================

function generateUUIDv4(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class TenantIdentityDatabase {
  private db: IDBDatabase | null = null;

  public async initialize(): Promise<void> {
    if (typeof window === "undefined" || !window.indexedDB) return;
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(DATABASE_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(USERS_STORE_NAME)) {
          const store = db.createObjectStore(USERS_STORE_NAME, { keyPath: "id" });
          store.createIndex("email", "email", { unique: true });
        }
      };
    });
  }

  public async getAllUsers(): Promise<UserRecord[]> {
    if (!this.db) await this.initialize();
    if (!this.db) return this.getFallbackUsers();
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(USERS_STORE_NAME, "readonly");
        const store = tx.objectStore(USERS_STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const results = req.result as UserRecord[];
          if (!results || results.length === 0) {
            const defaults = this.getFallbackUsers();
            defaults.forEach((u) => this.putUser(u));
            resolve(defaults);
          } else {
            resolve(results);
          }
        };
        req.onerror = () => resolve(this.getFallbackUsers());
      } catch {
        resolve(this.getFallbackUsers());
      }
    });
  }

  public async putUser(user: UserRecord): Promise<void> {
    if (!this.db) await this.initialize();
    if (!this.db) {
      this.saveFallbackUser(user);
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = this.db!.transaction(USERS_STORE_NAME, "readwrite");
        const store = tx.objectStore(USERS_STORE_NAME);
        store.put(user);
        tx.oncomplete = () => {
          this.saveFallbackUser(user);
          resolve();
        };
        tx.onerror = () => {
          this.saveFallbackUser(user);
          resolve();
        };
      } catch {
        this.saveFallbackUser(user);
        resolve();
      }
    });
  }

  private getFallbackUsers(): UserRecord[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem("marnostoc_fallback_tenants");
      if (raw) return JSON.parse(raw);
    } catch {}
    const defaultSeed: UserRecord[] = [
      {
        id: "a7c29e12-4290-4c31-9cf7-8bfa8319f001",
        email: "founder@nostoc.studio",
        name: "Nostoc Admin",
        tier: "Premium Pro",
        isBanned: false,
        createdAt: "2026-01-10T10:00:00.000Z",
        lastActive: new Date().toISOString(),
      },
      {
        id: "c8e41a90-7d23-45fa-b891-314de0fa2882",
        email: "creator@reelsmatrix.com",
        name: "Viral Producer",
        tier: "Free",
        isBanned: false,
        createdAt: "2026-03-01T14:20:00.000Z",
        lastActive: new Date().toISOString(),
      },
    ];
    this.persistFallback(defaultSeed);
    return defaultSeed;
  }

  private saveFallbackUser(user: UserRecord): void {
    const list = this.getFallbackUsers().filter((u) => u.id !== user.id);
    list.push(user);
    this.persistFallback(list);
  }

  private persistFallback(users: UserRecord[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("marnostoc_fallback_tenants", JSON.stringify(users));
    } catch {}
  }
}

const identityDB = new TenantIdentityDatabase();

// ============================================================================
// 4. MAIN MULTIMEDIA KERNEL COMPONENT: MarNostocEditor
// ============================================================================

export default function MarNostocEditor() {
  // --------------------------------------------------------------------------
  // A. SESSION, ADMIN & SECURITY CONTROL STATE
  // --------------------------------------------------------------------------
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);
  const [userList, setUserList] = useState<UserRecord[]>([]);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // Hidden Master Passthrough Dashboard State
  const [showAdminConsole, setShowAdminConsole] = useState<boolean>(false);
  const [adminPasscodeQuery, setAdminPasscodeQuery] = useState<string>("");
  const [adminAuthenticated, setAdminAuthenticated] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminUserSearch, setAdminUserSearch] = useState<string>("");
  const logoLongPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [longPressProgress, setLongPressProgress] = useState<number>(0);

  // Pro Upgrade Monetization Modal
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // B. NAVIGATION & TOOLBAR STATE
  // --------------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<
    "media" | "music" | "crop" | "inpaint" | "text" | "stickers" | "effects" | "transitions" | "speed" | "adjust"
  >("media");

  // --------------------------------------------------------------------------
  // C. MEDIA INGESTION & PLAYBACK SYNCHRONIZATION STATE
  // --------------------------------------------------------------------------
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [activeAssetId, setActiveAssetId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(12);
  const [timelineZoom, setTimelineZoom] = useState<number>(1);
  const [videoVolume, setVideoVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // D. UNRESTRICTED MULTI-TOUCH MANUAL CROP MATRIX STATE
  // --------------------------------------------------------------------------
  const [cropBox, setCropBox] = useState<InteractiveCropBox>({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [isCroppingActive, setIsCroppingActive] = useState<boolean>(true);
  const [showRuleOfThirds, setShowRuleOfThirds] = useState<boolean>(true);
  const activeAnchorRef = useRef<CornerAnchor | null>(null);
  const dragStartCoordRef = useRef<Vector2D>({ x: 0, y: 0 });
  const dragStartBoxRef = useRef<InteractiveCropBox>({ x: 0, y: 0, width: 100, height: 100 });

  // --------------------------------------------------------------------------
  // E. AI-INSPIRED WATERMARK REMOVAL (INPAINT BOXES)
  // --------------------------------------------------------------------------
  const [inpaintRegions, setInpaintRegions] = useState<InpaintRegion[]>(PRESET_WATERMARK_INPAINTS);
  const [selectedInpaintId, setSelectedInpaintId] = useState<string | null>("wp-tiktok-tl");
  const activeInpaintDragRef = useRef<{ id: string; handle: "body" | "br" } | null>(null);
  const inpaintDragStartRef = useRef<{ mouse: Vector2D; box: InpaintRegion }>({
    mouse: { x: 0, y: 0 },
    box: PRESET_WATERMARK_INPAINTS[0],
  });

  // --------------------------------------------------------------------------
  // F. ADVANCED TEXT, FONTS & STICKER OVERLAYS
  // --------------------------------------------------------------------------
  const [textTracks, setTextTracks] = useState<TextOverlayTrack[]>([
    {
      id: "txt-01",
      text: "VIRAL REELS MASTER",
      x: 50,
      y: 20,
      fontSize: 34,
      fontFamily: "'Orbitron', sans-serif",
      color: "#06B6D4",
      strokeColor: "#0B0F19",
      strokeWidth: 4,
      glowColor: "rgba(6, 182, 212, 0.7)",
      glowRadius: 16,
      bgColor: "rgba(11, 15, 25, 0.75)",
      animation: "typewriter",
      startTime: 0,
      endTime: 8,
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>("txt-01");

  const [stickerTracks, setStickerTracks] = useState<StickerOverlayTrack[]>([
    {
      id: "stk-01",
      emoji: "⚡",
      x: 82,
      y: 78,
      size: 54,
      rotation: 12,
      startTime: 1,
      endTime: 10,
    },
  ]);
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // G. MULTI-TRACK AUDIO & TRENDING SYNTHESIZER
  // --------------------------------------------------------------------------
  const [audioTracks, setAudioTracks] = useState<AudioTrackItem[]>([VIRAL_AUDIO_CATALOG[0]]);
  const [musicVolume, setMusicVolume] = useState<number>(0.85);
  const [previewingAudioId, setPreviewingAudioId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<AudioNode[]>([]);

  // --------------------------------------------------------------------------
  // H. TIMELINE SEGMENTS, SPLITTING & TRANSITIONS
  // --------------------------------------------------------------------------
  const [segments, setSegments] = useState<VideoSegment[]>([
    { id: "seg-base-1", name: "Segment 1", start: 0, end: 12, speed: 1.0, transition: "none" },
  ]);

  // --------------------------------------------------------------------------
  // I. COLOR GRADING & SHADER FILTER PRESETS
  // --------------------------------------------------------------------------
  const [activeFilter, setActiveFilter] = useState<ColorFilterPreset>("cyberpunk");
  const [brightness, setBrightness] = useState<number>(105);
  const [contrast, setContrast] = useState<number>(115);
  const [saturation, setSaturation] = useState<number>(120);
  const [hueRotate, setHueRotate] = useState<number>(0);
  const [blur, setBlur] = useState<number>(0);

  // --------------------------------------------------------------------------
  // J. PRO HISTORY SYSTEM (UNDO / REDO)
  // --------------------------------------------------------------------------
  const historyStackRef = useRef<EditorSnapshot[]>([]);
  const historyPointerRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // K. EXPORT ENGINE (1080P MEDIA RECORDER)
  // --------------------------------------------------------------------------
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);

  // --------------------------------------------------------------------------
  // L. HARDWARE DOM REFS
  // --------------------------------------------------------------------------
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);
  const mediaFileInputRef = useRef<HTMLInputElement | null>(null);
  const customAudioInputRef = useRef<HTMLInputElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // ==========================================================================
  // 5. ISOMORPHIC INITIALIZATION & AUTH HYDRATION
  // ==========================================================================

  const syncUsersFromDB = useCallback(async () => {
    try {
      const records = await identityDB.getAllUsers();
      setUserList(records);
      const cachedSessionId = localStorage.getItem("marnostoc_active_user_id");
      if (cachedSessionId) {
        const matching = records.find((u) => u.id === cachedSessionId);
        if (matching && !matching.isBanned) {
          setCurrentUser(matching);
          return;
        }
      }
      if (records.length > 0 && !records[0].isBanned) {
        setCurrentUser(records[0]);
      }
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    syncUsersFromDB();
  }, [syncUsersFromDB]);

  const recordSnapshot = useCallback(() => {
    const snapshot: EditorSnapshot = {
      crop: { ...cropBox },
      inpaintBoxes: inpaintRegions.map((b) => ({ ...b })),
      textList: textTracks.map((t) => ({ ...t })),
      stickers: stickerTracks.map((s) => ({ ...s })),
      segments: segments.map((sg) => ({ ...sg })),
      filter: activeFilter,
      brightness,
      contrast,
      saturation,
      hueRotate,
      blur,
    };
    const nextPointer = historyPointerRef.current + 1;
    const truncated = historyStackRef.current.slice(0, nextPointer);
    truncated.push(snapshot);
    if (truncated.length > 40) truncated.shift();
    historyStackRef.current = truncated;
    historyPointerRef.current = truncated.length - 1;
    setCanUndo(historyPointerRef.current > 0);
    setCanRedo(false);
  }, [cropBox, inpaintRegions, textTracks, stickerTracks, segments, activeFilter, brightness, contrast, saturation, hueRotate, blur]);

  const applySnapshot = (snap: EditorSnapshot) => {
    setCropBox({ ...snap.crop });
    setInpaintRegions(snap.inpaintBoxes.map((b) => ({ ...b })));
    setTextTracks(snap.textList.map((t) => ({ ...t })));
    setStickerTracks(snap.stickers.map((s) => ({ ...s })));
    setSegments(snap.segments.map((sg) => ({ ...sg })));
    setActiveFilter(snap.filter);
    setBrightness(snap.brightness);
    setContrast(snap.contrast);
    setSaturation(snap.saturation);
    setHueRotate(snap.hueRotate);
    setBlur(snap.blur);
  };

  const executeUndo = () => {
    if (historyPointerRef.current > 0) {
      historyPointerRef.current -= 1;
      const snap = historyStackRef.current[historyPointerRef.current];
      if (snap) applySnapshot(snap);
      setCanUndo(historyPointerRef.current > 0);
      setCanRedo(true);
    }
  };

  const executeRedo = () => {
    if (historyPointerRef.current < historyStackRef.current.length - 1) {
      historyPointerRef.current += 1;
      const snap = historyStackRef.current[historyPointerRef.current];
      if (snap) applySnapshot(snap);
      setCanUndo(true);
      setCanRedo(historyPointerRef.current < historyStackRef.current.length - 1);
    }
  };

  // ==========================================================================
  // 6. PROCEDURAL SAMPLE VIDEO INGESTION (INITIAL DEMO CANVAS STREAM)
  // ==========================================================================

  useEffect(() => {
    if (typeof window === "undefined") return;
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920; // Native 9:16 vertical reel standard
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const renderSynthFrame = () => {
      frame++;
      // Neon Cyberpunk Cyber-Grid
      const grad = ctx.createLinearGradient(0, 0, 1080, 1920);
      grad.addColorStop(0, "#0B0F19");
      grad.addColorStop(0.5, "#160B29");
      grad.addColorStop(1, "#022030");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1080, 1920);

      // Perspective Grid
      ctx.strokeStyle = "rgba(124, 58, 237, 0.35)";
      ctx.lineWidth = 3;
      const centerY = 1100;
      for (let y = centerY; y < 1920; y += 45) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1080, y);
        ctx.stroke();
      }
      for (let x = -200; x <= 1280; x += 110) {
        ctx.beginPath();
        ctx.moveTo(540, centerY - 200);
        ctx.lineTo(x, 1920);
        ctx.stroke();
      }

      // Dynamic Pulsing Sphere
      const pulse = Math.sin(frame * 0.05) * 40;
      ctx.save();
      ctx.shadowColor = "#06B6D4";
      ctx.shadowBlur = 50;
      ctx.fillStyle = "#06B6D4";
      ctx.beginPath();
      ctx.arc(540, 750, 160 + pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Simulated TikTok Watermark at Top-Left
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.font = "bold 44px sans-serif";
      ctx.fillText("TikTok @viral_creator", 60, 120);

      // Simulated Bottom-Right ID Tag
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.font = "bold 38px sans-serif";
      ctx.fillText("ID: 884910294", 760, 1800);

      // Hero Title
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 64px 'Orbitron', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("MARNOSTOC ENGINE", 540, 1050);
      ctx.font = "32px sans-serif";
      ctx.fillStyle = "#A78BFA";
      ctx.fillText("Client-Side 60FPS Multimedia Kernel", 540, 1120);
    };

    renderSynthFrame();
    const stream = canvas.captureStream(30);
    let recorder: MediaRecorder | null = null;
    try {
      recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
    } catch {
      return;
    }

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      const syntheticUrl = URL.createObjectURL(blob);
      const asset: MediaAsset = {
        id: "synthetic-reels-demo",
        name: "Cyberpunk_Viral_Reel_9x16.webm",
        url: syntheticUrl,
        thumbnail: canvas.toDataURL("image/jpeg", 0.6),
        duration: 12,
        width: 1080,
        height: 1920,
      };
      setMediaAssets([asset]);
      setActiveAssetId(asset.id);
      setDuration(12);
      setSegments([{ id: "seg-base-1", name: "Cyberpunk Reel", start: 0, end: 12, speed: 1.0, transition: "none" }]);
      recordSnapshot();
    };

    recorder.start();
    const interval = setInterval(() => {
      renderSynthFrame();
    }, 1000 / 30);

    setTimeout(() => {
      clearInterval(interval);
      if (recorder && recorder.state !== "inactive") recorder.stop();
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  // Update video element source on active asset change
  useEffect(() => {
    const asset = mediaAssets.find((a) => a.id === activeAssetId);
    if (videoRef.current && asset) {
      videoRef.current.src = asset.url;
      videoRef.current.load();
      setCurrentTime(0);
      setIsPlaying(false);
      setSegments([{ id: `seg_${Date.now()}`, name: asset.name, start: 0, end: asset.duration || 12, speed: 1.0, transition: "none" }]);
    }
  }, [activeAssetId, mediaAssets]);

  // ==========================================================================
  // 7. WEB AUDIO API SYNTHESIZER & REAL-TIME VIRAL SOUNDTRACKS
  // ==========================================================================

  const getAudioContext = useCallback((): AudioContext | null => {
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
  }, []);

  const stopSynthesizedAudio = useCallback(() => {
    synthNodesRef.current.forEach((node) => {
      try {
        if ("stop" in node && typeof (node as AudioScheduledSourceNode).stop === "function") {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {}
    });
    synthNodesRef.current = [];
  }, []);

  const playSynthesizedScore = useCallback(
    (genre: TrendingGenre, playDuration = 10) => {
      stopSynthesizedAudio();
      const ctx = getAudioContext();
      if (!ctx) return;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(musicVolume * 0.5, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const now = ctx.currentTime;
      const nodes: AudioNode[] = [masterGain];

      if (genre === "Afrobeats") {
        // Amapiano Log-Drum Deep Sub + Syncopated Rim
        for (let i = 0; i < playDuration * 2; i++) {
          const t = now + i * 0.5;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(84, t);
          osc.frequency.exponentialRampToValueAtTime(36, t + 0.38);
          gain.gain.setValueAtTime(0.85, t);
          gain.gain.linearRampToValueAtTime(0.001, t + 0.38);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.38);
          nodes.push(osc, gain);
        }
      } else if (genre === "Phonk") {
        // 808 Distorted Saw & High Cowbell
        for (let i = 0; i < playDuration * 3; i++) {
          const t = now + i * 0.33;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(i % 2 === 0 ? 587.33 : 659.25, t);
          gain.gain.setValueAtTime(0.35, t);
          gain.gain.linearRampToValueAtTime(0.001, t + 0.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.2);
          nodes.push(osc, gain);
        }
      } else if (genre === "Lofi") {
        // Electric Piano Mellow Triad
        const chordFrequencies = [261.63, 329.63, 392.0, 523.25];
        chordFrequencies.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.linearRampToValueAtTime(0.001, now + playDuration);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + playDuration);
          nodes.push(osc, gain);
        });
      } else if (genre === "Synthwave") {
        // Driving 16th Synth Bass
        for (let i = 0; i < playDuration * 4; i++) {
          const t = now + i * 0.25;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(110, t);
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.linearRampToValueAtTime(0.001, t + 0.22);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(t);
          osc.stop(t + 0.22);
          nodes.push(osc, gain);
        }
      }

      synthNodesRef.current = nodes;
    },
    [getAudioContext, musicVolume, stopSynthesizedAudio]
  );

  // ==========================================================================
  // 8. REAL-TIME SYNCHRONIZED COMPOSITOR PLAYBACK LOOP
  // ==========================================================================

  const applyInpaintContextAwareBlur = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    bw: number,
    bh: number,
    strength: number
  ) => {
    if (bw <= 0 || bh <= 0) return;
    try {
      // Step 1: Extract target region
      const imgData = ctx.getImageData(bx, by, bw, bh);
      const data = imgData.data;
      const w = imgData.width;
      const h = imgData.height;
      const radius = Math.max(2, Math.min(24, Math.floor(strength)));

      // Step 2: High-speed dual-pass box blur for real-time edge blending
      const copy = new Uint8ClampedArray(data);

      // Horizontal pass
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let k = -radius; k <= radius; k += 2) {
            const px = Math.min(w - 1, Math.max(0, x + k));
            const idx = (y * w + px) * 4;
            r += copy[idx];
            g += copy[idx + 1];
            b += copy[idx + 2];
            count++;
          }
          const targetIdx = (y * w + x) * 4;
          data[targetIdx] = r / count;
          data[targetIdx + 1] = g / count;
          data[targetIdx + 2] = b / count;
        }
      }

      // Vertical pass with context-aware median edge softening
      for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
          let r = 0, g = 0, b = 0, count = 0;
          for (let k = -radius; k <= radius; k += 2) {
            const py = Math.min(h - 1, Math.max(0, y + k));
            const idx = (py * w + x) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
          const targetIdx = (y * w + x) * 4;
          data[targetIdx] = r / count;
          data[targetIdx + 1] = g / count;
          data[targetIdx + 2] = b / count;
        }
      }

      ctx.putImageData(imgData, bx, by);

      // Context blend border ring
      ctx.save();
      ctx.strokeStyle = "rgba(6, 182, 212, 0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.restore();
    } catch {
      // Fallback simple fill for cross-origin or buffer limits
      ctx.save();
      ctx.fillStyle = "rgba(11, 15, 25, 0.9)";
      ctx.fillRect(bx, by, bw, bh);
      ctx.restore();
    }
  };

  const renderCompositedFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // A. Base Clear
    ctx.clearRect(0, 0, width, height);

    // B. Render Base Video (Subject to Crop Matrix)
    if (video && video.readyState >= 2) {
      ctx.save();

      // Color filters & adjustment matrix
      let filterCSS = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) hue-rotate(${hueRotate}deg)`;
      if (activeFilter === "cyberpunk") filterCSS += " saturate(190%) hue-rotate(295deg) contrast(145%)";
      if (activeFilter === "vintage") filterCSS += " sepia(65%) contrast(115%) brightness(88%)";
      if (activeFilter === "noir") filterCSS += " grayscale(100%) contrast(165%) brightness(82%)";
      if (activeFilter === "golden") filterCSS += " sepia(35%) saturate(145%) brightness(105%)";
      if (activeFilter === "vhs") filterCSS += " contrast(135%) hue-rotate(18deg) saturate(165%)";

      ctx.filter = filterCSS;

      // Coordinate Transform: 4-Corner Crop Window
      const vw = video.videoWidth || width;
      const vh = video.videoHeight || height;

      const sx = (cropBox.x / 100) * vw;
      const sy = (cropBox.y / 100) * vh;
      const sw = Math.max(10, (cropBox.width / 100) * vw);
      const sh = Math.max(10, (cropBox.height / 100) * vh);

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, width, height);
      ctx.restore();

      // C. Transition Shaders / Composites
      const currentSegment = segments.find((s) => currentTime >= s.start && currentTime <= s.end);
      if (currentSegment && currentSegment.transition !== "none") {
        const delta = currentTime - currentSegment.start;
        if (delta < 0.6) {
          const progress = 1 - delta / 0.6;
          if (currentSegment.transition === "whiteflash") {
            ctx.fillStyle = `rgba(255, 255, 255, ${progress * 0.95})`;
            ctx.fillRect(0, 0, width, height);
          } else if (currentSegment.transition === "crossfade") {
            ctx.fillStyle = `rgba(11, 15, 25, ${progress * 0.85})`;
            ctx.fillRect(0, 0, width, height);
          } else if (currentSegment.transition === "glitch" || currentSegment.transition === "rgbsplit") {
            // High-speed chromatic glitch slice
            const sliceH = Math.floor(height * 0.08);
            const sliceY = Math.floor(Math.random() * (height - sliceH));
            const shiftX = (Math.random() - 0.5) * 45 * progress;
            try {
              const slice = ctx.getImageData(0, sliceY, width, sliceH);
              ctx.putImageData(slice, shiftX, sliceY);
            } catch {}
          }
        }
      }

      // D. AI Watermark Erasure (Inpaint Bounding Matrix)
      inpaintRegions.forEach((region) => {
        if (!region.enabled) return;
        const bx = Math.floor((region.x / 100) * width);
        const by = Math.floor((region.y / 100) * height);
        const bw = Math.floor((region.width / 100) * width);
        const bh = Math.floor((region.height / 100) * height);
        applyInpaintContextAwareBlur(ctx, bx, by, bw, bh, region.blurStrength);
      });
    } else {
      // Standby Canvas Fallback
      ctx.fillStyle = "#0B0F19";
      ctx.fillRect(0, 0, width, height);
    }

    // E. Draggable Stickers Layer
    stickerTracks.forEach((sticker) => {
      if (currentTime >= sticker.startTime && currentTime <= sticker.endTime) {
        ctx.save();
        const px = (sticker.x / 100) * width;
        const py = (sticker.y / 100) * height;
        ctx.translate(px, py);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.font = `${sticker.size}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(sticker.emoji, 0, 0);
        ctx.restore();
      }
    });

    // F. Draggable Typography Overlays Layer
    textTracks.forEach((txt) => {
      if (currentTime >= txt.startTime && currentTime <= txt.endTime) {
        ctx.save();
        const px = (txt.x / 100) * width;
        const py = (txt.y / 100) * height;

        let content = txt.text;
        if (txt.animation === "typewriter") {
          const ratio = (currentTime - txt.startTime) / Math.max(0.1, txt.endTime - txt.startTime);
          const chars = Math.floor(ratio * txt.text.length);
          content = txt.text.substring(0, Math.max(1, chars));
        }

        ctx.font = `bold ${txt.fontSize}px ${txt.fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const metrics = ctx.measureText(content);
        const padX = txt.fontSize * 0.4;
        const padY = txt.fontSize * 0.25;

        // Background Box Pill
        if (txt.bgColor && txt.bgColor !== "transparent") {
          ctx.fillStyle = txt.bgColor;
          ctx.fillRect(
            px - metrics.width / 2 - padX,
            py - txt.fontSize / 2 - padY,
            metrics.width + padX * 2,
            txt.fontSize + padY * 2
          );
        }

        // Neon Glow Shadow
        if (txt.glowRadius > 0) {
          ctx.shadowColor = txt.glowColor;
          ctx.shadowBlur = txt.glowRadius;
        }

        // Outline Stroke
        if (txt.strokeWidth > 0) {
          ctx.strokeStyle = txt.strokeColor;
          ctx.lineWidth = txt.strokeWidth;
          ctx.strokeText(content, px, py);
        }

        // Core Text
        ctx.fillStyle = txt.color;
        ctx.fillText(content, px, py);
        ctx.restore();
      }
    });

    // G. Persistent Holographic Brand Burn-in ("MarNostoc")
    ctx.save();
    const brandText = "MarNostoc";
    const brandFontSize = 26;
    ctx.font = `900 ${brandFontSize}px 'Orbitron', sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";

    // Glow Effect
    ctx.shadowColor = "rgba(6, 182, 212, 0.9)";
    ctx.shadowBlur = 14;

    const brandX = width - 24;
    const brandY = height - 20;

    ctx.fillStyle = "rgba(6, 182, 212, 0.95)";
    ctx.fillText(brandText, brandX, brandY);

    ctx.font = `bold 12px sans-serif`;
    ctx.fillStyle = "rgba(167, 139, 250, 0.8)";
    ctx.fillText("PRO STUDIO", brandX, brandY - 28);
    ctx.restore();
  }, [
    brightness,
    contrast,
    saturation,
    blur,
    hueRotate,
    activeFilter,
    cropBox,
    segments,
    currentTime,
    inpaintRegions,
    stickerTracks,
    textTracks,
  ]);

  // RequestAnimationFrame Synchronous Compositor Loop
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      if (videoRef.current && !videoRef.current.paused) {
        setCurrentTime(videoRef.current.currentTime);
      }
      renderCompositedFrame();
      animationFrameIdRef.current = requestAnimationFrame(loop);
    };
    animationFrameIdRef.current = requestAnimationFrame(loop);
    return () => {
      active = false;
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [renderCompositedFrame]);

  // Play / Pause Master Controller
  const toggleMasterPlayback = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      stopSynthesizedAudio();
    } else {
      try {
        getAudioContext();
        await video.play();
        setIsPlaying(true);
        const primaryTrack = audioTracks[0];
        if (primaryTrack && primaryTrack.genre) {
          playSynthesizedScore(primaryTrack.genre, primaryTrack.duration);
        }
      } catch {
        // Autoplay policy: fallback to muted execution
        video.muted = true;
        setIsMuted(true);
        await video.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying, getAudioContext, stopSynthesizedAudio, audioTracks, playSynthesizedScore]);

  // ==========================================================================
  // 9. UNRESTRICTED MULTI-TOUCH MANUAL CROP MATRIX GESTURES
  // ==========================================================================

  const handleCropPointerDown = (anchor: CornerAnchor, e: ReactPointerEvent) => {
    e.stopPropagation();
    activeAnchorRef.current = anchor;
    dragStartCoordRef.current = { x: e.clientX, y: e.clientY };
    dragStartBoxRef.current = { ...cropBox };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCropPointerMove = (e: ReactPointerEvent) => {
    if (!activeAnchorRef.current || !previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - dragStartCoordRef.current.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - dragStartCoordRef.current.y) / rect.height) * 100;
    const initial = dragStartBoxRef.current;
    const anchor = activeAnchorRef.current;

    setCropBox(() => {
      let nx = initial.x;
      let ny = initial.y;
      let nw = initial.width;
      let nh = initial.height;

      if (anchor === "tl") {
        nx = Math.min(initial.x + deltaXPercent, initial.x + initial.width - 10);
        ny = Math.min(initial.y + deltaYPercent, initial.y + initial.height - 10);
        nw = initial.width - (nx - initial.x);
        nh = initial.height - (ny - initial.y);
      } else if (anchor === "tr") {
        ny = Math.min(initial.y + deltaYPercent, initial.y + initial.height - 10);
        nw = Math.max(10, initial.width + deltaXPercent);
        nh = initial.height - (ny - initial.y);
      } else if (anchor === "bl") {
        nx = Math.min(initial.x + deltaXPercent, initial.x + initial.width - 10);
        nw = initial.width - (nx - initial.x);
        nh = Math.max(10, initial.height + deltaYPercent);
      } else if (anchor === "br") {
        nw = Math.max(10, initial.width + deltaXPercent);
        nh = Math.max(10, initial.height + deltaYPercent);
      } else if (anchor === "center") {
        nx = Math.max(0, Math.min(100 - initial.width, initial.x + deltaXPercent));
        ny = Math.max(0, Math.min(100 - initial.height, initial.y + deltaYPercent));
      }

      return {
        x: Math.max(0, Math.min(90, nx)),
        y: Math.max(0, Math.min(90, ny)),
        width: Math.max(10, Math.min(100 - nx, nw)),
        height: Math.max(10, Math.min(100 - ny, nh)),
      };
    });
  };

  const handleCropPointerUp = () => {
    if (activeAnchorRef.current) {
      activeAnchorRef.current = null;
      recordSnapshot();
    }
  };

  // Inpaint Bounding Box Pointer Gesture Handlers
  const handleInpaintPointerDown = (id: string, handle: "body" | "br", e: ReactPointerEvent) => {
    e.stopPropagation();
    const box = inpaintRegions.find((b) => b.id === id);
    if (!box) return;
    setSelectedInpaintId(id);
    activeInpaintDragRef.current = { id, handle };
    inpaintDragStartRef.current = {
      mouse: { x: e.clientX, y: e.clientY },
      box: { ...box },
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleInpaintPointerMove = (e: ReactPointerEvent) => {
    if (!activeInpaintDragRef.current || !previewContainerRef.current) return;
    const { id, handle } = activeInpaintDragRef.current;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - inpaintDragStartRef.current.mouse.x) / rect.width) * 100;
    const deltaY = ((e.clientY - inpaintDragStartRef.current.mouse.y) / rect.height) * 100;
    const init = inpaintDragStartRef.current.box;

    setInpaintRegions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (handle === "body") {
          return {
            ...item,
            x: Math.max(0, Math.min(100 - init.width, init.x + deltaX)),
            y: Math.max(0, Math.min(100 - init.height, init.y + deltaY)),
          };
        } else {
          return {
            ...item,
            width: Math.max(5, Math.min(100 - item.x, init.width + deltaX)),
            height: Math.max(4, Math.min(100 - item.y, init.height + deltaY)),
          };
        }
      })
    );
  };

  const handleInpaintPointerUp = () => {
    if (activeInpaintDragRef.current) {
      activeInpaintDragRef.current = null;
      recordSnapshot();
    }
  };

  // ==========================================================================
  // 10. TIMELINE ACTIONS: SPLIT, DUPLICATE, TRIM & SNAP
  // ==========================================================================

  const executeSplitSegment = () => {
    const cut = currentTime;
    const index = segments.findIndex((s) => cut > s.start && cut < s.end);
    if (index !== -1) {
      const seg = segments[index];
      const left: VideoSegment = {
        id: `seg_${Date.now()}_l`,
        name: `${seg.name} (A)`,
        start: seg.start,
        end: cut,
        speed: seg.speed,
        transition: seg.transition,
      };
      const right: VideoSegment = {
        id: `seg_${Date.now()}_r`,
        name: `${seg.name} (B)`,
        start: cut,
        end: seg.end,
        speed: seg.speed,
        transition: "crossfade",
      };
      const nextSegs = [...segments];
      nextSegs.splice(index, 1, left, right);
      setSegments(nextSegs);
      recordSnapshot();
    }
  };

  const executeDuplicateSegment = () => {
    const cur = segments.find((s) => currentTime >= s.start && currentTime <= s.end);
    if (!cur) return;
    const dur = cur.end - cur.start;
    const duplicate: VideoSegment = {
      id: `seg_${Date.now()}_dup`,
      name: `${cur.name} (Copy)`,
      start: cur.end,
      end: cur.end + dur,
      speed: cur.speed,
      transition: "none",
    };
    setSegments((prev) => [...prev, duplicate]);
    recordSnapshot();
  };

  const executeDeleteSegment = () => {
    if (segments.length <= 1) return;
    const filtered = segments.filter((s) => !(currentTime >= s.start && currentTime <= s.end));
    if (filtered.length > 0) {
      setSegments(filtered);
      setCurrentTime(filtered[0].start);
      if (videoRef.current) videoRef.current.currentTime = filtered[0].start;
      recordSnapshot();
    }
  };

  // Timeline Scrubber Pointer scrub
  const isTimelineScrubbingRef = useRef<boolean>(false);
  const handleTimelineScrubDown = (e: ReactPointerEvent) => {
    isTimelineScrubbingRef.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    seekPlayheadByPointer(e);
  };

  const handleTimelineScrubMove = (e: ReactPointerEvent) => {
    if (isTimelineScrubbingRef.current) seekPlayheadByPointer(e);
  };

  const handleTimelineScrubUp = () => {
    isTimelineScrubbingRef.current = false;
  };

  const seekPlayheadByPointer = (e: ReactPointerEvent) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    let target = ratio * duration;

    // Magnetic Snapping
    const snapCandidates = [0, duration, ...segments.map((s) => s.start), ...segments.map((s) => s.end)];
    for (const snapPt of snapCandidates) {
      if (Math.abs(target - snapPt) <= SNAP_THRESHOLD_SECONDS) {
        target = snapPt;
        break;
      }
    }

    setCurrentTime(target);
    if (videoRef.current) videoRef.current.currentTime = target;
  };

  // ==========================================================================
  // 11. HIGH-BITRATE 1080P EXPORT ENGINE
  // ==========================================================================

  const executeExportVideo = async () => {
    if (!videoRef.current || isExporting) return;
    setIsExporting(true);
    setExportProgress(0);

    const video = videoRef.current;
    const wasPlaying = !video.paused;
    video.pause();

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920; // High-Fidelity Reels 9:16
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) {
      setIsExporting(false);
      return;
    }

    const audioCtx = getAudioContext();
    const dest = audioCtx ? audioCtx.createMediaStreamDestination() : null;
    const canvasStream = canvas.captureStream(60);

    const mergedTracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()];
    if (dest && dest.stream.getAudioTracks().length > 0) {
      mergedTracks.push(...dest.stream.getAudioTracks());
    }

    const exportStream = new MediaStream(mergedTracks);
    const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
      ? "video/mp4;codecs=avc1"
      : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";

    const recorder = new MediaRecorder(exportStream, {
      mimeType,
      videoBitsPerSecond: 14000000, // 14 Mbps
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `MarNostoc_ViralReels_${Date.now()}.${mimeType.includes("mp4") ? "mp4" : "webm"}`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      setIsExporting(false);
      setExportProgress(100);
      if (wasPlaying) video.play();
    };

    recorder.start();

    const fps = 30;
    const totalFrames = Math.floor(duration * fps);
    let frame = 0;

    const exportFrameStep = async () => {
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

      // Composite to export canvas
      ctx.save();
      let filterCSS = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) hue-rotate(${hueRotate}deg)`;
      if (activeFilter === "cyberpunk") filterCSS += " saturate(190%) hue-rotate(295deg) contrast(145%)";
      if (activeFilter === "vintage") filterCSS += " sepia(65%) contrast(115%) brightness(88%)";
      if (activeFilter === "noir") filterCSS += " grayscale(100%) contrast(165%) brightness(82%)";
      if (activeFilter === "golden") filterCSS += " sepia(35%) saturate(145%) brightness(105%)";
      if (activeFilter === "vhs") filterCSS += " contrast(135%) hue-rotate(18deg) saturate(165%)";
      ctx.filter = filterCSS;

      const vw = video.videoWidth || 1080;
      const vh = video.videoHeight || 1920;
      const sx = (cropBox.x / 100) * vw;
      const sy = (cropBox.y / 100) * vh;
      const sw = Math.max(10, (cropBox.width / 100) * vw);
      const sh = Math.max(10, (cropBox.height / 100) * vh);

      ctx.drawImage(video, sx, sy, sw, sh, 0, 0, 1080, 1920);
      ctx.restore();

      // Inpaint Watermark Erasure
      inpaintRegions.forEach((reg) => {
        if (!reg.enabled) return;
        const bx = Math.floor((reg.x / 100) * 1080);
        const by = Math.floor((reg.y / 100) * 1920);
        const bw = Math.floor((reg.width / 100) * 1080);
        const bh = Math.floor((reg.height / 100) * 1920);
        applyInpaintContextAwareBlur(ctx, bx, by, bw, bh, reg.blurStrength);
      });

      // Stickers
      stickerTracks.forEach((stk) => {
        if (t >= stk.startTime && t <= stk.endTime) {
          ctx.save();
          const px = (stk.x / 100) * 1080;
          const py = (stk.y / 100) * 1920;
          ctx.translate(px, py);
          ctx.rotate((stk.rotation * Math.PI) / 180);
          ctx.font = `${stk.size * 1.8}px serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(stk.emoji, 0, 0);
          ctx.restore();
        }
      });

      // Text Overlays
      textTracks.forEach((txt) => {
        if (t >= txt.startTime && t <= txt.endTime) {
          ctx.save();
          const px = (txt.x / 100) * 1080;
          const py = (txt.y / 100) * 1920;
          const scaledFont = Math.floor(txt.fontSize * 1.7);
          ctx.font = `bold ${scaledFont}px ${txt.fontFamily}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          let txtContent = txt.text;
          if (txt.animation === "typewriter") {
            const ratio = (t - txt.startTime) / Math.max(0.1, txt.endTime - txt.startTime);
            txtContent = txt.text.substring(0, Math.floor(ratio * txt.text.length));
          }

          if (txt.bgColor && txt.bgColor !== "transparent") {
            const metrics = ctx.measureText(txtContent);
            ctx.fillStyle = txt.bgColor;
            ctx.fillRect(px - metrics.width / 2 - 20, py - scaledFont / 2 - 10, metrics.width + 40, scaledFont + 20);
          }

          if (txt.strokeWidth > 0) {
            ctx.strokeStyle = txt.strokeColor;
            ctx.lineWidth = txt.strokeWidth * 1.8;
            ctx.strokeText(txtContent, px, py);
          }

          ctx.fillStyle = txt.color;
          ctx.fillText(txtContent, px, py);
          ctx.restore();
        }
      });

      // Hardcoded Brand Stamp ("MarNostoc")
      ctx.save();
      ctx.font = "900 42px 'Orbitron', sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(6, 182, 212, 0.95)";
      ctx.shadowColor = "rgba(6, 182, 212, 0.8)";
      ctx.shadowBlur = 18;
      ctx.fillText("MarNostoc", 1080 - 40, 1920 - 40);
      ctx.restore();

      frame++;
      setExportProgress(Math.floor((frame / totalFrames) * 100));
      setTimeout(exportFrameStep, 10);
    };

    exportFrameStep();
  };

  // ==========================================================================
  // 12. HIDDEN OWNER PASSTHROUGH LOGO LONG-PRESS DETECTOR
  // ==========================================================================

  const startLogoLongPress = () => {
    setLongPressProgress(0);
    const start = Date.now();
    logoLongPressTimer.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.floor((elapsed / 5000) * 100));
      setLongPressProgress(pct);
      if (elapsed >= 5000) {
        if (logoLongPressTimer.current) clearInterval(logoLongPressTimer.current);
        setLongPressProgress(0);
        setShowAdminConsole(true);
      }
    }, 100);
  };

  const cancelLogoLongPress = () => {
    if (logoLongPressTimer.current) {
      clearInterval(logoLongPressTimer.current);
      logoLongPressTimer.current = null;
    }
    setLongPressProgress(0);
  };

  const verifyAdminPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscodeQuery === OWNER_PASSCODE_HASH) {
      setAdminAuthenticated(true);
      setAdminError(null);
    } else {
      setAdminError("Access Denied: Invalid Master Passcode");
    }
  };

  const toggleUserSubscriptionTier = async (userId: string) => {
    const updated = userList.map((u) => {
      if (u.id === userId) {
        const nextTier: SubscriptionTier = u.tier === "Free" ? "Premium Pro" : "Free";
        return { ...u, tier: nextTier };
      }
      return u;
    });
    setUserList(updated);
    const target = updated.find((u) => u.id === userId);
    if (target) await identityDB.putUser(target);
    if (currentUser?.id === userId && target) setCurrentUser(target);
  };

  const toggleUserBan = async (userId: string) => {
    const updated = userList.map((u) => {
      if (u.id === userId) {
        return { ...u, isBanned: !u.isBanned };
      }
      return u;
    });
    setUserList(updated);
    const target = updated.find((u) => u.id === userId);
    if (target) await identityDB.putUser(target);
    if (currentUser?.id === userId && target && target.isBanned) {
      setCurrentUser(null);
    }
  };

  // ==========================================================================
  // 13. UI HELPER CALCULATIONS & FORMATTING
  // ==========================================================================

  const formatTimestamp = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${ms}`;
  };

  const filteredAdminUsers = useMemo(() => {
    if (!adminUserSearch) return userList;
    const q = adminUserSearch.toLowerCase();
    return userList.filter((u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q) || u.id.includes(q));
  }, [userList, adminUserSearch]);

  // ==========================================================================
  // 14. JSX VIEWPORT RENDER
  // ==========================================================================

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F19] text-white select-none overflow-hidden font-sans">
      {/* -------------------------------------------------------------------- */}
      {/* HEADER: LOGO, BRAND, LONG-PRESS OWNER TRIGGER & CONTROLS            */}
      {/* -------------------------------------------------------------------- */}
      <header className="h-14 border-b border-[#1E293B] bg-[#0E1322] px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center space-x-3">
          {/* Logo with 5-Second Long-Press Trigger */}
          <div
            onPointerDown={startLogoLongPress}
            onPointerUp={cancelLogoLongPress}
            onPointerLeave={cancelLogoLongPress}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] font-black text-black text-sm cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95 transition-transform"
            title="Long-press for 5s to launch Owner Admin Console"
          >
            MN
            {longPressProgress > 0 && (
              <div
                className="absolute -bottom-1 left-0 h-1 bg-[#06B6D4] rounded-full transition-all"
                style={{ width: `${longPressProgress}%` }}
              />
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-cyan-100 to-[#06B6D4] bg-clip-text text-transparent">
                MarNostocEditor
              </span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 border ${
                  currentUser?.tier === "Premium Pro"
                    ? "bg-amber-950/80 border-amber-500/50 text-amber-300"
                    : "bg-cyan-950/80 border-cyan-700/50 text-cyan-300"
                }`}
              >
                {currentUser?.tier === "Premium Pro" ? (
                  <>
                    <Crown className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> PRO VIP
                  </>
                ) : (
                  "FREE ENGINE"
                )}
              </span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono tracking-tight">
              App Owner: <strong className="text-zinc-300">Nostoc</strong>
            </span>
          </div>
        </div>

        {/* Global Action Triggers */}
        <div className="flex items-center space-x-2.5">
          {/* Undo / Redo */}
          <button
            onClick={executeUndo}
            disabled={!canUndo}
            className={`p-2 rounded-lg border border-[#1E293B] ${
              canUndo ? "text-zinc-300 hover:bg-[#1A2234]" : "text-zinc-600 cursor-not-allowed"
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={executeRedo}
            disabled={!canRedo}
            className={`p-2 rounded-lg border border-[#1E293B] ${
              canRedo ? "text-zinc-300 hover:bg-[#1A2234]" : "text-zinc-600 cursor-not-allowed"
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          {/* Upgrade Banner Button */}
          {currentUser?.tier !== "Premium Pro" && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold text-xs shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95 transition"
            >
              <Crown className="w-3.5 h-3.5 fill-black" />
              <span>Go Pro</span>
            </button>
          )}

          {/* User Profile / Auth Toggle */}
          {currentUser ? (
            <div className="flex items-center gap-2 border-l border-[#1E293B] pl-2.5">
              <span className="text-xs text-zinc-300 font-medium truncate max-w-[110px] hidden sm:block">
                {currentUser.name}
              </span>
              <button
                onClick={() => {
                  setCurrentUser(null);
                  localStorage.removeItem("marnostoc_active_user_id");
                }}
                className="p-1.5 rounded-lg bg-[#1A2234] hover:bg-red-950/40 text-zinc-400 hover:text-red-300"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A2234] hover:bg-[#253046] text-cyan-300 text-xs font-semibold border border-[#2B3852]"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* 1080p Export Trigger */}
          <button
            onClick={executeExportVideo}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-lg transition active:scale-95 ${
              isExporting
                ? "bg-zinc-800 text-zinc-400 cursor-not-allowed"
                : "bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white hover:brightness-110 shadow-cyan-500/25"
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Exporting ({exportProgress}%)</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Reel</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* WORKSPACE: LEFT NAV TABS + ACCORDION DRAWER + PREVIEW VIEWPORT      */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <nav className="w-16 border-r border-[#1E293B] bg-[#0A0D17] flex flex-col items-center py-3 space-y-3.5 z-20 shrink-0">
          {[
            { id: "media", icon: Film, label: "Media" },
            { id: "music", icon: Radio, label: "Audio" },
            { id: "crop", icon: Crop, label: "Crop" },
            { id: "inpaint", icon: Wand2, label: "Eraser" },
            { id: "text", icon: Type, label: "Text" },
            { id: "stickers", icon: Smile, label: "Sticker" },
            { id: "effects", icon: Sparkles, label: "Effects" },
            { id: "transitions", icon: Scissors, label: "Trans" },
            { id: "speed", icon: FastForward, label: "Speed" },
            { id: "adjust", icon: Sliders, label: "Adjust" },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition ${
                  isSelected ? "text-[#06B6D4]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <div
                  className={`p-2 rounded-xl transition ${
                    isSelected ? "bg-[#06B6D4]/15 border border-[#06B6D4]/40" : "hover:bg-[#161E2E]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tools Drawer */}
        <aside className="w-80 border-r border-[#1E293B] bg-[#0E1322] flex flex-col overflow-y-auto p-4 z-10 shrink-0">
          {/* 1. MEDIA TAB */}
          {activeTab === "media" && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-100">Media Ingestion</h3>
                <span className="text-xs text-zinc-500">{mediaAssets.length} clips</span>
              </div>

              {/* OPFS / Standard Upload */}
              <div
                onClick={() => mediaFileInputRef.current?.click()}
                className="border-2 border-dashed border-[#2B3852] hover:border-[#06B6D4] bg-[#0B0F19] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition"
              >
                <div className="w-10 h-10 rounded-full bg-[#1A2234] flex items-center justify-center text-[#06B6D4] mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-zinc-200">Import Video File</span>
                <span className="text-[10px] text-zinc-500 mt-1">Chunked Streaming for Android 10+</span>
                <input
                  type="file"
                  ref={mediaFileInputRef}
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    Array.from(files).forEach((file) => {
                      const url = URL.createObjectURL(file);
                      const temp = document.createElement("video");
                      temp.src = url;
                      temp.muted = true;
                      temp.onloadeddata = () => {
                        temp.currentTime = 0.5;
                      };
                      temp.onseeked = () => {
                        const c = document.createElement("canvas");
                        c.width = 160;
                        c.height = 90;
                        const cx = c.getContext("2d");
                        if (cx) cx.drawImage(temp, 0, 0, 160, 90);
                        const asset: MediaAsset = {
                          id: `media_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                          name: file.name,
                          url,
                          thumbnail: c.toDataURL("image/jpeg", 0.7),
                          duration: temp.duration || 12,
                          width: temp.videoWidth || 1080,
                          height: temp.videoHeight || 1920,
                        };
                        setMediaAssets((prev) => [asset, ...prev]);
                        setActiveAssetId(asset.id);
                        setDuration(asset.duration || 12);
                      };
                    });
                  }}
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
                        isActive ? "border-[#06B6D4] ring-2 ring-[#06B6D4]/40" : "border-[#1E293B]"
                      }`}
                    >
                      <img src={asset.thumbnail} alt={asset.name} className="w-full h-24 object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                        <span className="text-[10px] text-white font-medium truncate">{asset.name}</span>
                        <span className="text-[9px] text-zinc-400">{formatTimestamp(asset.duration)}</span>
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 bg-[#06B6D4] text-black rounded-full p-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. AUDIO & TRENDING SOUNDS TAB */}
          {activeTab === "music" && (
            <div className="flex flex-col space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                    <Disc3 className="w-4 h-4 text-[#06B6D4] animate-spin" /> Viral Soundtrack Lab
                  </h3>
                  <span className="text-[10px] text-zinc-400">Web Audio Synthesized Stems</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {VIRAL_AUDIO_CATALOG.map((item) => {
                  const isPreviewing = previewingAudioId === item.id;
                  const isAttached = audioTracks.some((a) => a.title === item.title);
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#0B0F19] border border-[#1E293B] flex flex-col space-y-2 hover:border-[#2B3852] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white block text-xs">{item.title}</span>
                          <span className="text-[10px] text-[#06B6D4]">
                            {item.artist} • {item.bpm} BPM
                          </span>
                        </div>
                        <span className="text-[9px] bg-[#1E293B] text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                          {item.genre}
                        </span>
                      </div>

                      {/* Waveform Visualization Bars */}
                      <div className="flex items-end gap-1 h-6 bg-[#0E1322] px-2 py-1 rounded">
                        {item.peaks.map((p, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-[#7C3AED] to-[#06B6D4] rounded-t"
                            style={{ height: `${p}%` }}
                          />
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => {
                            if (isPreviewing) {
                              stopSynthesizedAudio();
                              setPreviewingAudioId(null);
                            } else {
                              setPreviewingAudioId(item.id);
                              playSynthesizedScore(item.genre, 12);
                            }
                          }}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs transition ${
                            isPreviewing
                              ? "bg-[#06B6D4] text-black"
                              : "bg-[#1E293B] text-zinc-300 hover:text-white"
                          }`}
                        >
                          {isPreviewing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                          <span>{isPreviewing ? "Stop" : "Preview"}</span>
                        </button>
                        <button
                          onClick={() => {
                            setAudioTracks([item]);
                            stopSynthesizedAudio();
                            setPreviewingAudioId(null);
                            recordSnapshot();
                          }}
                          disabled={isAttached}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                            isAttached
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                              : "bg-[#7C3AED]/30 text-purple-200 border border-[#7C3AED]/50 hover:bg-[#7C3AED]/50"
                          }`}
                        >
                          {isAttached ? "In Timeline" : "+ Add"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Volume Slider */}
              <div className="pt-3 border-t border-[#1E293B] space-y-2">
                <div className="flex justify-between text-zinc-400">
                  <span>Soundtrack Volume</span>
                  <span>{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(Number(e.target.value))}
                  className="w-full h-1 bg-[#1E293B] rounded accent-[#06B6D4]"
                />
              </div>
            </div>
          )}

          {/* 3. UNRESTRICTED MULTI-TOUCH MANUAL CROP TAB */}
          {activeTab === "crop" && (
            <div className="flex flex-col space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-sm text-zinc-100">Manual Vector Cropping</h3>
                <span className="text-[10px] text-zinc-400">Free-form 4-vertex bounding anchor mapping</span>
              </div>

              <div className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Crop Overlay State</span>
                  <button
                    onClick={() => setIsCroppingActive((a) => !a)}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      isCroppingActive ? "bg-[#06B6D4] text-black" : "bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {isCroppingActive ? "Active" : "Hidden"}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">Rule of Thirds Grid</span>
                  <input
                    type="checkbox"
                    checked={showRuleOfThirds}
                    onChange={(e) => setShowRuleOfThirds(e.target.checked)}
                    className="w-4 h-4 accent-[#06B6D4] rounded"
                  />
                </div>
              </div>

              {/* Pixel Coordinates Display */}
              <div className="p-3 bg-[#0B0F19] border border-[#1E293B] rounded-xl space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-zinc-400">
                  <span>Origin X: {cropBox.x.toFixed(1)}%</span>
                  <span>Origin Y: {cropBox.y.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Width: {cropBox.width.toFixed(1)}%</span>
                  <span>Height: {cropBox.height.toFixed(1)}%</span>
                </div>
                <button
                  onClick={() => {
                    setCropBox({ x: 0, y: 0, width: 100, height: 100 });
                    recordSnapshot();
                  }}
                  className="w-full py-1.5 mt-2 bg-[#1E293B] hover:bg-[#2B3852] text-zinc-200 rounded font-bold"
                >
                  Reset Full Canvas (100%)
                </button>
              </div>
            </div>
          )}

          {/* 4. AI-INSPIRED WATERMARK REMOVAL (INPAINT BOXES) */}
          {activeTab === "inpaint" && (
            <div className="flex flex-col space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                  <Wand2 className="w-4 h-4 text-[#06B6D4]" /> Watermark Eraser Matrix
                </h3>
                <span className="text-[10px] text-zinc-400">Context-Aware Median Edge Blurring</span>
              </div>

              <div className="space-y-2.5">
                {inpaintRegions.map((box) => (
                  <div
                    key={box.id}
                    onClick={() => setSelectedInpaintId(box.id)}
                    className={`p-3 rounded-xl border transition ${
                      selectedInpaintId === box.id
                        ? "bg-[#0B0F19] border-[#06B6D4]"
                        : "bg-[#0B0F19]/60 border-[#1E293B]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-white">{box.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInpaintRegions((prev) =>
                            prev.map((b) => (b.id === box.id ? { ...b, enabled: !b.enabled } : b))
                          );
                          recordSnapshot();
                        }}
                        className={`p-1 rounded ${box.enabled ? "text-[#06B6D4]" : "text-zinc-600"}`}
                      >
                        {box.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-zinc-400 text-[10px]">
                        <span>Blur Kernel Strength</span>
                        <span>{box.blurStrength}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="25"
                        value={box.blurStrength}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setInpaintRegions((prev) =>
                            prev.map((b) => (b.id === box.id ? { ...b, blurStrength: val } : b))
                          );
                        }}
                        className="w-full h-1 bg-[#1E293B] rounded accent-[#06B6D4]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const newBox: InpaintRegion = {
                    id: `inpaint_${Date.now()}`,
                    name: `Custom Inpaint ${inpaintRegions.length + 1}`,
                    x: 35,
                    y: 45,
                    width: 30,
                    height: 10,
                    blurStrength: 14,
                    enabled: true,
                  };
                  setInpaintRegions((prev) => [...prev, newBox]);
                  setSelectedInpaintId(newBox.id);
                  recordSnapshot();
                }}
                className="w-full py-2 rounded-lg bg-[#7C3AED]/20 border border-[#7C3AED]/40 text-purple-200 font-bold hover:bg-[#7C3AED]/30 transition"
              >
                + Add Inpaint Selector Box
              </button>
            </div>
          )}

          {/* 5. ADVANCED TYPOGRAPHY TAB */}
          {activeTab === "text" && (
            <div className="flex flex-col space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-100">Typography Suite</h3>
                <button
                  onClick={() => {
                    const newTxt: TextOverlayTrack = {
                      id: `txt_${Date.now()}`,
                      text: "VIRAL REELS HOOK",
                      x: 50,
                      y: 50,
                      fontSize: 32,
                      fontFamily: "'Orbitron', sans-serif",
                      color: "#FFFFFF",
                      strokeColor: "#000000",
                      strokeWidth: 3,
                      glowColor: "rgba(6, 182, 212, 0.8)",
                      glowRadius: 14,
                      bgColor: "rgba(11, 15, 25, 0.6)",
                      animation: "fade",
                      startTime: currentTime,
                      endTime: Math.min(duration, currentTime + 5),
                    };
                    setTextTracks((prev) => [...prev, newTxt]);
                    setSelectedTextId(newTxt.id);
                    recordSnapshot();
                  }}
                  className="flex items-center gap-1 bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/30 px-2 py-1 rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Text
                </button>
              </div>

              {selectedTextId ? (
                (() => {
                  const target = textTracks.find((t) => t.id === selectedTextId);
                  if (!target) return null;
                  return (
                    <div className="space-y-3 bg-[#0B0F19] p-3 rounded-xl border border-[#1E293B]">
                      <div>
                        <label className="text-zinc-400 block mb-1">Text String</label>
                        <input
                          type="text"
                          value={target.text}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTextTracks((prev) => prev.map((t) => (t.id === target.id ? { ...t, text: val } : t)));
                          }}
                          className="w-full bg-[#161E2E] border border-[#2B3852] rounded px-2.5 py-1.5 text-white"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1">Font Family</label>
                        <select
                          value={target.fontFamily}
                          onChange={(e) => {
                            const val = e.target.value as TextFontFamily;
                            setTextTracks((prev) =>
                              prev.map((t) => (t.id === target.id ? { ...t, fontFamily: val } : t))
                            );
                            recordSnapshot();
                          }}
                          className="w-full bg-[#161E2E] border border-[#2B3852] rounded px-2 py-1.5 text-white"
                        >
                          <option value="'Orbitron', sans-serif">Futuristic Neon (Orbitron)</option>
                          <option value="Inter, sans-serif">Modern Sans (Inter)</option>
                          <option value="'Cinzel', serif">Luxury Serif (Cinzel)</option>
                          <option value="'Courier New', monospace">Terminal Monospace</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-400 mb-1">
                          <span>Font Size</span>
                          <span>{target.fontSize}px</span>
                        </div>
                        <input
                          type="range"
                          min="16"
                          max="72"
                          value={target.fontSize}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setTextTracks((prev) =>
                              prev.map((t) => (t.id === target.id ? { ...t, fontSize: val } : t))
                            );
                          }}
                          className="w-full h-1 bg-[#1E293B] rounded accent-[#06B6D4]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-zinc-400 block mb-1">Text Color</label>
                          <input
                            type="color"
                            value={target.color}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTextTracks((prev) => prev.map((t) => (t.id === target.id ? { ...t, color: val } : t)));
                            }}
                            className="w-full h-8 bg-transparent cursor-pointer rounded"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block mb-1">Animation</label>
                          <select
                            value={target.animation}
                            onChange={(e) => {
                              const val = e.target.value as any;
                              setTextTracks((prev) =>
                                prev.map((t) => (t.id === target.id ? { ...t, animation: val } : t))
                              );
                              recordSnapshot();
                            }}
                            className="w-full h-8 bg-[#161E2E] border border-[#2B3852] rounded text-white px-1"
                          >
                            <option value="none">Static</option>
                            <option value="typewriter">Typewriter</option>
                            <option value="fade">Fade In</option>
                          </select>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTextTracks((prev) => prev.filter((t) => t.id !== target.id));
                          setSelectedTextId(null);
                          recordSnapshot();
                        }}
                        className="w-full py-1.5 text-red-400 bg-red-950/20 border border-red-900/40 rounded flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Text Track
                      </button>
                    </div>
                  );
                })()
              ) : (
                <span className="text-zinc-500 italic">Select a text overlay on canvas to edit.</span>
              )}
            </div>
          )}

          {/* 6. STICKERS & BADGES TAB */}
          {activeTab === "stickers" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Emoji & Badge Matrix</h3>
              <div className="grid grid-cols-4 gap-2 text-2xl">
                {STICKER_LIBRARY.map((em) => (
                  <button
                    key={em}
                    onClick={() => {
                      const newStk: StickerOverlayTrack = {
                        id: `stk_${Date.now()}`,
                        emoji: em,
                        x: 50,
                        y: 50,
                        size: 50,
                        rotation: 0,
                        startTime: currentTime,
                        endTime: Math.min(duration, currentTime + 6),
                      };
                      setStickerTracks((prev) => [...prev, newStk]);
                      setSelectedStickerId(newStk.id);
                      recordSnapshot();
                    }}
                    className="h-12 rounded-xl bg-[#0B0F19] border border-[#1E293B] hover:border-[#06B6D4] flex items-center justify-center transition active:scale-95"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 7. EFFECTS & SHADERS TAB */}
          {activeTab === "effects" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Cyberpunk Color LUTs</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "none", name: "Standard Raw" },
                  { id: "cyberpunk", name: "Neon Cyberpunk" },
                  { id: "vintage", name: "Retro 70s Film" },
                  { id: "noir", name: "B&W Monochrome" },
                  { id: "golden", name: "Golden Glow" },
                  { id: "vhs", name: "VHS Glitch Shift" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilter(f.id as ColorFilterPreset);
                      recordSnapshot();
                    }}
                    className={`p-3 rounded-lg border text-left font-semibold transition ${
                      activeFilter === f.id
                        ? "border-[#06B6D4] bg-[#06B6D4]/15 text-[#06B6D4]"
                        : "border-[#1E293B] bg-[#0B0F19] text-zinc-400 hover:text-white"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 8. TRANSITIONS TAB */}
          {activeTab === "transitions" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Clip Cut Transitions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "none", name: "Direct Cut" },
                  { id: "crossfade", name: "Cross Dissolve" },
                  { id: "whiteflash", name: "White Flash" },
                  { id: "glitch", name: "Glitch RGB" },
                ].map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => {
                      setSegments((prev) =>
                        prev.map((s) =>
                          currentTime >= s.start && currentTime <= s.end
                            ? { ...s, transition: tr.id as any }
                            : s
                        )
                      );
                      recordSnapshot();
                    }}
                    className="p-3 rounded-lg border border-[#1E293B] bg-[#0B0F19] hover:border-[#06B6D4] text-left font-semibold"
                  >
                    {tr.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 9. SPEED CONTROL */}
          {activeTab === "speed" && (
            <div className="flex flex-col space-y-4 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Speed Ramping</h3>
              <div className="grid grid-cols-3 gap-2">
                {[0.5, 0.75, 1.0, 1.5, 2.0, 4.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      if (videoRef.current) videoRef.current.playbackRate = spd;
                      setSegments((prev) =>
                        prev.map((s) =>
                          currentTime >= s.start && currentTime <= s.end ? { ...s, speed: spd } : s
                        )
                      );
                      recordSnapshot();
                    }}
                    className="py-2.5 rounded-lg border border-[#1E293B] bg-[#0B0F19] hover:border-[#06B6D4] font-bold text-center"
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 10. ADJUSTMENTS TAB */}
          {activeTab === "adjust" && (
            <div className="flex flex-col space-y-3.5 text-xs">
              <h3 className="font-bold text-sm text-zinc-100">Color Grading Matrix</h3>
              {[
                { label: "Brightness", val: brightness, set: setBrightness, max: 200 },
                { label: "Contrast", val: contrast, set: setContrast, max: 200 },
                { label: "Saturation", val: saturation, set: setSaturation, max: 200 },
                { label: "Hue Rotate", val: hueRotate, set: setHueRotate, max: 360 },
                { label: "Soft Blur", val: blur, set: setBlur, max: 20 },
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
                    className="w-full h-1 bg-[#1E293B] rounded accent-[#06B6D4]"
                  />
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Center Preview Viewport */}
        <section
          ref={previewContainerRef}
          onPointerMove={(e) => {
            handleCropPointerMove(e);
            handleInpaintPointerMove(e);
          }}
          onPointerUp={() => {
            handleCropPointerUp();
            handleInpaintPointerUp();
          }}
          className="flex-1 bg-[#06080F] flex flex-col items-center justify-center relative overflow-hidden select-none p-4"
        >
          {/* Main 9:16 Responsive Container */}
          <div className="relative aspect-[9/16] h-[66vh] max-h-[820px] bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#1E293B]">
            {/* Native Video Engine (Synchronized Input Source) */}
            <video
              ref={videoRef}
              playsInline
              muted={isMuted}
              onLoadedMetadata={() => {
                if (videoRef.current) setDuration(videoRef.current.duration || 12);
              }}
              className="hidden"
            />

            {/* Master Compositing Canvas */}
            <canvas ref={canvasRef} width={1080} height={1920} className="w-full h-full object-contain pointer-events-none" />

            {/* Unrestricted Interactive Crop Matrix Overlay */}
            {isCroppingActive && (
              <div
                style={{
                  left: `${cropBox.x}%`,
                  top: `${cropBox.y}%`,
                  width: `${cropBox.width}%`,
                  height: `${cropBox.height}%`,
                }}
                className="absolute border-2 border-[#06B6D4] pointer-events-auto touch-none shadow-[0_0_25px_rgba(6,182,212,0.4)]"
              >
                {/* Center Drag Handle */}
                <div
                  onPointerDown={(e) => handleCropPointerDown("center", e)}
                  className="absolute inset-4 cursor-move opacity-0 hover:opacity-100 flex items-center justify-center bg-cyan-500/10 transition"
                >
                  <Move className="w-6 h-6 text-cyan-300 drop-shadow" />
                </div>

                {/* 4 Interactive Corner Vertex Anchors */}
                <div
                  onPointerDown={(e) => handleCropPointerDown("tl", e)}
                  className="absolute -top-3 -left-3 w-6 h-6 bg-[#06B6D4] border-2 border-white rounded-full cursor-nwse-resize shadow-md"
                />
                <div
                  onPointerDown={(e) => handleCropPointerDown("tr", e)}
                  className="absolute -top-3 -right-3 w-6 h-6 bg-[#06B6D4] border-2 border-white rounded-full cursor-nesw-resize shadow-md"
                />
                <div
                  onPointerDown={(e) => handleCropPointerDown("bl", e)}
                  className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#06B6D4] border-2 border-white rounded-full cursor-nesw-resize shadow-md"
                />
                <div
                  onPointerDown={(e) => handleCropPointerDown("br", e)}
                  className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#06B6D4] border-2 border-white rounded-full cursor-nwse-resize shadow-md"
                />

                {/* Rule of Thirds Grid Lines */}
                {showRuleOfThirds && (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none border border-cyan-400/20">
                    <div className="border-r border-b border-cyan-400/30" />
                    <div className="border-r border-b border-cyan-400/30" />
                    <div className="border-b border-cyan-400/30" />
                    <div className="border-r border-b border-cyan-400/30" />
                    <div className="border-r border-b border-cyan-400/30" />
                    <div className="border-b border-cyan-400/30" />
                    <div className="border-r border-cyan-400/30" />
                    <div className="border-r border-cyan-400/30" />
                    <div />
                  </div>
                )}
              </div>
            )}

            {/* Inpaint Watermark Eraser Interactive Selectors */}
            {activeTab === "inpaint" &&
              inpaintRegions.map((box) => {
                if (!box.enabled) return null;
                const isSelected = selectedInpaintId === box.id;
                return (
                  <div
                    key={box.id}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                    onPointerDown={(e) => handleInpaintPointerDown(box.id, "body", e)}
                    className={`absolute cursor-move border-2 dashed rounded touch-none flex items-center justify-center ${
                      isSelected
                        ? "border-[#7C3AED] bg-purple-500/20 shadow-lg"
                        : "border-purple-400/40 bg-purple-500/10"
                    }`}
                  >
                    <span className="text-[10px] font-bold text-purple-200 uppercase bg-black/60 px-1 rounded pointer-events-none">
                      Eraser
                    </span>
                    <div
                      onPointerDown={(e) => handleInpaintPointerDown(box.id, "br", e)}
                      className="absolute -bottom-2 -right-2 w-4 h-4 bg-[#7C3AED] rounded-full cursor-nwse-resize"
                    />
                  </div>
                );
              })}
          </div>

          {/* Floating Playback Controls Dock */}
          <div className="absolute bottom-4 flex items-center gap-3 bg-[#0E1322]/90 backdrop-blur-md px-4 py-2 rounded-full border border-[#1E293B] shadow-2xl">
            <button
              onClick={toggleMasterPlayback}
              className="p-1.5 text-[#06B6D4] hover:text-white transition"
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

      {/* -------------------------------------------------------------------- */}
      {/* MULTI-TRACK TIMELINE: VIDEO, AUDIO, TEXT & STICKER TRACKS            */}
      {/* -------------------------------------------------------------------- */}
      <footer className="h-64 border-t border-[#1E293B] bg-[#0A0D17] flex flex-col z-20 shrink-0">
        <div className="h-10 border-b border-[#161E2E] px-4 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center space-x-2">
            <button
              onClick={executeSplitSegment}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161E2E] hover:bg-[#202B3E] text-white font-medium"
            >
              <Scissors className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Split</span>
            </button>
            <button
              onClick={executeDuplicateSegment}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161E2E] hover:bg-[#202B3E] text-white font-medium"
            >
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={executeDeleteSegment}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161E2E] hover:bg-red-950/40 text-red-400 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimelineZoom((z) => Math.max(0.5, z - 0.25))}
              className="p-1 hover:bg-[#161E2E] rounded"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px]">{timelineZoom.toFixed(1)}x</span>
            <button
              onClick={() => setTimelineZoom((z) => Math.min(3, z + 0.25))}
              className="p-1 hover:bg-[#161E2E] rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Scrubbing Canvas Area */}
        <div
          ref={timelineTrackRef}
          onPointerDown={handleTimelineScrubDown}
          onPointerMove={handleTimelineScrubMove}
          onPointerUp={handleTimelineScrubUp}
          className="flex-1 relative bg-[#070911] overflow-x-auto overflow-y-hidden cursor-pointer select-none p-3 space-y-2.5"
        >
          {/* Synchronized Magnetic Playhead Needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-[#06B6D4] z-30 pointer-events-none"
            style={{ left: `${Math.min(100, (currentTime / (duration || 1)) * 100)}%` }}
          >
            <div className="w-3 h-3 bg-[#06B6D4] rotate-45 -translate-x-[5px] -translate-y-1 shadow-lg shadow-cyan-400/50" />
          </div>

          {/* TRACK 1: Video Segment Base */}
          <div className="relative h-12 bg-[#0E1322] rounded-md border border-[#1E293B] flex overflow-hidden">
            {segments.map((seg) => {
              const segDur = seg.end - seg.start;
              const widthPct = (segDur / (duration || 1)) * 100;
              return (
                <div
                  key={seg.id}
                  style={{ width: `${widthPct}%` }}
                  className="h-full border-r-2 border-[#06B6D4] bg-gradient-to-r from-[#7C3AED]/20 to-[#06B6D4]/30 relative flex items-center justify-between px-2 text-[10px] font-bold text-cyan-200 truncate"
                >
                  <span className="truncate">
                    {seg.name} ({seg.speed}x)
                  </span>
                  {seg.transition !== "none" && (
                    <span className="text-[9px] bg-cyan-500/20 text-[#06B6D4] px-1 rounded border border-cyan-500/30 uppercase">
                      {seg.transition}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* TRACK 2: Audio Soundtrack */}
          <div className="relative h-7 bg-[#0E1322] rounded-md border border-[#1E293B] overflow-hidden">
            {audioTracks.map((trk) => {
              const l = (trk.startTime / (duration || 1)) * 100;
              const w = (trk.duration / (duration || 1)) * 100;
              return (
                <div
                  key={trk.id}
                  style={{ left: `${l}%`, width: `${Math.max(4, w)}%` }}
                  className="absolute top-0.5 bottom-0.5 rounded px-2 flex items-center text-[9px] font-bold bg-[#7C3AED]/50 text-purple-200 border border-[#7C3AED] truncate gap-1"
                >
                  <Radio className="w-2.5 h-2.5 text-purple-300" />
                  <span className="truncate">
                    {trk.title} ({trk.genre})
                  </span>
                </div>
              );
            })}
          </div>

          {/* TRACK 3: Typography Overlays */}
          <div className="relative h-7 bg-[#0E1322] rounded-md border border-[#1E293B] overflow-hidden">
            {textTracks.map((txt) => {
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
                      ? "bg-[#06B6D4] text-black shadow-md"
                      : "bg-[#06B6D4]/30 text-cyan-200 border border-[#06B6D4]/50"
                  }`}
                >
                  {txt.text}
                </div>
              );
            })}
          </div>
        </div>
      </footer>

      {/* -------------------------------------------------------------------- */}
      {/* FLOATING ACTION BUTTON (FAB): OFFICIAL TELEGRAM DIRECT SUPPORT       */}
      {/* -------------------------------------------------------------------- */}
      <a
        href={TELEGRAM_SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-5 w-12 h-12 rounded-full bg-gradient-to-tr from-[#7C3AED] to-[#06B6D4] flex items-center justify-center text-white shadow-2xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all z-40"
        title="Direct Support on Telegram (@Nostoc102)"
      >
        <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
      </a>

      {/* -------------------------------------------------------------------- */}
      {/* AUTHENTICATION MODAL: CLIENT PERSISTENT IDENTITY PROVIDER            */}
      {/* -------------------------------------------------------------------- */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1322] border border-[#1E293B] rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-extrabold text-lg text-white mb-1">
              {authMode === "signup" ? "Create Creator Profile" : "Access MarNostoc Studio"}
            </h3>
            <span className="text-xs text-zinc-400 mb-4 block">Client-side IndexedDB session authentication</span>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!authEmail) return;
                const existing = userList.find((u) => u.email.toLowerCase() === authEmail.toLowerCase());
                if (authMode === "login") {
                  if (existing) {
                    if (existing.isBanned) {
                      alert("This account has been suspended.");
                      return;
                    }
                    setCurrentUser(existing);
                    localStorage.setItem("marnostoc_active_user_id", existing.id);
                    setShowAuthModal(false);
                  } else {
                    alert("Account not found. Switch to Sign Up.");
                  }
                } else {
                  const newUser: UserRecord = {
                    id: generateUUIDv4(),
                    email: authEmail,
                    name: authName || authEmail.split("@")[0],
                    tier: "Free",
                    isBanned: false,
                    createdAt: new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                  };
                  await identityDB.putUser(newUser);
                  await syncUsersFromDB();
                  setCurrentUser(newUser);
                  localStorage.setItem("marnostoc_active_user_id", newUser.id);
                  setShowAuthModal(false);
                }
              }}
              className="space-y-3"
            >
              {authMode === "signup" && (
                <input
                  type="text"
                  placeholder="Creator Name"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-[#070911] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-white"
                />
              )}
              <input
                type="email"
                placeholder="Email Address"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                className="w-full bg-[#070911] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-white"
                required
              />
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-extrabold py-2.5 rounded-lg text-sm hover:brightness-110 transition"
              >
                {authMode === "signup" ? "Register & Enter Studio" : "Sign In"}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}
                  className="text-xs text-[#06B6D4] hover:underline"
                >
                  {authMode === "login" ? "Need an account? Sign Up" : "Have an account? Log In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* HIDDEN OWNER ADMINISTRATIVE PASSTHROUGH COMMAND CONSOLE             */}
      {/* -------------------------------------------------------------------- */}
      {showAdminConsole && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F19] border border-[#7C3AED] rounded-2xl w-full max-w-4xl p-6 relative shadow-2xl flex flex-col max-h-[85vh]">
            <button
              onClick={() => {
                setShowAdminConsole(false);
                setAdminAuthenticated(false);
                setAdminPasscodeQuery("");
              }}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-6 h-6 text-[#7C3AED]" />
              <h2 className="text-lg font-black text-white">Owner Administrative Command Center</h2>
              <span className="text-[10px] bg-[#7C3AED]/20 text-purple-300 px-2 py-0.5 rounded border border-[#7C3AED]/40">
                Authorized Personnel Only
              </span>
            </div>

            {!adminAuthenticated ? (
              <form onSubmit={verifyAdminPasscode} className="space-y-4 max-w-sm mx-auto my-12 text-center">
                <div className="w-12 h-12 bg-purple-950/60 border border-purple-500/40 rounded-full flex items-center justify-center mx-auto text-[#06B6D4]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Security Verification</h4>
                  <p className="text-xs text-zinc-400">Enter master cryptographic passcode to access the tenant database.</p>
                </div>
                <input
                  type="password"
                  placeholder="Master Passcode (NOSTOC777)"
                  value={adminPasscodeQuery}
                  onChange={(e) => setAdminPasscodeQuery(e.target.value)}
                  className="w-full bg-[#070911] border border-[#1E293B] rounded-lg px-3 py-2 text-sm text-center text-white"
                  autoFocus
                />
                {adminError && <span className="text-xs text-red-400 block">{adminError}</span>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-xs"
                >
                  Authenticate Console
                </button>
              </form>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Filter users by email, name or UUID..."
                      value={adminUserSearch}
                      onChange={(e) => setAdminUserSearch(e.target.value)}
                      className="w-full bg-[#070911] border border-[#1E293B] rounded-lg pl-9 pr-3 py-2 text-xs text-white"
                    />
                  </div>
                  <span className="text-xs text-zinc-400">{filteredAdminUsers.length} Registered Accounts</span>
                </div>

                {/* Tabular User Registry View */}
                <div className="flex-1 overflow-auto border border-[#1E293B] rounded-lg">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#121829] text-zinc-400 font-mono text-[11px] sticky top-0">
                      <tr>
                        <th className="p-2.5">User UID (UUIDv4)</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Name</th>
                        <th className="p-2.5">Created</th>
                        <th className="p-2.5">Tier Status</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E293B]">
                      {filteredAdminUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-[#121829]/50">
                          <td className="p-2.5 font-mono text-[10px] text-zinc-500">{u.id}</td>
                          <td className="p-2.5 font-semibold text-zinc-200">{u.email}</td>
                          <td className="p-2.5 text-zinc-400">{u.name}</td>
                          <td className="p-2.5 text-zinc-500 text-[10px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                u.tier === "Premium Pro"
                                  ? "bg-amber-950/80 text-amber-300 border border-amber-600/40"
                                  : "bg-zinc-800 text-zinc-400"
                              }`}
                            >
                              {u.tier}
                            </span>
                          </td>
                          <td className="p-2.5 text-right space-x-1.5">
                            <button
                              onClick={() => toggleUserSubscriptionTier(u.id)}
                              className="px-2 py-1 rounded bg-[#1E293B] hover:bg-[#2B3852] text-xs font-semibold"
                            >
                              Toggle Tier
                            </button>
                            <button
                              onClick={() => toggleUserBan(u.id)}
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                u.isBanned
                                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                                  : "bg-red-950/80 text-red-300 border border-red-800"
                              }`}
                            >
                              {u.isBanned ? "Unban" : "Ban"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* PRO UPGRADE MONETIZATION MODAL                                       */}
      {/* -------------------------------------------------------------------- */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0E1322] border border-[#F59E0B]/60 rounded-3xl w-full max-w-md p-6 relative shadow-2xl text-center">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h2 className="text-xl font-black text-white">Upgrade to Premium Pro</h2>
            <p className="text-xs text-zinc-400 mb-4">
              Unlock 14 Mbps 1080p export, custom viral soundtracks & unlimited manual vector crops.
            </p>
            <button
              disabled={isProcessingUpgrade}
              onClick={() => {
                setIsProcessingUpgrade(true);
                setTimeout(async () => {
                  if (currentUser) {
                    const updated: UserRecord = { ...currentUser, tier: "Premium Pro" };
                    await identityDB.putUser(updated);
                    setCurrentUser(updated);
                    await syncUsersFromDB();
                  }
                  setIsProcessingUpgrade(false);
                  setShowUpgradeModal(false);
                }, 1000);
              }}
              className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-extrabold py-2.5 rounded-xl text-xs hover:brightness-110 active:scale-95 transition"
            >
              {isProcessingUpgrade ? "Verifying Subscription..." : "Unlock Lifetime Access ($49)"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
