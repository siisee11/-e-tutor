'use client';

import SphereCharacter from '@/components/sphere-character';
import { CalendarIcon } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col h-screen bg-amber-900 text-amber-200 font-sans p-2 pt-10">
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-300 rounded-lg flex items-center justify-center">
              <span className="text-amber-900 text-xl">📝</span>
            </div>
            <div className="flex space-x-4">
              <span className="text-amber-300 font-semibold">Home</span>
              <span className="text-amber-300 font-semibold">Entries</span>
            </div>
          </div>
          <CalendarIcon className="text-amber-200 w-6 h-6" />
        </div>
        <div className="flex-1 flex flex-col gap-4 px-4 py-6">
          <div className="flex justify-between mb-4">
            <span className="text-amber-400">Monday</span>
            <span className="text-amber-400">Today</span>
          </div>
          <div className="flex justify-center items-center">
            <SphereCharacter />
          </div>
          <div className="bg-amber-800 rounded-3xl p-6 shadow-lg">
            <div className="text-6xl mb-2">9</div>
            <div className="text-sm text-amber-400 mb-6">Sep</div>
            <h2 className="text-3xl font-bold mb-4">Say Hi To Someone</h2>
            <p className="text-amber-300 mb-8">
              Say hi to that person you always see on the train, or that newbie
              at work, or your neighbour you&apos;ve silently lived next to for
              years! If they&apos;re worth being friends with, they&apos;ll
              smile back.
            </p>
            <button className="w-full bg-amber-700 text-amber-200 py-3 rounded-xl font-semibold">
              Write!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
