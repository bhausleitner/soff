export class GlobalRef<T> {
  private readonly sym: symbol;

  constructor(uniqueName: string) {
    this.sym = Symbol.for(uniqueName);
  }

  get value(): T | undefined {
    // Use type assertion to indicate that global has indexed property access for symbols
    return (global as Record<symbol, T>)[this.sym];
  }

  set value(value: T) {
    // Similarly, assert the type for global to ensure type safety
    (global as Record<symbol, T>)[this.sym] = value;
  }
}
