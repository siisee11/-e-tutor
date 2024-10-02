'use client';

import IPhoneFrame from '@/components/iphone-frame';
import Image from 'next/image';
import { useState } from 'react';
import Map from '@/components/map';

interface Coordinates {
  lat: number;
  lng: number;
  location?: string;
  temperature?: {
    value: number;
    units: string;
  };
  wind_speed?: {
    value: number;
    units: string;
  };
}

export default function Home() {
  const [coords, setCoords] = useState<Coordinates | null>({
    lat: 37.775593,
    lng: -122.418137,
    location: 'My Location',
  });

  return (
    <div className="flex flex-col items-center justify-items-center h-screen p-8 gap-16 sm:p-12 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8items-center sm:items-start">
        <IPhoneFrame>
          {coords && (
            <Map center={[coords.lat, coords.lng]} location={coords.location} />
          )}
        </IPhoneFrame>
      </main>
      <footer className="flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/siisee11/-e-tutor"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Github →
        </a>
      </footer>
    </div>
  );
}
