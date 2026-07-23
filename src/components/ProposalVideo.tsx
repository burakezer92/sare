import { useState } from "react";

export default function ProposalVideo() {
  const [hasError, setHasError] = useState(false);

  return (
    <section className="proposal-video-section">
      <div className="section-heading">
        <h2>Her anı seninle güzel</h2>
      </div>

      <div className="proposal-video-wrapper">
        {!hasError ? (
          <video
            className="proposal-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
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

        {!hasError && <div className="proposal-video-overlay" />}
      </div>
    </section>
  );
}
