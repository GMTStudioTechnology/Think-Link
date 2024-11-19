import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiMicOff, FiX, FiCommand, FiActivity } from 'react-icons/fi';
import { MazsAI } from './MazsAI';
import { Tooltip } from 'react-tooltip';
import { findBestMatch, TrainingData } from '../data/NLP';

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
  onstart: () => void;
  onaudioend: () => void;
  start: () => void;
  stop: () => void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
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
  trainingData: TrainingData[];
}

const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  aiModel,
  trainingData,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isNLPMode, setIsNLPMode] = useState(false);
  const [visualizerData, setVisualizerData] = useState<number[]>(Array(10).fill(10));
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [accumulatedTranscript, setAccumulatedTranscript] = useState('');

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
    const preferredVoice = voices.find(
      (voice) =>
        (voice.lang === 'en-GB' || voice.lang === 'en-UK') &&
        voice.name.toLowerCase().includes('male')
    );

    if (preferredVoice) return preferredVoice;

    const britishVoice = voices.find(
      (voice) => voice.lang === 'en-GB' || voice.lang === 'en-UK'
    );

    if (britishVoice) return britishVoice;

    return voices.length > 0 ? voices[0] : null;
  }, [voices]);

  // Enhanced handleTranscript function
  const handleTranscript = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessing) return;

      setIsProcessing(true);
      setError(null);
      console.log('Processing input:', text);

      try {
        const response = await aiModel.processInput(text);

        if (!response) {
          console.error('No response from AI model');
          setError('No response from AI model.');
          setIsProcessing(false);
          return;
        }

        if ('speechSynthesis' in window) {
          if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
          }

          const utterance = new SpeechSynthesisUtterance(response);
          const voice = selectVoice();
          if (voice) {
            utterance.voice = voice;
          }

          utterance.rate = 0.9;
          utterance.pitch = 0.9;
          utterance.volume = 1;

          const formattedResponse = response
            .replace(/\. /g, '.\n')
            .replace(/, /g, ',\n')
            .replace(/\? /g, '?\n')
            .replace(/! /g, '!\n');
          utterance.text = formattedResponse;

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
            setError('Speech synthesis error.');
            setIsSpeaking(false);
            setIsProcessing(false);
          };

          window.speechSynthesis.speak(utterance);
        } else {
          setError('Speech synthesis not supported in this browser.');
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error processing input:', error);
        setError('An error occurred while processing your request.');
        setIsProcessing(false);
      }
    },
    [aiModel, selectVoice, isProcessing]
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

            return baseHeight + Math.sin(frequency) * amplitude + Math.random() * 20;
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
              ? 'bg-blue-500 animate-pulse'
              : isSpeaking
              ? 'bg-green-500 animate-pulse'
              : 'bg-gray-600'
          }`}
          style={{ minHeight: '4px' }}
        />
      ))}
    </div>
  );

  // Process NLP Response
  const processNLPResponse = useCallback(async (transcript: string) => {
    try {
      const nlpResponse = findBestMatch(transcript, trainingData);
      
      if (nlpResponse) {
        await handleTranscript(nlpResponse);
      }
    } catch (error) {
      console.error('NLP Processing Error:', error);
      setError('Failed to process NLP response');
    }
  }, [trainingData, handleTranscript]);

  // Enhanced Speech Recognition Effect with NLP Mode
  useEffect(() => {
    let recognition: SpeechRecognition | null = null;

    const setupRecognition = async () => {
      const SpeechRecognition = await initializeSpeechRecognition();

      if (SpeechRecognition && isListening) {
        recognition = new SpeechRecognition() as SpeechRecognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              // Use the transcript for NLP mode
              if (isNLPMode) {
                setAccumulatedTranscript(prev => prev + transcript + ' ');
              }
            } else {
              // Update text input with interim results
              setTextInput(transcript);
            }
          }
        };

        recognition.onend = () => {
          console.log('Speech recognition ended');
          
          if (isNLPMode && accumulatedTranscript.trim()) {
            processNLPResponse(accumulatedTranscript.trim());
            setAccumulatedTranscript('');
          }
          
          setIsListening(false);
        };

        try {
          recognition.start();
        } catch (error) {
          console.error('Error starting recognition:', error);
          setError('Failed to start speech recognition.');
          setIsListening(false);
        }
      }
    };

    if (isListening) {
      setupRecognition();
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening, isNLPMode, accumulatedTranscript, processNLPResponse]);

  // NLP Mode Toggle Button
  const handleNLPModeToggle = () => {
    if (isSpeaking || isProcessing) return;

    setIsNLPMode(prev => !prev);
    
    if (!isNLPMode) {
      setIsListening(true);
      setAccumulatedTranscript('');
    } else {
      setIsListening(false);
    }
  };

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
    utterance.rate = 0.9;
    utterance.pitch = 0.9;
    utterance.volume = 0.9;

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

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setError('Speech synthesis error.');
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Handle Modal Close
  const handleClose = () => {
    window.speechSynthesis.cancel();
    setIsListening(false);
    setIsSpeaking(false);
    setIsProcessing(false);
    setError(null);
    onClose();
  };

  // Initialize Speech Recognition
  const initializeSpeechRecognition = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          console.error('Speech recognition not supported');
          setError('Speech recognition not supported in this browser.');
          return null;
        }

        return SpeechRecognition;
      } catch (error) {
        console.error('Error initializing speech recognition:', error);
        setError('Microphone access denied or not available.');
        return null;
      }
    }
    return null;
  };

  // Handle Text Submit
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      await handleTranscript(textInput);
      setTextInput('');
    }
  };

  // Update the main control button click handler
  const handleMicrophoneClick = () => {
    if (isSpeaking || isProcessing) return;
    
    if (isListening) {
      setIsListening(false); // This will stop the recognition
    } else {
      setIsListening(true); // This will start the recognition
    }
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
                aria-label="Close Voice Assistant"
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
                  {isNLPMode 
                    ? 'NLP Mode: Listening...' 
                    : (isListening
                      ? 'Listening...'
                      : isSpeaking
                      ? 'Speaking...'
                      : isProcessing
                      ? 'Processing...'
                      : error
                      ? error
                      : 'Ready')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                {/* NLP Mode Button */}
                <Tooltip 
                  content={isNLPMode ? "Disable NLP Mode" : "Enable NLP Mode"} 
                  place="top"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNLPModeToggle}
                    disabled={isProcessing || isSpeaking}
                    className={`p-3 rounded-full ${
                      isNLPMode
                        ? 'bg-gradient-to-r from-green-500 to-green-600'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600'
                    } text-white shadow-lg ${
                      isProcessing || isSpeaking ? 'opacity-50 cursor-not-allowed' : ''
                    } transition-all duration-300`}
                    aria-label={isNLPMode ? "Disable NLP Mode" : "Enable NLP Mode"}
                  >
                    <FiActivity size={20} />
                  </motion.button>
                </Tooltip>

                {/* Existing Microphone Button */}
                <Tooltip content={isListening ? "Press to Stop" : "Press to Talk"} place="top">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleMicrophoneClick}
                    disabled={isProcessing || isSpeaking}
                    className={`p-4 rounded-full ${
                      isListening
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    } text-white shadow-lg ${
                      isProcessing || isSpeaking ? 'opacity-50 cursor-not-allowed' : ''
                    } transition-all duration-300`}
                    aria-label={isListening ? "Stop Listening" : "Start Listening"}
                  >
                    {isListening ? <FiMicOff size={24} /> : <FiMic size={24} />}
                  </motion.button>
                </Tooltip>
              </div>
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

            {/* Text Input Field */}
            <form onSubmit={handleTextSubmit} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your message..."
                  aria-label="Type your message"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm transition-colors"
                  aria-label="Send Message"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Extend the Window interface
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export default VoiceAssistantModal; 
