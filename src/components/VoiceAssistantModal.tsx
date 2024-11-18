import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX, FiCommand } from 'react-icons/fi';
import { MazsAI } from './MazsAI';

// Define proper types for Web Speech API
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
  item(index: number): SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Add SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Add SpeechRecognitionErrorEvent interface
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
  aiModel: MazsAI;
}

const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  aiModel,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(20).fill(0));
  const [isProcessing, setIsProcessing] = useState(false);

  // Animate visualizer based on speech
  useEffect(() => {
    let animationFrame: number;
    let phase = 0;
    
    const animate = () => {
      if (isListening || isSpeaking) {
        phase += 0.1; // Control the speed of the wave
        setVisualizerData(prev => 
          prev.map((_, index) => {
            if (isListening) {
              // More dynamic random movement for listening
              return 20 + Math.random() * 60;
            } else {
              // Smoother sine wave pattern for speaking
              const offset = index * (Math.PI / 10);
              return 40 + Math.sin(phase + offset) * 30;
            }
          })
        );
        animationFrame = requestAnimationFrame(animate);
      } else {
        setVisualizerData(Array(20).fill(0));
      }
    };

    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [isListening, isSpeaking]);

  // Update handleTranscript to prevent modal from closing
  const handleTranscript = useCallback(async (text: string) => {
    setIsProcessing(true);
    setTranscript(text);
    
    const response = aiModel.processInput(text);
    setAiResponse(response);
    
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(response);
      
      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try different female voices in order of preference
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Samantha') || // MacOS female voice
        voice.name.includes('Microsoft Zira') || // Windows female voice
        (voice.name.includes('Female') && voice.lang.includes('en')) ||
        (voice.lang.includes('en-US') && voice.name.includes('Google'))
      ) || voices.find(voice => voice.lang.includes('en')); // fallback to any English voice
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Adjust speech parameters for better quality
      utterance.rate = 1.0;
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsProcessing(false);
        // Remove this line to prevent modal from closing
        // onCommand(text);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setIsProcessing(false);
    }
  }, [aiModel]);

  // Add this effect to load voices
  useEffect(() => {
    const loadVoices = () => {
      // Some browsers need this to load voices
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Update useEffect for speech recognition to prevent modal from closing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionConstructor;
      if (SpeechRecognition && isListening) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          
          // Update transcript without affecting input
          setTranscript(transcript);
          
          if (event.results[current].isFinal) {
            handleTranscript(transcript);
            setIsListening(false);
          }
        };

        recognition.start();
        return () => {
          recognition.stop();
        };
      }
    }
  }, [isListening, handleTranscript]);

  // Update error handling with proper typing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionConstructor;
      if (SpeechRecognition && isListening) {
        const recognition = new SpeechRecognition();
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsProcessing(false);
        };
      }
    }
  }, [isListening]);

  // Update test function to not close modal
  const testConversation = async (text: string) => {
    setIsListening(true);
    setTranscript(text);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsListening(false);
    
    handleTranscript(text);
  };

  // Add test voice function
  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance("Hello, I am your AI assistant. How can I help you today?");
    
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Add this function to your component to list available voices
  const listAvailableVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    console.log('Available voices:', voices.map(voice => ({
      name: voice.name,
      lang: voice.lang,
      default: voice.default
    })));
  };

  // Add this to your component props handling
  const handleClose = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    // Reset states
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setTranscript('');
    setAiResponse('');
    // Close modal
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black border border-white rounded-2xl p-6 w-full max-w-lg mx-4"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <FiCommand className="text-blue-500" size={24} />
                <h2 className="text-xl font-semibold text-white">Voice Assistant</h2>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Voice Visualizer */}
            <div className="flex items-center justify-center h-32 mb-6">
              <div className="flex items-center space-x-1">
                {visualizerData.map((height, index) => (
                  <motion.div
                    key={index}
                    animate={{ 
                      height: `${height}%`,
                      backgroundColor: isSpeaking ? '#48BB78' : '#4299E1' // Green for AI, Blue for user
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-1 rounded-full"
                    style={{ minHeight: 4 }}
                  />
                ))}
              </div>
            </div>

            {/* Status indicator */}
            <div className="text-center text-sm text-gray-400 mb-4">
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
            </div>

            {/* Transcript and AI Response */}
            <div className="mb-6 space-y-4">
              <div className="min-h-[60px] text-center">
                <p className="text-gray-400">
                  {transcript || (isListening ? 'Listening...' : 'Press the microphone to start')}
                </p>
              </div>
              {aiResponse && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gray-900 rounded-lg"
                >
                  <p className="text-blue-400">AI Response:</p>
                  <p className="text-white">{aiResponse}</p>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsListening(!isListening)}
                disabled={isProcessing}
                className={`p-4 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isListening ? <FiMicOff size={24} /> : <FiMic size={24} />}
              </motion.button>
            </div>

            {/* Command Examples */}

            {/* Add Test Panel */}
            <div className="mt-8 border-t border-gray-800 pt-4">
              <p className="text-sm text-gray-400 mb-4">Test Panel:</p>
              <div className="space-y-2">
                <button
                  onClick={testVoice}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
                >
                  Test Voice Output
                </button>
                
                {/* Quick Test Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => testConversation("Hello ! how are you?")}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
                  >
                    Test: Hello
                  </button>
                  
                  <button
                    onClick={() => testConversation("Who are you ")}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
                  >
                    Test: who are you 
                  </button>
                  
                  <button
                    onClick={() => testConversation("what is pizza")}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white text-sm transition-colors"
                  >
                    Test: what is pizza
                  </button>
                </div>
                <button
                  onClick={listAvailableVoices}
                  className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
                >
                  List Available Voices
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Add these declarations to extend the Window interface
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default VoiceAssistantModal; 

