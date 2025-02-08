import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(value: number) {
  const minute = Math.floor(value / 60);
  const secondLeft = Math.trunc(value - minute * 60);
  return `${minute}:${secondLeft < 10 ? `0${secondLeft}` : secondLeft}`;
}



export function formatDuration2(seconds: number, showSeconds: boolean = true): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if ((secs > 0 || parts.length === 0) && showSeconds) parts.push(`${Math.trunc(secs)}s`);

  return parts.join(' ');
}

export const getServerURL = () => {
  const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  return defaultUrl;
}