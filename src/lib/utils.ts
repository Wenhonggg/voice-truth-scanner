import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API utility functions
export const API_BASE_URL = "http://127.0.0.1:5000";

export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    return response.ok;
  } catch (error) {
    console.error("API connection test failed:", error);
    return false;
  }
}

// Audio analysis utilities
export async function detectAudioSilence(
  audioBlob: Blob,
  threshold: number = 0.01
): Promise<boolean> {
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get the audio data from the first channel
    const channelData = audioBuffer.getChannelData(0);

    // Calculate RMS (Root Mean Square) energy
    let sum = 0;
    for (let i = 0; i < channelData.length; i++) {
      sum += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sum / channelData.length);

    // Close audio context to free resources
    await audioContext.close();

    // Return true if audio is below silence threshold
    return rms < threshold;
  } catch (error) {
    console.error("Error detecting audio silence:", error);
    return false; // Assume not silent if we can't analyze
  }
}

export async function submitAudioForAnalysis(
  audioBlob: Blob
): Promise<{
  predictions: number[];
  success: boolean;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return {
      predictions: data.predictions,
      success: true,
    };
  } catch (error) {
    return {
      predictions: [],
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
