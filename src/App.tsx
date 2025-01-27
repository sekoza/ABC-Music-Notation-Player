import React, { useState, useEffect, useRef } from 'react';
import ABCJS from 'abcjs';
import { Music, Play, Download } from 'lucide-react';

const defaultABC = `X:1
T:Example Song
M:4/4
L:1/4
K:C
C D E F|G A B c|c B A G|F E D C|`;

function App() {
  const [abcNotation, setAbcNotation] = useState(defaultABC);
  const [synth, setSynth] = useState<any>(null);
  const visualDiv = useRef<HTMLDivElement>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (visualDiv.current) {
      ABCJS.renderAbc(visualDiv.current, abcNotation, {
        responsive: 'resize',
        add_classes: true,
      });
    }
  }, [abcNotation]);

  const initAudio = async () => {
    if (!audioContext.current) {
      audioContext.current = new AudioContext();
    }
    if (!synth) {
      const newSynth = new ABCJS.synth.CreateSynth();
      await newSynth.init({
        audioContext: audioContext.current,
        visualObj: ABCJS.renderAbc(visualDiv.current!, abcNotation)[0],
        options: {
          program: 0,
        },
      });
      setSynth(newSynth);
      return newSynth;
    }
    return synth;
  };

  const playMusic = async () => {
    try {
      const currentSynth = await initAudio();
      await currentSynth.prime();
      await currentSynth.start();
    } catch (error) {
      console.error('Error playing music:', error);
    }
  };

  const downloadMIDI = () => {
    const visualObj = ABCJS.renderAbc(visualDiv.current!, abcNotation)[0];
    const midiFile = ABCJS.synth.getMidiFile(visualObj, { midiOutputType: 'encoded' });
    const blob = new Blob([midiFile], { type: 'audio/midi' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'music.midi';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Music className="w-6 h-6 text-indigo-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-800">ABC Music Editor</h1>
          </div>
          
          <div className="mb-6">
            <textarea
              value={abcNotation}
              onChange={(e) => setAbcNotation(e.target.value)}
              className="w-full h-48 p-4 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter ABC notation here..."
            />
          </div>

          <div className="flex space-x-4 mb-6">
            <button
              onClick={playMusic}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Play Music
            </button>
            <button
              onClick={downloadMIDI}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download MIDI
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div ref={visualDiv} className="abc-notation"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">ABC Notation Guide</h2>
          <p className="text-gray-600 mb-2">Basic syntax:</p>
          <ul className="list-disc list-inside text-gray-600 space-y-1">
            <li>X: - Tune number</li>
            <li>T: - Title</li>
            <li>M: - Meter (time signature)</li>
            <li>L: - Default note length</li>
            <li>K: - Key signature</li>
            <li>Notes: A-G for basic notes</li>
            <li>Add numbers after notes for duration</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;