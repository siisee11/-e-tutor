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
        <div className="flex flex-col gap-4 px-4 py-6">
          <div className="flex justify-between mb-4">
            <span className="text-amber-400">Monday</span>
            <span className="text-amber-400">Today</span>
          </div>
          <div className="flex justify-center items-center">
            <SphereCharacter />
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex flex-col bg-amber-800 rounded-3xl p-6 shadow-lg h-2/5 overflow-auto">
              <div className="text-6xl mb-2">9</div>
              <div className="text-sm text-amber-400 mb-6">Sep</div>
              <h2 className="text-3xl font-bold mb-4">In & Out Burger</h2>
              <p className="text-amber-300 mb-8">
                English practice in In N Out Burger situation.
              </p>
              <p className="text-amber-300 mb-8 italic">
                You are an AI language model that will role-play as an In-N-Out
                Burger cashier. I am a customer visiting California for the
                first time and am unfamiliar with the menu. Our goal is to have
                a natural conversation where I practice ordering food, asking
                about menu items (including any secret menu options), and
                engaging in small talk.
              </p>
            </div>
            <button className="w-full bg-amber-700 text-amber-200 py-3 rounded-xl font-semibold">
              Write!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
