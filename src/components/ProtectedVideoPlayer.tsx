'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  Volume1,
  VolumeX, 
  Maximize, 
  Minimize,
  ShieldAlert, 
  Settings, 
  AlertCircle, 
  RefreshCw,
  Sparkles,
  Check,
  Cast,
  PictureInPicture
} from 'lucide-react';

interface ProtectedVideoPlayerProps {
  videoUrl: string;
  title: string;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function ProtectedVideoPlayer({ videoUrl, title }: ProtectedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [availableQualities, setAvailableQualities] = useState<string[]>(['Auto', '1080p', '720p', '480p']);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [timeDisplayMode, setTimeDisplayMode] = useState<'current_total' | 'remaining'>('current_total');

  // Hover scrub tooltip state
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState(0);

  // Skip feedback indicator animation (+10s or -10s)
  const [skipFeedback, setSkipFeedback] = useState<{ text: string; side: 'left' | 'right' } | null>(null);


  // Detect source type
  const mediaSource = useMemo(() => {
    if (!videoUrl || !videoUrl.trim()) {
      return { type: 'empty' as const, url: '' };
    }
    const trimmed = videoUrl.trim();

    // YouTube formats (watch, youtu.be, embed, shorts, live)
    const ytMatch = trimmed.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
    );
    if (ytMatch && ytMatch[1]) {
      return {
        type: 'youtube' as const,
        videoId: ytMatch[1],
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&fs=0&playsinline=1&enablejsapi=1`,
      };
    }

    // Vimeo
    const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
    if (vimeoMatch && vimeoMatch[1]) {
      return {
        type: 'vimeo' as const,
        videoId: vimeoMatch[1],
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&badge=0&autopause=0&player_id=0&app_id=58479`,
      };
    }

    // Google Drive
    const gdriveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
    if (gdriveMatch && gdriveMatch[1]) {
      return {
        type: 'gdrive' as const,
        videoId: gdriveMatch[1],
        embedUrl: `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`,
      };
    }

    // BunnyCDN formats (b-cdn.net stream, mediadelivery.net embed/play, or raw UUID)
    const bunnyMatch = trimmed.match(/(?:vz-([a-zA-Z0-9]+)\.b-cdn\.net|iframe\.mediadelivery\.net\/(?:embed|play)\/([a-zA-Z0-9]+))\/([a-zA-Z0-9_-]+)/i);
    if (bunnyMatch) {
      const libId = bunnyMatch[1] || bunnyMatch[2] || '610687';
      const vidId = bunnyMatch[3];
      return {
        type: 'iframe' as const,
        embedUrl: `/api/player?lib=${libId}&video=${vidId}`,
      };
    }
    // Direct 11-character YouTube video ID (e.g. from premyt)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return {
        type: 'youtube' as const,
        videoId: trimmed,
        embedUrl: `https://www.youtube.com/embed/${trimmed}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&fs=0&playsinline=1&enablejsapi=1`,
      };
    }

    // Raw UUID for BunnyCDN video
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed)) {
      return {
        type: 'iframe' as const,
        embedUrl: `/api/player?lib=610687&video=${trimmed}`,
      };
    }

    // Generic iframe embed (/embed/ or /play/ or mediadelivery.net)
    if (trimmed.includes('/embed/') || trimmed.includes('/play/') || trimmed.includes('mediadelivery.net')) {
      const m = trimmed.match(/(?:embed|play)\/([a-zA-Z0-9]+)\/([a-zA-Z0-9_-]+)/i);
      if (m) {
        return {
          type: 'iframe' as const,
          embedUrl: `/api/player?lib=${m[1]}&video=${m[2]}`,
        };
      }
      return {
        type: 'iframe' as const,
        embedUrl: trimmed,
      };
    }

    // Direct HLS Stream (.m3u8)
    if (trimmed.includes('.m3u8') || trimmed.includes('/playlist')) {
      return {
        type: 'hls' as const,
        url: trimmed,
      };
    }

    // Direct MP4 / WebM video
    return {
      type: 'direct' as const,
      url: trimmed,
    };
  }, [videoUrl]);

  // Ensure no-referrer is not present so CDN embeds receive normal referrer
  useEffect(() => {
    const meta = document.querySelector('meta[name="referrer"]');
    if (meta && meta.getAttribute('content') === 'no-referrer') {
      meta.setAttribute('content', 'strict-origin-when-cross-origin');
    }
  }, []);


  // PostMessage & API helper for YouTube
  const sendYTCommand = useCallback((func: string, args: any[] = []) => {
    // 1. If ytPlayer instance exists and has the method, call it
    if (ytPlayerRef.current && typeof ytPlayerRef.current[func] === 'function') {
      try {
        ytPlayerRef.current[func](...args);
        return;
      } catch (err) {
        console.warn('YT API call error, falling back to postMessage', err);
      }
    }

    // 2. Direct postMessage to iframe window
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      } catch (err) {
        console.warn('YT postMessage error', err);
      }
    }
  }, []);

  // Listen for YouTube native postMessage events (duration, currentTime, buffered, playerState)
  useEffect(() => {
    if (mediaSource.type !== 'youtube') return;

    // Send listening handshake periodically every 500ms until duration is known
    const handshakeInterval = setInterval(() => {
      if (iframeRef.current?.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(
            JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
            '*'
          );
        } catch {}
      }
    }, 500);

    const handleMessage = (event: MessageEvent) => {
      // Allow messages from youtube
      if (typeof event.origin === 'string' && !event.origin.includes('youtube')) return;

      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // Handle infoDelivery / initialDelivery
        if ((data.event === 'infoDelivery' || data.event === 'initialDelivery') && data.info) {
          const info = data.info;
          if (typeof info.duration === 'number' && info.duration > 0) {
            setDuration(info.duration);
          }
          if (typeof info.currentTime === 'number' && !isNaN(info.currentTime)) {
            setCurrentTime(info.currentTime);
          }
          if (typeof info.videoLoadedFraction === 'number' && !isNaN(info.videoLoadedFraction)) {
            setBuffered(info.videoLoadedFraction * 100);
          }
          if (typeof info.playerState === 'number') {
            if (info.playerState === 1) {
              setIsPlaying(true);
              setIsBuffering(false);
            } else if (info.playerState === 2) {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (info.playerState === 3) {
              setIsBuffering(true);
            } else if (info.playerState === 0) {
              setIsPlaying(false);
              setIsBuffering(false);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);

    return () => {
      clearInterval(handshakeInterval);
      window.removeEventListener('message', handleMessage);
    };
  }, [mediaSource]);

  // Load YouTube Iframe API
  useEffect(() => {
    if (mediaSource.type !== 'youtube') return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const initYT = () => {
      if (!window.YT || !window.YT.Player || !iframeRef.current) return;
      try {
        ytPlayerRef.current = new window.YT.Player('protected-yt-player', {
          events: {
            onReady: (e: any) => {
              try {
                const dur = e.target.getDuration();
                if (dur && !isNaN(dur) && dur > 0) setDuration(dur);
                setIsBuffering(false);
              } catch {}
            },
            onStateChange: (e: any) => {
              if (e.data === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
              } else if (e.data === 2) {
                setIsPlaying(false);
                setIsBuffering(false);
              } else if (e.data === 3) {
                setIsBuffering(true);
              } else if (e.data === 0) {
                setIsPlaying(false);
                setIsBuffering(false);
              }
            },
            onError: (err: any) => {
              console.warn('YouTube Player Event Notice:', err);
              // Do not crash UI - let YouTube show native options if restricted
            },
          },
        });
      } catch (err) {
        console.warn('Failed to bind YT.Player instance', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initYT();
    } else {
      window.onYouTubeIframeAPIReady = initYT;
    }

    return () => {
      ytPlayerRef.current = null;
    };
  }, [mediaSource]);

  // Backup progress sync polling
  useEffect(() => {
    if (mediaSource.type !== 'youtube') return;

    const timer = setInterval(() => {
      if (ytPlayerRef.current) {
        try {
          if (typeof ytPlayerRef.current.getCurrentTime === 'function') {
            const cur = ytPlayerRef.current.getCurrentTime();
            if (cur !== undefined && !isNaN(cur)) setCurrentTime(cur);
          }
          if (typeof ytPlayerRef.current.getDuration === 'function') {
            const dur = ytPlayerRef.current.getDuration();
            if (dur && !isNaN(dur) && dur > 0) setDuration(dur);
          }
          if (typeof ytPlayerRef.current.getVideoLoadedFraction === 'function') {
            const frac = ytPlayerRef.current.getVideoLoadedFraction();
            if (frac !== undefined && !isNaN(frac)) setBuffered(frac * 100);
          }
        } catch {}
      }
    }, 300);

    return () => clearInterval(timer);
  }, [mediaSource]);

  // Setup HLS Stream (.m3u8) playback
  useEffect(() => {
    if (mediaSource.type !== 'hls') {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Prioritize Hls.js MSE support first (Chrome, Firefox, Edge, Safari Desktop)
    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(mediaSource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsBuffering(false);
        if (data.levels && data.levels.length > 0) {
          const qualities = ['Auto', ...data.levels.map((lvl) => `${lvl.height}p`)];
          // Remove duplicates
          const unique = Array.from(new Set(qualities));
          setAvailableQualities(unique);
        }
      });

      hls.on(Hls.Events.ERROR, (_, errorData) => {
        if (errorData.fatal) {
          switch (errorData.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network Error, recovering...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media Error, recovering...');
              hls.recoverMediaError();
              break;
            default:
              console.warn('HLS Fatal Error:', errorData);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Fallback for native Safari / iOS where MSE (Hls.isSupported()) is false
      video.src = mediaSource.url;
      setAvailableQualities(['Auto', '1080p', '720p', '480p']);
    } else {
      // Direct Fallback
      video.src = mediaSource.url;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [mediaSource]);

  // Reset states on video change
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    setHasError(false);
    setIsBuffering(false);

    if (mediaSource.type === 'direct' && videoRef.current) {
      videoRef.current.load();
    }
  }, [mediaSource]);

  // Auto-hide controls during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsMenu) {
          setShowControls(false);
        }
      }, 3200);
    }
  };

  const handleMouseLeave = () => {
    if (isPlaying && !showSettingsMenu) {
      setShowControls(false);
      setHoverPosition(null);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Controls Handlers
  const togglePlay = () => {
    if (mediaSource.type === 'youtube') {
      if (isPlaying) {
        sendYTCommand('pauseVideo');
        setIsPlaying(false);
      } else {
        sendYTCommand('playVideo');
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn('Video play delayed or source pending:', err?.name);
            });
        }
      }
    }
  };

  const handleSeek = (seconds: number) => {
    const target = duration > 0 ? Math.max(0, Math.min(duration, seconds)) : Math.max(0, seconds);
    setCurrentTime(target);

    if (mediaSource.type === 'youtube') {
      sendYTCommand('seekTo', [target, true]);
    } else if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    if (duration > 0) {
      handleSeek(fraction * duration);
    }
  };

  const skipTime = (delta: number) => {
    handleSeek(currentTime + delta);
    setSkipFeedback({
      text: delta > 0 ? '+10s' : '-10s',
      side: delta > 0 ? 'right' : 'left',
    });
    setTimeout(() => setSkipFeedback(null), 800);
  };

  const handleVolumeChange = (newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolume(vol);
    setIsMuted(vol === 0);

    if (mediaSource.type === 'youtube') {
      sendYTCommand('setVolume', [Math.round(vol * 100)]);
      if (vol === 0) sendYTCommand('mute');
      else sendYTCommand('unMute');
    } else if (videoRef.current) {
      videoRef.current.volume = vol;
      videoRef.current.muted = vol === 0;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(volume > 0 ? volume : 0.85);
    } else {
      setIsMuted(true);
      if (mediaSource.type === 'youtube') {
        sendYTCommand('mute');
      } else if (videoRef.current) {
        videoRef.current.muted = true;
      }
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSettingsMenu(false);

    if (mediaSource.type === 'youtube') {
      sendYTCommand('setPlaybackRate', [speed]);
    } else if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const changeQuality = (quality: string) => {
    setSelectedQuality(quality);
    setShowSettingsMenu(false);

    if (hlsRef.current && mediaSource.type === 'hls') {
      if (quality === 'Auto') {
        hlsRef.current.currentLevel = -1; // Auto level
      } else {
        const height = parseInt(quality.replace('p', ''), 10);
        const levelIdx = hlsRef.current.levels.findIndex((lvl) => lvl.height === height);
        if (levelIdx !== -1) {
          hlsRef.current.currentLevel = levelIdx;
        }
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (totalSeconds: number) => {
    if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  // Scrubber hover tracking
  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration === 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        skipTime(10);
      } else if (e.code === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        skipTime(-10);
      } else if (e.key === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, skipTime, toggleMute, toggleFullscreen]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full aspect-video rounded-3xl overflow-hidden bg-slate-950 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] select-none group"
    >
      

      {/* Subtle DRM Protection Badge top-right */}
      <div className="absolute top-3.5 right-3.5 z-30 pointer-events-none flex items-center gap-1.5 text-[10px] text-slate-200 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 opacity-80 shadow-md">
        <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
        <span className="font-semibold tracking-wide">অদম্য সুরক্ষিত প্লেয়ার</span>
      </div>

      {/* =========================================================================
          VIDEO CONTAINER: ZERO YOUTUBE BRANDING
         ========================================================================= */}
      <div className="absolute inset-0 overflow-hidden bg-black flex items-center justify-center">
        {mediaSource.type === 'youtube' ? (
          <div className="relative w-full h-full overflow-hidden bg-black">
            <iframe
              ref={iframeRef}
              id="protected-yt-player"
              src={mediaSource.embedUrl}
              title={title}
              onLoad={() => {
                if (iframeRef.current?.contentWindow) {
                  try {
                    iframeRef.current.contentWindow.postMessage(
                      JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }),
                      '*'
                    );
                  } catch {}
                }
              }}
              className="absolute top-[-18%] left-[-6%] w-[112%] h-[136%] border-0 pointer-events-none select-none"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            {/* Top mask bar: completely prevents any header/title bleed */}
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-black/95 to-transparent pointer-events-none z-10" />
          </div>
        ) : (mediaSource.type === 'direct' || mediaSource.type === 'hls') ? (
          <video
            ref={videoRef}
            src={mediaSource.type === 'direct' ? mediaSource.url : undefined}
            onTimeUpdate={() => {
              if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) setDuration(videoRef.current.duration);
            }}
            onProgress={() => {
              if (videoRef.current && videoRef.current.buffered.length > 0) {
                const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
                if (videoRef.current.duration) {
                  setBuffered((end / videoRef.current.duration) * 100);
                }
              }
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={() => {
              if (mediaSource.type === 'direct') {
                setHasError(true);
              }
            }}
            className="w-full h-full object-contain"
            playsInline
            preload="metadata"
          />
        ) : (mediaSource.type === 'vimeo' || mediaSource.type === 'gdrive' || mediaSource.type === 'iframe') ? (
          <div className="relative w-full h-full overflow-hidden bg-black">
            <iframe
              src={mediaSource.embedUrl}
              title={title}
              className="w-full h-full border-0"
              referrerPolicy="no-referrer"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-2">
            <Play className="w-10 h-10 text-slate-600" />
            <p className="text-xs font-bold">এই ক্লাসের জন্য কোনো ভিডিও লিংক যুক্ত করা হয়নি</p>
          </div>
        )}
      </div>

      {/* Transparent Clickable Interaction Overlay */}
      {mediaSource.type !== 'iframe' && mediaSource.type !== 'vimeo' && mediaSource.type !== 'gdrive' && (
        <div
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
          className="absolute inset-0 z-20 cursor-pointer"
        />
      )}

      {/* Center Big Play Button (when paused) */}
      {mediaSource.type !== 'iframe' && mediaSource.type !== 'vimeo' && mediaSource.type !== 'gdrive' && !isPlaying && !isBuffering && !hasError && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-900/80 backdrop-blur-xl border border-white/25 text-white flex items-center justify-center pl-1 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:scale-110 transition-all pointer-events-auto cursor-pointer group/play">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white drop-shadow-md group-hover/play:scale-105 transition-transform" />
          </div>
        </div>
      )}

      {/* Skip Feedback Animation (-10s / +10s) */}
      {skipFeedback && (
        <div className={`absolute top-1/2 -translate-y-1/2 z-25 pointer-events-none ${
          skipFeedback.side === 'left' ? 'left-12 sm:left-20' : 'right-12 sm:right-20'
        }`}>
          <div className="px-4 py-2 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 text-white font-black text-sm sm:text-base animate-ping shadow-2xl flex items-center gap-1">
            {skipFeedback.side === 'left' ? <RotateCcw className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
            <span>{skipFeedback.text}</span>
          </div>
        </div>
      )}

      {/* Buffering Loading Spinner */}
      {isBuffering && (
        <div className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-2xs">
          <div className="w-12 h-12 rounded-full border-3 border-pink-500/20 border-t-pink-500 animate-spin shadow-lg" />
        </div>
      )}

      {/* Error Display */}
      {hasError && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-slate-950 text-white space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <p className="text-xs text-slate-300">ভিডিও লোড হতে সমস্যা হয়েছে। ইন্টারনেট সংযোগ বা ভিডিও লিংক যাচাই করুন।</p>
          <button
            type="button"
            onClick={() => {
              setHasError(false);
              togglePlay();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 transition-transform"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>পুনরায় চেষ্টা করুন</span>
          </button>
        </div>
      )}

      {/* Custom Control Bar (Overlay at bottom with transparent background - NO black screen) */}
      {mediaSource.type !== 'iframe' && mediaSource.type !== 'vimeo' && mediaSource.type !== 'gdrive' && (
      <div
        className={`absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/50 via-black/15 to-transparent pt-6 pb-2.5 px-3 sm:px-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress Scrubber */}
        <div
          ref={progressBarRef}
          onClick={handleScrubberClick}
          onMouseMove={handleProgressMouseMove}
          onMouseLeave={() => setHoverPosition(null)}
          className="relative h-6 flex items-center group/scrubber cursor-pointer mb-1 select-none"
        >
          {hoverPosition !== null && duration > 0 && (
            <div
              className="absolute -top-7 -translate-x-1/2 px-2 py-0.5 rounded bg-black/90 text-[10px] font-mono font-bold text-white shadow pointer-events-none z-20"
              style={{ left: `${hoverPosition}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
          <div className="relative w-full h-1 group-hover/scrubber:h-1.5 rounded-full bg-white/20 transition-all pointer-events-none">
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/35 rounded-full"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute left-0 top-0 bottom-0 bg-[#00c269] rounded-full shadow-[0_0_8px_rgba(0,194,105,0.7)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <input
            type="range"
            min="0"
            max={duration > 0 ? duration : 100}
            step="0.1"
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            onInput={(e) => handleSeek(Number((e.target as HTMLInputElement).value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className="absolute w-3 h-3 rounded-full bg-white border border-[#00c269] shadow-md -ml-1.5 pointer-events-none scale-0 group-hover/scrubber:scale-100 transition-transform"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2 text-white">
          
          {/* Left: Play/Pause, -10s, +10s inside a rounded dock capsule */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md rounded-xl px-2 py-1 border border-white/10 shadow-sm">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
            </button>

            <button
              type="button"
              onClick={() => skipTime(-10)}
              className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white relative flex items-center justify-center"
              title="10s Back"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="absolute text-[7px] font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">10</span>
            </button>

            <button
              type="button"
              onClick={() => skipTime(10)}
              className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white relative flex items-center justify-center"
              title="10s Forward"
            >
              <RotateCw className="w-4 h-4" />
              <span className="absolute text-[7px] font-black top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">10</span>
            </button>
          </div>

          {/* Right: Time, Volume with slider, Settings, PiP, Fullscreen, Cast */}
          <div className="flex items-center gap-2 sm:gap-3.5 select-none drop-shadow-sm">
            
            {/* Time Indicator */}
            <div className="font-bold text-[11px] sm:text-xs text-white tracking-tight font-mono select-none">
              {formatTime(currentTime)} <span className="text-white/70 mx-0.5">/</span> {formatTime(duration)}
            </div>

            {/* Volume + Always-Visible Slider */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-14 sm:w-18 h-1 rounded-full bg-white/30 accent-[#00c269] cursor-pointer"
              />
            </div>

            {/* Speed & Settings Gear */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-black/90 backdrop-blur-md border border-white/10 p-2 text-xs text-white shadow-2xl space-y-2 z-50">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block px-1 pb-1">স্পিড</span>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => changeSpeed(s)}
                          className={`py-1 rounded text-center text-[11px] font-medium transition-colors cursor-pointer ${
                            playbackSpeed === s ? 'bg-[#00c269] text-white font-bold' : 'hover:bg-white/10 text-slate-300'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-2">
                    <span className="text-[10px] text-slate-400 font-semibold block px-1 pb-1">কোয়ালিটি</span>
                    <div className="space-y-0.5">
                      {availableQualities.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => changeQuality(q)}
                          className={`w-full flex items-center justify-between px-2 py-1 rounded text-left text-[11px] transition-colors cursor-pointer ${
                            selectedQuality === q ? 'bg-white/10 text-[#00c269] font-bold' : 'text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <span>{q}</span>
                          {selectedQuality === q && <Check className="w-3 h-3 text-[#00c269]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Picture-in-Picture / Popout */}
            <button
              type="button"
              onClick={() => {
                if (document.pictureInPictureElement) {
                  document.exitPictureInPicture().catch(() => {});
                } else if (videoRef.current) {
                  videoRef.current.requestPictureInPicture().catch(() => {});
                }
              }}
              className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white"
              title="Picture-in-Picture"
            >
              <PictureInPicture className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* Cast / Airplay */}
            <button
              type="button"
              className="p-1 hover:text-[#00c269] transition-colors cursor-pointer text-white"
              title="Cast"
            >
              <Cast className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
      )}

    </div>
  );
}
