'use client';
import { useEffect } from 'react';

export default function UploadPage() {
  useEffect(() => {
    // Dynamically load the widget script once on the client
    const s = document.createElement('script');
    s.src = 'https://widget.cloudinary.com/v3.22.0/global/all.js';
    s.async = true;
    document.body.appendChild(s);

    s.onload = () => {
      // @ts-ignore – widget is attached to global window
      window.cloudinary.openUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_UPLOAD_PRESET,
          folder: 'portfolio',
          sources: ['local', 'url'],
          multiple: true,
          maxFiles: 20,
        },
        (err: any, res: any) => {
          if (res.event === 'queues-end') alert('Uploads complete!');
        },
      );
    };
  }, []);

  return <p>Widget loading…</p>;
}