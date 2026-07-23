import { useRef, useState } from "react";

export default function ProposalVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);

  async function handlePlaybackToggle() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      if (video.paused) {
        await video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Video oynatılamadı:", error);
      setIsPlaying(false);
    }
  }

  function handleSoundToggle() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const nextMutedState = !video.muted;

    video.muted = nextMutedState;
    setIsMuted(nextMutedState);
  }

  function handleRestart() {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.currentTime = 0;

    void video.play().then(() => {
      setIsPlaying(true);
    });
  }

  return (
    <section className="proposal-video-section">
      <div className="section-heading">
        <h2>Her anı seninle güzel</h2>
      </div>

      <div className="proposal-video-wrapper">
        {!hasError ? (
          <video
            ref={videoRef}
            className="proposal-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={() => setHasError(true)}
          >
            <source src="/videos/proposal.mp4" type="video/mp4" />
            Tarayıcınız video etiketini desteklemiyor.
          </video>
        ) : (
          <div className="proposal-video-error">
            <span>🎬</span>

            <strong>Video yüklenemedi</strong>

            <p>
              public/videos/proposal.mp4 dosyasının mevcut olduğundan emin ol.
            </p>
          </div>
        )}

        {!hasError && <div className="proposal-video-overlay"></div>}
      </div>
    </section>
  );
}
