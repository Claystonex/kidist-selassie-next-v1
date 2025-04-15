'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './AudioRecorder.module.css';

interface AudioRecorderProps {
  onSave: (audioBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}

export const AudioRecorder = ({ onSave, onCancel }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Clean up function to stop recording and animation
  useEffect(() => {
    return () => {
      stopRecording();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Initialize recording and waveform visualization
  const startRecording = async () => {
    try {
      // Reset previous recording if any
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl('');
      }
      setAudioBlob(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for visualization
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Set up visualizer
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };
      
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
      }, 1000);
      
      // Start visualization
      drawWaveform();
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Error accessing microphone. Please ensure you have given permission.');
    }
  };

  // Simplified waveform visualization to avoid TypeScript errors
  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Define a function to draw each frame
    const draw = () => {
      // Stop if recording is stopped
      if (!isRecording) return;
      
      // Continue the animation loop
      animationFrameRef.current = requestAnimationFrame(draw);
      
      // Make sure we still have all the required references
      if (!analyserRef.current || !ctx) return;
      
      // Safety check for dataArray - create it if it doesn't exist
      if (!dataArrayRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        dataArrayRef.current = new Uint8Array(bufferLength);
      }
      
      // Get the data for the waveform
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      
      // Draw the background
      ctx.fillStyle = '#064d32';
      ctx.fillRect(0, 0, width, height);
      
      // Set up line style
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f8e05c';
      ctx.beginPath();
      
      // Safety check to handle TypeScript's concerns
      const dataArray = dataArrayRef.current;
      if (!dataArray) return;
      
      const sliceWidth = width / dataArray.length;
      let x = 0;
      
      // Iterate through data points and draw the waveform
      for (let i = 0; i < dataArray.length; i++) {
        // Get the data point at this position and handle it safely
        // We're using a non-null assertion with an OR fallback to default of 128
        // 128 is the center value for audio samples
        const v = (dataArray[i] ?? 128) / 128.0;
        const y = v * (height / 2);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };
    
    // Start the animation loop
    draw();
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // Save recording
  const handleSave = () => {
    if (audioBlob) {
      onSave(audioBlob, recordingDuration);
    }
  };
  
  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.recorderContainer}>
      <canvas 
        ref={canvasRef} 
        className={styles.waveform} 
        width={300} 
        height={80}
      />
      
      <div className={styles.controls}>
        {!isRecording && !audioUrl && (
          <button 
            onClick={startRecording} 
            className={styles.recordButton}
            type="button"
          >
            <span className={styles.recordIcon}></span>
            Start Recording
          </button>
        )}
        
        {isRecording && (
          <div className={styles.recordingControls}>
            <div className={styles.recordingIndicator}>
              <div className={styles.recordingDot}></div>
              <span>{formatTime(recordingDuration)}</span>
            </div>
            <button 
              onClick={stopRecording} 
              className={styles.stopButton}
              type="button"
            >
              <span className={styles.stopIcon}></span>
              Stop
            </button>
          </div>
        )}
        
        {audioUrl && (
          <div className={styles.previewControls}>
            <audio src={audioUrl} controls className={styles.audioPreview} />
            <div className={styles.previewButtons}>
              <button 
                onClick={handleSave} 
                className={styles.saveButton}
                type="button"
              >
                Save Recording
              </button>
              {onCancel && (
                <button 
                  onClick={onCancel} 
                  className={styles.cancelButton}
                  type="button"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
