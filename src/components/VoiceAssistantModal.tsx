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
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
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
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(10).fill(50));
  const [isProcessing, setIsProcessing] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices on component mount
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Select a preferred voice
  const selectVoice = useCallback((): SpeechSynthesisVoice | null => {
    // Preferences: English (GB/UK) male voice
    const preferredVoice = voices.find(
      (voice) =>
        (voice.lang === 'en-GB' || voice.lang === 'en-UK') && 
        voice.name.toLowerCase().includes('male')
    );

    if (preferredVoice) return preferredVoice;

    // Fallback to any British voice
    const britishVoice = voices.find(
      (voice) => voice.lang === 'en-GB' || voice.lang === 'en-UK'
    );

    if (britishVoice) return britishVoice;

    // Final fallback to the first available voice
    return voices.length > 0 ? voices[0] : null;
  }, [voices]);

  // Enhanced handleTranscript function
  const handleTranscript = useCallback(
    async (text: string) => {
      setIsProcessing(true);

      try {
        // Add await here since processInput might be async
        const response = await aiModel.processInput(text);
        
        // Add error handling
        if (!response) {
          console.error('No response from AI model');
          setIsProcessing(false);
          return;
        }

        if ('speechSynthesis' in window) {
          // Cancel any ongoing speech before starting new one
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }

          const utterance = new SpeechSynthesisUtterance(response);

          const voice = selectVoice();
          if (voice) {
            utterance.voice = voice;
          }

          // Adjust speech parameters for more natural speech
          utterance.rate = 1; // Slightly slower rate
          utterance.pitch = 0.9; // Lower pitch for male voice
          utterance.volume = 1; // Keep the same volume

          // Handle natural pauses by adding punctuation
          const formattedResponse = response
            .replace(/\. /g, '.\n') // Add newline after periods
            .replace(/, /g, ',\n'); // Add newline after commas
          utterance.text = formattedResponse;

          // Event listeners to manage speaking state
          utterance.onstart = () => {
            console.log('Started speaking');
            setIsSpeaking(true);
          };

          utterance.onend = () => {
            console.log('Finished speaking');
            setIsSpeaking(false);
            setIsProcessing(false);
          };

          utterance.onerror = (event) => {
            console.error('Speech error:', event);
            setIsSpeaking(false);
            setIsProcessing(false);
          };

          window.speechSynthesis.speak(utterance);
        } else {
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error processing input:', error);
        setIsProcessing(false);
      }
    },
    [aiModel, selectVoice]
  );

  // Animation Logic
  useEffect(() => {
    let animationFrameId: number;
    let startTime: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (isListening || isSpeaking) {
        const newData = Array(10)
          .fill(0)
          .map((_, i) => {
            const frequency = i * 0.5 + elapsed * 0.003;
            const amplitude = isListening ? 40 : 30;
            const baseHeight = 30;

            return (
              baseHeight +
              Math.sin(frequency) * amplitude +
              (Math.random() * 20)
            );
          });

        setVisualizerData(newData);
      } else {
        setVisualizerData(Array(10).fill(10));
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isListening, isSpeaking]);

  // Visualizer Component
  const Visualizer = () => (
    <div className="flex justify-center items-center h-32 space-x-1">
      {visualizerData.map((height, index) => (
        <motion.div
          key={index}
          initial={{ height: '10%' }}
          animate={{
            height: `${height}%`,
            transition: { type: 'spring', damping: 10 },
          }}
          className={`w-2 rounded-full ${
            isListening
              ? 'bg-blue-500'
              : isSpeaking
              ? 'bg-green-500'
              : 'bg-gray-600'
          }`}
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );

  // Load voices effect is already handled above

  // Speech Recognition Effect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition && isListening) {
        const recognition = new SpeechRecognition() as SpeechRecognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              handleTranscript(finalTranscript);
              finalTranscript = '';
            }
          }
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setIsProcessing(false);
        };

        recognition.start();
        return () => {
          recognition.stop();
        };
      }
    }
  }, [isListening, handleTranscript]);

  // Test Conversation
  const testConversation = async (text: string) => {
    setIsListening(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsListening(false);

    handleTranscript(text);
  };

  // Test Voice Function
  const testVoice = () => {
    const utterance = new SpeechSynthesisUtterance(
      "Hello, I am your AI assistant. How can I help you today?"
    );

    const voice = selectVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Adjust speech parameters
    utterance.rate = 0.9; // Slightly slower rate
    utterance.pitch = 0.9; // Lower pitch for male voice
    utterance.volume = 0.9; // Keep the same volume

    // Handle natural pauses
    const formattedResponse = utterance.text
      .replace(/\. /g, '.\n')
      .replace(/, /g, ',\n');
    utterance.text = formattedResponse;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle Modal Close
  const handleClose = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    // Reset states
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
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
          className="fixed bottom-4 right-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-4 w-[400px] shadow-xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <FiCommand className="text-blue-400" size={20} />
                <span className="text-sm font-medium text-white">
                  Voice Assistant
                </span>
              </div>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX size={16} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            {/* Visualizer */}
            <div className="relative h-16 mb-4">
              <Visualizer />
            </div>

            {/* Status and Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <motion.div
                  animate={{
                    scale: isListening || isSpeaking ? [1, 1.2, 1] : 1,
                    opacity: isListening || isSpeaking ? 1 : 0.5,
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={`w-2 h-2 rounded-full ${
                    isListening
                      ? 'bg-blue-500'
                      : isSpeaking
                      ? 'bg-green-500'
                      : 'bg-gray-500'
                  }`}
                />
                <span className="text-xs text-gray-300">
                  {isListening
                    ? 'Listening...'
                    : isSpeaking
                    ? 'Speaking...'
                    : 'Ready'}
                </span>
              </div>

              {/* Main Control Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsListening(!isListening)}
                disabled={isProcessing}
                className={`p-3 rounded-full ${
                  isListening
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                } text-white shadow-lg ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                } transition-all duration-300`}
              >
                {isListening ? <FiMicOff size={20} /> : <FiMic size={20} />}
              </motion.button>
            </div>

            {/* Quick Test Buttons */}
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex gap-2">
                <button
                  onClick={testVoice}
                  className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs transition-colors"
                >
                  Test Voice
                </button>
                <button
                  onClick={() => testConversation('Hello')}
                  className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs transition-colors"
                >
                  Test: Hello
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

