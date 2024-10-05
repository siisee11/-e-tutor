'use client';

import SphereCharacter from '@/components/sphere-character';
import { WavRenderer } from '@/lib/wav-renderer';
import { WavStreamPlayer, WavRecorder } from '@/lib/wavtools/index';
import {
  ItemType,
  RealtimeClient,
} from '@openai/realtime-api-beta/lib/client.js';
import { CalendarIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Type for all event logs
 */
interface RealtimeEvent {
  time: string;
  source: 'client' | 'server';
  count?: number;
  event: { [key: string]: any };
}

const LOCAL_RELAY_SERVER_URL: string =
  process.env.REACT_APP_LOCAL_RELAY_SERVER_URL || '';

export const instructions = `System settings:
You are an AI language model that will role-play as an In-N-Out Burger cashier. 
I am a customer visiting California for the first time and am unfamiliar with the menu. 
Our goal is to have a natural conversation where I practice ordering food, asking about menu items (including any secret menu options), and engaging in small talk.

Please initiate the conversation by greeting me as I step up to the counter.
`;

export default function Home() {
  const apiKey = LOCAL_RELAY_SERVER_URL
    ? ''
    : localStorage.getItem('tmp::voice_api_key') ||
      prompt('OpenAI API Key') ||
      '';
  if (apiKey !== '') {
    localStorage.setItem('tmp::voice_api_key', apiKey);
  }
  /**
   * Instantiate:
   * - WavRecorder (speech input)
   * - WavStreamPlayer (speech output)
   * - RealtimeClient (API client)
   */
  const wavRecorderRef = useRef<WavRecorder>(
    new WavRecorder({ sampleRate: 24000 })
  );
  const wavStreamPlayerRef = useRef<WavStreamPlayer>(
    new WavStreamPlayer({ sampleRate: 24000 })
  );
  const clientRef = useRef<RealtimeClient>(
    new RealtimeClient(
      LOCAL_RELAY_SERVER_URL
        ? { url: LOCAL_RELAY_SERVER_URL }
        : {
            apiKey: apiKey,
            dangerouslyAllowAPIKeyInBrowser: true,
          }
    )
  );

  useEffect(() => {
    clientRef.current.updateSession({
      turn_detection: { type: 'server_vad' },
    });
  }, []);

  /**
   * References for
   * - Rendering audio visualization (canvas)
   * - Autoscrolling event logs
   * - Timing delta for event log displays
   */
  const clientCanvasRef = useRef<HTMLCanvasElement>(null);
  // const serverCanvasRef = useRef<HTMLCanvasElement>(null);
  const eventsScrollHeightRef = useRef(0);
  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<string>(new Date().toISOString());

  /**
   * All of our variables for displaying application state
   * - items are all conversation items (dialog)
   * - realtimeEvents are event logs, which can be expanded
   * - memoryKv is for set_memory() function
   * - coords, marker are for get_weather() function
   */
  const [items, setItems] = useState<ItemType[]>([]);
  const [realtimeEvents, setRealtimeEvents] = useState<RealtimeEvent[]>([]);
  const [expandedEvents, setExpandedEvents] = useState<{
    [key: string]: boolean;
  }>({});
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [memoryKv, setMemoryKv] = useState<{ [key: string]: any }>({});
  const [frequencies, setFrequencies] = useState<Float32Array>(
    new Float32Array([0])
  );

  /**
   * When you click the API key
   */
  const resetAPIKey = useCallback(() => {
    const apiKey = prompt('OpenAI API Key');
    if (apiKey !== null) {
      localStorage.clear();
      localStorage.setItem('tmp::voice_api_key', apiKey);
      window.location.reload();
    }
  }, []);

  /**
   * Connect to conversation:
   * WavRecorder taks speech input, WavStreamPlayer output, client is API client
   */
  const connectConversation = useCallback(async () => {
    console.log('connectConversation');
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;

    // Set state variables
    startTimeRef.current = new Date().toISOString();
    setIsConnected(true);
    setRealtimeEvents([]);
    setItems(client.conversation.getItems());

    // Connect to microphone
    await wavRecorder.begin();

    // Connect to audio output
    await wavStreamPlayer.connect();

    // Connect to realtime API
    await client.connect();
    client.sendUserMessageContent([
      {
        type: `input_text`,
        text: `Hello!`,
        // text: `For testing purposes, I want you to list ten car brands. Number each item, e.g. "one (or whatever number you are one): the item name".`
      },
    ]);

    if (client.getTurnDetectionType() === 'server_vad') {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  }, []);

  /**
   * Disconnect and reset conversation state
   */
  const disconnectConversation = useCallback(async () => {
    setIsConnected(false);
    setRealtimeEvents([]);
    setItems([]);
    setMemoryKv({});
    setFrequencies(new Float32Array([0]));

    const client = clientRef.current;
    client.disconnect();

    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.end();

    const wavStreamPlayer = wavStreamPlayerRef.current;
    await wavStreamPlayer.interrupt();
  }, []);

  const deleteConversationItem = useCallback(async (id: string) => {
    const client = clientRef.current;
    client.deleteItem(id);
  }, []);

  /**
   * In push-to-talk mode, start recording
   * .appendInputAudio() for each sample
   */
  const startRecording = async () => {
    setIsRecording(true);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const trackSampleOffset = await wavStreamPlayer.interrupt();
    if (trackSampleOffset?.trackId) {
      const { trackId, offset } = trackSampleOffset;
      await client.cancelResponse(trackId, offset);
    }
    await wavRecorder.record((data) => client.appendInputAudio(data.mono));
  };

  /**
   * In push-to-talk mode, stop recording
   */
  const stopRecording = async () => {
    setIsRecording(false);
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    await wavRecorder.pause();
    client.createResponse();
  };

  /**
   * Switch between Manual <> VAD mode for communication
   */
  const changeTurnEndType = async (value: string) => {
    const client = clientRef.current;
    const wavRecorder = wavRecorderRef.current;
    if (value === 'none' && wavRecorder.getStatus() === 'recording') {
      await wavRecorder.pause();
    }
    client.updateSession({
      turn_detection: value === 'none' ? null : { type: 'server_vad' },
    });
    if (value === 'server_vad' && client.isConnected()) {
      await wavRecorder.record((data) => client.appendInputAudio(data.mono));
    }
  };

  /**
   * Auto-scroll the event logs
   */
  useEffect(() => {
    if (eventsScrollRef.current) {
      const eventsEl = eventsScrollRef.current;
      const scrollHeight = eventsEl.scrollHeight;
      // Only scroll if height has just changed
      if (scrollHeight !== eventsScrollHeightRef.current) {
        eventsEl.scrollTop = scrollHeight;
        eventsScrollHeightRef.current = scrollHeight;
      }
    }
  }, [realtimeEvents]);

  /**
   * Auto-scroll the conversation logs
   */
  useEffect(() => {
    const conversationEls = [].slice.call(
      document.body.querySelectorAll('[data-conversation-content]')
    );
    for (const el of conversationEls) {
      const conversationEl = el as HTMLDivElement;
      conversationEl.scrollTop = conversationEl.scrollHeight;
    }
  }, [items]);

  /**
   * Set up render loops for the visualization canvas
   */
  useEffect(() => {
    let isLoaded = true;

    const wavRecorder = wavRecorderRef.current;
    const clientCanvas = clientCanvasRef.current;
    const clientCtx: CanvasRenderingContext2D | null = null;

    const wavStreamPlayer = wavStreamPlayerRef.current;
    // const serverCanvas = serverCanvasRef.current;
    // let serverCtx: CanvasRenderingContext2D | null = null;

    const render = () => {
      if (isLoaded) {
        // server frequency
        const result = wavStreamPlayer.analyser
          ? wavStreamPlayer.getFrequencies('voice')
          : { values: new Float32Array([0]) };
        setFrequencies(result.values);

        // if (clientCanvas) {
        //   if (!clientCanvas.width || !clientCanvas.height) {
        //     clientCanvas.width = clientCanvas.offsetWidth;
        //     clientCanvas.height = clientCanvas.offsetHeight;
        //   }
        //   clientCtx = clientCtx || clientCanvas.getContext('2d');
        //   if (clientCtx) {
        //     clientCtx.clearRect(0, 0, clientCanvas.width, clientCanvas.height);
        //     const result = wavRecorder.recording
        //       ? wavRecorder.getFrequencies('voice')
        //       : { values: new Float32Array([0]) };
        //     WavRenderer.drawBars(
        //       clientCanvas,
        //       clientCtx,
        //       result.values,
        //       '#0099ff',
        //       10,
        //       0,
        //       8
        //     );
        //   }
        // }
        // if (serverCanvas) {
        //   // if (!serverCanvas.width || !serverCanvas.height) {
        //   //   serverCanvas.width = serverCanvas.offsetWidth;
        //   //   serverCanvas.height = serverCanvas.offsetHeight;
        //   // }
        //   // serverCtx = serverCtx || serverCanvas.getContext('2d');
        //   // if (serverCtx) {
        //   //   serverCtx.clearRect(0, 0, serverCanvas.width, serverCanvas.height);
        //     // const result = wavStreamPlayer.analyser
        //     //   ? wavStreamPlayer.getFrequencies('voice')
        //     //   : { values: new Float32Array([0]) };
        //     // setFrequencies(result.values);
        //     // WavRenderer.drawBars(
        //     //   serverCanvas,
        //     //   serverCtx,
        //     //   result.values,
        //     //   '#009900',
        //     //   10,
        //     //   0,
        //     //   8
        //     // );
        //   }
        // }
        window.requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      isLoaded = false;
    };
  }, []);

  /**
   * Core RealtimeClient and audio capture setup
   * Set all of our instructions, tools, events and more
   */
  useEffect(() => {
    // Get refs
    const wavStreamPlayer = wavStreamPlayerRef.current;
    const client = clientRef.current;

    // Set instructions
    client.updateSession({ instructions: instructions });
    // Set transcription, otherwise we don't get user transcriptions back
    client.updateSession({ input_audio_transcription: { model: 'whisper-1' } });

    // Add tools
    client.addTool(
      {
        name: 'set_memory',
        description: 'Saves important data about the user into memory.',
        parameters: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description:
                'The key of the memory value. Always use lowercase and underscores, no other characters.',
            },
            value: {
              type: 'string',
              description: 'Value can be anything represented as a string',
            },
          },
          required: ['key', 'value'],
        },
      },
      async ({ key, value }: { [key: string]: any }) => {
        setMemoryKv((memoryKv) => {
          const newKv = { ...memoryKv };
          newKv[key] = value;
          return newKv;
        });
        return { ok: true };
      }
    );
    // client.addTool(
    //   {
    //     name: 'get_weather',
    //     description:
    //       'Retrieves the weather for a given lat, lng coordinate pair. Specify a label for the location.',
    //     parameters: {
    //       type: 'object',
    //       properties: {
    //         lat: {
    //           type: 'number',
    //           description: 'Latitude',
    //         },
    //         lng: {
    //           type: 'number',
    //           description: 'Longitude',
    //         },
    //         location: {
    //           type: 'string',
    //           description: 'Name of the location',
    //         },
    //       },
    //       required: ['lat', 'lng', 'location'],
    //     },
    //   },
    //   async ({ lat, lng, location }: { [key: string]: any }) => {
    //     const result = await fetch(
    //       `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m`
    //     );
    //     const json = await result.json();
    //     const temperature = {
    //       value: json.current.temperature_2m as number,
    //       units: json.current_units.temperature_2m as string,
    //     };
    //     const wind_speed = {
    //       value: json.current.wind_speed_10m as number,
    //       units: json.current_units.wind_speed_10m as string,
    //     };
    //     return json;
    //   }
    // );

    // handle realtime events from client + server for event logging
    client.on('realtime.event', (realtimeEvent: RealtimeEvent) => {
      setRealtimeEvents((realtimeEvents) => {
        const lastEvent = realtimeEvents[realtimeEvents.length - 1];
        if (lastEvent?.event.type === realtimeEvent.event.type) {
          // if we receive multiple events in a row, aggregate them for display purposes
          lastEvent.count = (lastEvent.count || 0) + 1;
          return realtimeEvents.slice(0, -1).concat(lastEvent);
        } else {
          return realtimeEvents.concat(realtimeEvent);
        }
      });
    });
    client.on('error', (event: any) => console.error(event));
    client.on('conversation.interrupted', async () => {
      const trackSampleOffset = await wavStreamPlayer.interrupt();
      if (trackSampleOffset?.trackId) {
        const { trackId, offset } = trackSampleOffset;
        await client.cancelResponse(trackId, offset);
      }
    });
    client.on('conversation.updated', async ({ item, delta }: any) => {
      const items = client.conversation.getItems();
      if (delta?.audio) {
        wavStreamPlayer.add16BitPCM(delta.audio, item.id);
      }
      if (item.status === 'completed' && item.formatted.audio?.length) {
        const wavFile = await WavRecorder.decode(
          item.formatted.audio,
          24000,
          24000
        );
        item.formatted.file = wavFile;
      }
      setItems(items);
    });

    setItems(client.conversation.getItems());

    return () => {
      // cleanup; resets to defaults
      client.reset();
    };
  }, []);

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
        <div className="flex flex-col gap-4 px-4 py-6 overflow-auto no-scrollbar">
          <div className="flex justify-between mb-4">
            <span className="text-amber-400">Monday</span>
            <span className="text-amber-400">Today</span>
          </div>
          <div className="flex justify-center items-center">
            <SphereCharacter frequencies={frequencies} />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col bg-amber-800 rounded-3xl p-6 shadow-lg h-2/5 overflow-auto no-scrollbar">
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
            <button
              className="w-full bg-amber-700 text-amber-200 py-3 rounded-xl font-semibold"
              onClick={
                isConnected ? disconnectConversation : connectConversation
              }
            >
              {isConnected ? 'End Conversation' : 'Start Conversation'}
            </button>
            <div className="visualization">
              {/* <div className="visualization-entry client">
                <canvas ref={clientCanvasRef} />
              </div> */}
              {/* <div className="visualization-entry server">
                <canvas ref={serverCanvasRef} />
              </div> */}
            </div>
            <div className="content-actions">
              <div className="flex items-center space-x-4">
                {/* <div className="flex-grow" /> */}
                {/* {isConnected && canPushToTalk && (
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      isRecording
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 text-white'
                    } ${
                      !isConnected || !canPushToTalk
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                    disabled={!isConnected || !canPushToTalk}
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                  >
                    {isRecording ? 'Release to send' : 'Push to talk'}
                  </button>
                )} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
