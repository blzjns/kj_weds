import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

type Photo = {
  id: string;
  url: string;
  caption: string;
  tag: string;
}

function Lightbox({ photo, onClose }: { photo: S3File | undefined, onClose: () => void }) {
  if (!photo) return null;
  return (
    <div className="lightbox" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <img src={`/api/photos/${photo.key}`} alt={photo.eTag || 'Photo'} />
      {photo.eTag && <p className="lightbox-caption">{photo.eTag}</p>}

      {/* <iframe src={`https://drive.google.com/file/d/${photo.id}/preview`} width="90%" height="90%"></iframe> */}
    </div>
  );
}

type S3File = {
  key: string;
  eTag: string;
  lastModified: string;
  size: number; // bytes
  storageClass: string;
}

type UploadProgress = { pct: number; label: string } | undefined;

export default function GalleryPage() {
  const [photos, setPhotos] = useState<S3File[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [lightbox, setLightbox] = useState<S3File>();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load gallery from API on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/photos', { credentials: 'include' });
        const data = await res.json();
        setPhotos([...(data || [])]);
      } catch {
        setPhotos([]);
      }
    }
    load();
  }, []);

  // Animate grid items on tab change
  useEffect(() => {
    gsap.fromTo('.gallery-item',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.35, stagger: 0.04, ease: 'power2.out' }
    );
  }, [activeTab, photos]);

  const filtered = activeTab === 'all' ? photos : photos.filter((p) => p.tag === activeTab);

  async function handleUpload(files: FileList) {
    if (!files || !files.length) return;
    const total = files.length;
    let done = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      setUploadProgress({ pct: (done / total) * 100, label: `Uploading ${file.name}...` });

      const formData = new FormData();
      formData.append('photo', file);

      try {
        const res = await fetch('/api/photos/upload', { method: 'POST', credentials: 'include', body: formData });
        const data = await res.json();
        if (data.length > 0) setPhotos(data);
      } catch {
        // const localUrl = URL.createObjectURL(file);
        // setPhotos((prev) => [...prev, {
        //   id: `local-${Date.now()}`,
        //   url: localUrl,
        //   caption: file.name.replace(/\.[^.]+$/, ''),
        //   tag: 'guests',
        // }]);
      }

      done++;
      setUploadProgress({ pct: (done / total) * 100, label: done === total ? 'Upload complete!' : `Uploading ${file.name}...` });
    }

    setTimeout(() => {
      setUploadProgress(undefined);
      setActiveTab('guests');
    }, 2000);
  }

  return (
    <section id="page-gallery" className="page active">
      <div className="page-header">
        <p className="eyebrow">Shared Memories</p>
        <h2 className="page-title">Our Gallery</h2>
        <div className="title-ornament">❧</div>
      </div>

      <div className="gallery-tabs">
        {['all', 'official', 'guests', 'yours'].map((tab) => (
          <button
            key={tab}
            className={`gtab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div
        className="upload-zone"
        id="upload-zone"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--gold-light)';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--gold)';
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = 'var(--gold)';
          handleUpload(e.dataTransfer.files);
        }}
      >
        <div className="upload-icon">📷</div>
        <p>Share your photos from the day</p>
        <p className="upload-hint">Tap to choose or drag &amp; drop</p>
        <input
          type="file"
          id="photo-upload"
          accept="image/*"
          multiple
          hidden
          ref={fileInputRef}
          onChange={(e) => handleUpload(e.target.files as FileList)}
        />
        <button className="btn-outline" id="upload-trigger" onClick={() => fileInputRef.current?.click()}>
          Choose Photos
        </button>
      </div>

      {uploadProgress && (
        <div className="upload-progress" id="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress.pct}%` }} />
          </div>
          <p className="progress-label">{uploadProgress.label}</p>
        </div>
      )}

      {filtered.length > 0 ? (
        <div id="gallery-grid" className="gallery-grid">
          {photos.map(photo => (
            <img key={photo.key} className="gallery-item" src={`/api/photos/${photo.key}`} onClick={() => setLightbox(photo)} />
          ))}

          {/* {filtered.map((photo) => (
            <div
              key={photo.id}
              className="gallery-item"
              onClick={() => setLightbox(photo)}
            >
              <img src={photo.url} alt={photo.caption || 'Photo'} loading="lazy" />
              <span className="photo-tag">{photo.tag === 'official' ? '✦' : '❤'}</span>
            </div>
          ))} */}
        </div>
      ) : (
        <div id="gallery-empty" className="gallery-empty">
          <p>No photos yet — be the first to share a memory!</p>
        </div>
      )}

      <div className="page-spacer" />

      <Lightbox photo={lightbox} onClose={() => setLightbox(undefined)} />
    </section>
  );
}
