/// <reference types="node" />
export declare class Octets {
    private static DEFAULT_SIZE;
    private static DEFAULT_CHARSET;
    private buffer;
    private count;
    constructor();
    constructor(param?: number | Buffer | Octets);
    constructor(param: Octets, srcStart?: number, length?: number);
    constructor(param: Buffer, srcStart?: number, length?: number);
    private roundup;
    reserve(paramInt: number): void;
    replace(source: Buffer | Octets, srcStart?: number, length?: number): Octets;
    resize(size: number): Octets;
    size(): number;
    capacity(): number;
    clear(): Octets;
    swap(paramOctets: Octets): Octets;
    pushBack(byte: number): Octets;
    erase(start: number, end: number): Octets;
    insert(destLength: number, source: Buffer | Octets, sourceOffset?: number, sourceLength?: number): Octets;
    getBytes(): Uint8Array;
    getByte(pos: number): number;
    setByte(paramInt: number, paramByte: number): void;
    getByteBuffer(start?: number, length?: number): Uint8Array;
    /**
     * Same as .toString, but apply the default charset
     * @returns
     */
    getString(): string;
    toString(): string;
    toHexString(): string;
    setString(value: string): void;
    static getCharset(): "utf8" | "utf16le";
    static setDefaultCharset(paramString: 'utf8' | 'utf16le'): void;
    clone(): Octets;
    compareTo(paramOctets: Octets): number;
    toJSON(): any;
    static arrayCopy(src: Uint8Array, srcStart: number, target: Uint8Array, targetStart: number, length: number): void;
    static copy(src: Uint8Array, start: number, end?: number): Uint8Array;
}
