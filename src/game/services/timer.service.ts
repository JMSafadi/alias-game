import { Injectable } from '@nestjs/common';

@Injectable()
export class TimerService {
  private activeTimers = new Map<string, NodeJS.Timeout>();

  startTimer(gameId: string, duration: number, callback: () => void): void {
    console.log('Starting turn. Time remaining: ', duration);
    if (this.activeTimers.has(gameId)) {
      clearTimeout(this.activeTimers.get(gameId));
      this.activeTimers.delete(gameId);
    }
    const timer = setTimeout(callback, duration * 1000);
    this.activeTimers.set(gameId, timer);
  }
  clearTimer(gameId: string): void {
    if (this.activeTimers.has(gameId)) {
      clearTimeout(this.activeTimers.get(gameId));
      this.activeTimers.delete(gameId);
    }
  }
}
