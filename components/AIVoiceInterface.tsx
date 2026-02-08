
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { useApp } from '../store';

const SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const AIVoiceInterface: React.FC = () => {
  const { state, toggleLive, updateRisk, addLogMessage, refreshRaces } = useApp();
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Use refs for state to avoid closure issues in callbacks
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setIsActive(false);
    setIsConnecting(false);
    setIsSpeaking(false);
  }, []);

  const handleStart = async () => {
    if (isActive) {
      cleanup();
      return;
    }

    try {
      setIsConnecting(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: SAMPLE_RATE });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: OUTPUT_SAMPLE_RATE });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are the EquiLay AI Voice Agent. You control a real-time automated horse race betting application.
            Context: Total PnL: £${stateRef.current.totalPnL}, Today: £${stateRef.current.todayProfit}, Liability: £${stateRef.current.activeLiability}.
            Automation Status: ${stateRef.current.isLive ? 'ACTIVE' : 'PAUSED'}.
            Risk: Max Liability £${stateRef.current.risk.maxLiabilityPerRace}, Target £${stateRef.current.risk.targetProfit}.
            
            Instructions:
            1. You are a professional trader's assistant.
            2. You can control the app using tools.
            3. You provide live market updates and status reports.
            4. Keep responses concise and focused on betting operations.`,
          tools: [
            {
              functionDeclarations: [
                {
                  name: 'toggle_automation',
                  description: 'Starts or pauses the automated betting system.',
                  parameters: { type: Type.OBJECT, properties: {} }
                },
                {
                  name: 'set_max_liability',
                  description: 'Sets the maximum liability allowed per race.',
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      amount: { type: Type.NUMBER, description: 'The amount in GBP.' }
                    },
                    required: ['amount']
                  }
                },
                {
                  name: 'refresh_market_data',
                  description: 'Triggers a real-time search for upcoming UK and Ireland races.',
                  parameters: { type: Type.OBJECT, properties: {} }
                }
              ]
            }
          ]
        },
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            addLogMessage('Voice channel secured', 'success');

            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    data: encode(new Uint8Array(int16.buffer)),
                    mimeType: 'audio/pcm;rate=16000'
                  }
                });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputCtx) {
              setIsSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), outputCtx, OUTPUT_SAMPLE_RATE, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsSpeaking(false);
              };
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruptions
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }

            // Handle Tools
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                let result = "ok";
                if (fc.name === 'toggle_automation') {
                  toggleLive();
                  result = "Automation toggled";
                } else if (fc.name === 'set_max_liability') {
                  updateRisk({ maxLiabilityPerRace: (fc.args as any).amount });
                  result = `Liability set to ${(fc.args as any).amount}`;
                } else if (fc.name === 'refresh_market_data') {
                  refreshRaces();
                  result = "Market data refresh triggered";
                }
                
                sessionPromise.then(session => {
                  session.sendToolResponse({
                    functionResponses: [{
                      id: fc.id,
                      name: fc.name,
                      response: { result }
                    }]
                  });
                });
              }
            }
          },
          onerror: (e) => {
            console.error('AI Error:', e);
            addLogMessage('Voice session error', 'error');
          },
          onclose: () => cleanup(),
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start AI Voice:', err);
      setIsConnecting(false);
      cleanup();
    }
  };

  return (
    <div className="fixed top-4 left-4 z-[60] pointer-events-none">
      <button 
        onClick={handleStart}
        className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-full shadow-2xl transition-all duration-500 border backdrop-blur-md ${
          isActive 
            ? 'bg-surface-dark/80 border-primary text-primary' 
            : 'bg-primary border-primary text-black'
        } ${isConnecting ? 'animate-pulse' : ''}`}
      >
        <div className="relative flex h-6 w-6 items-center justify-center">
          {isActive && (
            <span className={`absolute inline-flex h-full w-full rounded-full bg-primary opacity-20 ${isSpeaking ? 'animate-ping' : ''}`}></span>
          )}
          <span className="material-symbols-outlined text-[24px]">
            {isActive ? 'graphic_eq' : 'mic'}
          </span>
        </div>
        <div className="flex flex-col items-start pr-1">
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
            {isConnecting ? 'Syncing...' : isActive ? 'AI ACTIVE' : 'TALK TO AGENT'}
          </span>
          {isActive && (
            <span className="text-[9px] opacity-70 font-medium">
              {isSpeaking ? 'AGENT SPEAKING' : 'HANDS-FREE READY'}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
