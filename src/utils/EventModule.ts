export class EventEmitter {
  private events: Record<string, Function[]>;

  constructor() {
    this.events = {};
  }

  on(eventName: string, listener: Function) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  off(eventName: string, listener: Function) {
    const listeners = this.events[eventName];
    if (listeners) {
      this.events[eventName] = listeners.filter((l) => l !== listener);
    }
  }

  offAll() {
    this.events = {};
  }

  emit(eventName: string, ...args: any[]) {
    const listeners = this.events[eventName];
    if (listeners) {
      for (const listener of listeners) {
        listener(...args);
      }
    }
  }
}
