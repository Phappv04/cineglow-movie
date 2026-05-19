import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, RotateCcw } from 'lucide-react';

const HlsPlayer = ({ src, movieSlug, episodeSlug }) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [savedTime, setSavedTime] = useState(0);

  // Key to store progress in localstorage
  const storageKey = `progress_${movieSlug}_${episodeSlug}`;

  // Initialize and attach HLS stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    // Reset resume prompt
    setShowResumePrompt(false);
    setSavedTime(0);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if there is saved progress
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsedTime = parseFloat(saved);
      if (parsedTime > 10) { // Only resume if played more than 10 seconds
        setSavedTime(parsedTime);
        setShowResumePrompt(true);
      }
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxMaxBufferLength: 30, // Limit buffer size to save network bandwidth
        enableWorker: true
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Video is ready
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('HLS Network error, trying to recover...', data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('HLS Media error, trying to recover...', data);
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS error, destroying player', data);
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native support (Safari / iOS)
      video.src = src;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, movieSlug, episodeSlug]);

  // Keyboard control listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;

      // Disable shortcuts when user is typing in inputs/textareas
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          if (video.paused) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          break;
        case 'arrowup':
          e.preventDefault();
          video.volume = Math.min(1.0, video.volume + 0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          video.volume = Math.max(0.0, video.volume - 0.1);
          break;
        case 'f':
          e.preventDefault();
          if (!document.fullscreenElement) {
            video.requestFullscreen?.().catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
          break;
        case 'm':
          e.preventDefault();
          video.muted = !video.muted;
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle saving time update to LocalStorage
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // Save progress every 5 seconds to reduce writes
    const currentTime = video.currentTime;
    const duration = video.duration;

    if (currentTime > 5 && duration > 0) {
      // Don't save progress if near the end (95% done)
      if (currentTime / duration < 0.95) {
        localStorage.setItem(storageKey, currentTime.toString());
      } else {
        localStorage.removeItem(storageKey);
      }
    }
  };

  const resumePlayback = () => {
    const video = videoRef.current;
    if (video && savedTime > 0) {
      video.currentTime = savedTime;
      video.play().catch(e => console.log('Autoplay blocked:', e));
      setShowResumePrompt(false);
    }
  };

  const restartPlayback = () => {
    localStorage.removeItem(storageKey);
    setShowResumePrompt(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
    }
  };

  // Convert seconds to readable MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <video
        ref={videoRef}
        className="player-video-element"
        controls
        onTimeUpdate={handleTimeUpdate}
        playsInline
        autoPlay
      />

      {showResumePrompt && (
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '20px',
            right: '20px',
            padding: '16px',
            borderRadius: '12px',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
            border: '1px solid var(--accent-purple)'
          }}
        >
          <div style={{ fontSize: '0.9rem' }}>
            Bạn đang xem dở tập này ở phút <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{formatTime(savedTime)}</span>. Bạn có muốn xem tiếp?
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-primary" 
              onClick={resumePlayback}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              <Play size={12} fill="white" />
              Xem Tiếp
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={restartPlayback}
              style={{ padding: '6px 14px', fontSize: '0.8rem', borderRadius: '8px' }}
            >
              <RotateCcw size={12} />
              Xem Từ Đầu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HlsPlayer;
