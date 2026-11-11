/**
 * Generic LIFO Stack data structure.
 */
export class Stack<T> {
  private items: T[];

  constructor(iterable: Iterable<T> = []) {
    this.items = [...iterable];
  }

  public push(...items: T[]): void {
    if (items.length > 0) {
      this.items.push(...items);
    }
  }

  public pop(): T | undefined {
    return this.items.pop();
  }

  public peek(): T | undefined {
    return this.items.length === 0 ? undefined : this.items[this.items.length - 1];
  }

  public top = (): T | undefined => this.peek();

  public get length(): number {
    return this.items.length;
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public clear(): void {
    this.items = [];
  }

  public toArray(): T[] {
    return [...this.items];
  }

  public *[Symbol.iterator](): Iterator<T> {
    for (const item of this.items) {
      yield item;
    }
  }
}

/**
 * High-performance FIFO Queue with O(1) amortized operations.
 */
export class Queue<T> {
  private items: T[] = [];
  private head: number = 0;

  constructor(iterable: Iterable<T> = []) {
    this.items = [...iterable];
  }

  public enqueue(item: T): void {
    this.items.push(item);
  }

  public dequeue(): T | undefined {
    if (this.head >= this.items.length) {
      return undefined;
    }
    const item = this.items[this.head];
    this.head++;

    // Periodic compaction to free memory when queue head drifts
    if (this.head > 50 && this.head * 2 >= this.items.length) {
      this.items = this.items.slice(this.head);
      this.head = 0;
    }

    return item;
  }

  public peek(): T | undefined {
    return this.head < this.items.length ? this.items[this.head] : undefined;
  }

  public get length(): number {
    return this.items.length - this.head;
  }

  public isEmpty(): boolean {
    return this.length === 0;
  }

  public clear(): void {
    this.items = [];
    this.head = 0;
  }
}
