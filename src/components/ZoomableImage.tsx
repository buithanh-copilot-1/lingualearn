import { useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  src: string;
  alt: string;
  caption?: string;
  hint?: string;
}

export default function ZoomableImage({ src, alt, caption, hint }: Props) {
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  function close() {
    setOpen(false);
    setZoomed(false);
  }

  return (
    <>
      <button type="button" className="toeic-photo-frame" onClick={() => setOpen(true)} aria-label={hint ?? alt}>
        <img src={src} alt={alt} className="toeic-photo-img" />
        <span className="toeic-photo-zoom-badge">🔍</span>
      </button>
      {caption && <p className="toeic-image-hint">{caption}</p>}

      {open && createPortal(
        <div className="toeic-lightbox-overlay" onClick={close}>
          <button type="button" className="toeic-lightbox-close" onClick={close} aria-label="Close">✕</button>
          <img
            src={src}
            alt={alt}
            className={`toeic-lightbox-img ${zoomed ? 'zoomed' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setZoomed((z) => !z);
            }}
          />
        </div>,
        document.body,
      )}
    </>
  );
}
