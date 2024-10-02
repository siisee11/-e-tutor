'use client';

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

export default function MapPage() {
  const [coords, setCoords] = useState<Coordinates | null>({
    lat: 37.775593,
    lng: -122.418137,
    location: 'My Location',
  });

  return (
    <div className="flex flex-col h-full">
      {coords && (
        <Map center={[coords.lat, coords.lng]} location={coords.location} />
      )}
    </div>
  );
}
