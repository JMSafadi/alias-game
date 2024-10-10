import { TimerService } from './timer.service';

describe('TimerSerivce', () => {
  let service: TimerService;
  beforeEach(() => {
    service = new TimerService();
    jest.useFakeTimers();
    jest.spyOn(global, 'setTimeout');
    jest.spyOn(global, 'clearTimeout');
  });
  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });
  it('should start a timer and store in activeTimers', () => {
    const callback = jest.fn();
    const gameId = '123';
    const duration = 10;
    service.startTimer(gameId, duration, callback);
    expect(service['activeTimers'].has(gameId)).toBe(true);
    expect(setTimeout).toHaveBeenCalledWith(
      expect.any(Function),
      duration * 1000,
    );
    jest.advanceTimersByTime(duration * 1000);
    expect(callback).toHaveBeenCalled();
  });
  it('should clear an existing timer', () => {
    const callback = jest.fn();
    const gameId = '123';
    const duration = 10;
    // start timer
    service.startTimer(gameId, duration, callback);
    expect(service['activeTimers'].has(gameId)).toBe(true);
    // clear timer
    service.clearTimer(gameId);
    expect(service['activeTimers'].has(gameId)).toBe(false);
    expect(clearTimeout).toHaveBeenCalled();
  });
});
