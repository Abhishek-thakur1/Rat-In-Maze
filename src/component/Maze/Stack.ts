export class Stack<T> {
    private items: T[];

    constructor(iterable: Iterable<T> = []) {
        this.items = [...iterable];
    }

    pop = () => this.items.pop();
    push = (...items: T[]) => {
        if (items.length === 0) return;
        this.items.push(...items);
    };
    top = () => (this.length === 0 ? undefined : this.items[this.length - 1]);

    get length() {
        return this.items.length;
    }

    *[Symbol.iterator]() {
        for (let item of this.items) yield item;
    }
}
