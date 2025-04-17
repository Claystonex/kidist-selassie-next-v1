'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './VideoRecorder.module.css';

interface VideoRecorderProps {
  onSave: (videoBlob: Blob, duration: number) => void;
  onCancel?: () => void;
}

const VideoRecorder = ({ onSave, onCancel }: VideoRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up function to stop recording
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  // Initialize recording
  const startRecording = async () => {
    try {
      // Reset previous recording if any
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
        setVideoUrl('');
      }
      setVideoBlob(null);
      
      // Get media stream with video and audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }, 
        audio: true 
      });
      
      streamRef.current = stream;
      
      // Display the stream in the video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true; // Mute to prevent feedback
        videoRef.current.style.display = 'block'; // Ensure video is visible
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      }
      
      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          videoChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setVideoBlob(videoBlob);
        const videoUrl = URL.createObjectURL(videoBlob);
        setVideoUrl(videoUrl);
      };
      
      videoChunksRef.current = [];
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingDuration(seconds);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Error accessing camera. Please ensure you have given permission for camera and microphone access.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear the video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  // Save recording
  const handleSave = () => {
    if (videoBlob) {
      onSave(videoBlob, recordingDuration);
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
      <div className={styles.videoContainer}>
        {isRecording && (
          <div className={styles.recordingIndicator}>
            <div className={styles.recordingDot}></div>
            <span>{formatTime(recordingDuration)}</span>
          </div>
        )}
        <video 
          ref={videoRef} 
          className={styles.videoPreview} 
          autoPlay 
          playsInline
          muted={true} // Always mute to prevent feedback
          src={videoUrl || undefined}
          controls={!!videoUrl}
          style={{ display: isRecording || videoUrl ? 'block' : 'none' }}
        />
        {!isRecording && !videoUrl && (
          <div className={styles.startPrompt}>
            <div className={styles.cameraIcon}></div>
            <p>Click Start to record video</p>
          </div>
        )}
      </div>
      
      <div className={styles.controls}>
        {!isRecording && !videoUrl && (
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
          <button 
            onClick={stopRecording} 
            className={styles.stopButton}
            type="button"
          >
            <span className={styles.stopIcon}></span>
            Stop
          </button>
        )}
        
        {videoUrl && !isRecording && (
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
        )}
      </div>
    </div>
  );
};

export default VideoRecorder;
