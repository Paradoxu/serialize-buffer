
export class Octets {
    private static DEFAULT_SIZE = 128;
    private static DEFAULT_CHARSET: 'utf8' | 'utf16le' = 'utf16le';
    private buffer!: Uint8Array;
    private count = 0;

    constructor();
    constructor(param?: number | Buffer | Octets);
    constructor(param: Octets, srcStart?: number, length?: number);
    constructor(param: Buffer, srcStart?: number, length?: number);
    constructor(param?: any, srcStart?: number, length?: number) {
        if (param == null)
            this.reserve(Octets.DEFAULT_SIZE);
        else if (typeof param === "number")
            this.reserve(param);
        else
            this.replace(param, srcStart, length);
    }

    private roundup(paramInt: number): Uint8Array {
        let i: number;
        for (i = 16; paramInt > i; i <<= 1);
        return new Uint8Array(i);
    }

    public reserve(paramInt: number) {
        if (this.buffer == null) {
            this.buffer = this.roundup(paramInt);
        } else if (paramInt > this.buffer.length) {
            const arrayOfByte = this.roundup(paramInt);
            arrayOfByte.set(this.buffer.subarray(0, this.count), 0);
            this.buffer = arrayOfByte;
        }

    }

    public replace(source: Buffer | Octets, srcStart = 0, length?: number): Octets {
        const buff = source instanceof Octets ? source.buffer : source;
        length ??= source instanceof Octets ? source.count : buff.length;

        this.reserve(length);

        this.buffer.set(buff.subarray(srcStart, srcStart + length), 0);
        this.count = length;
        return this;
    }

    public resize(size: number): Octets {
        this.reserve(size);
        this.count = size;
        return this;
    }

    public size(): number {
        return this.count;
    }

    public capacity(): number {
        return this.buffer.length;
    }

    public clear(): Octets {
        this.count = 0;
        return this;
    }

    public swap(paramOctets: Octets): Octets {
        const i = this.count;
        this.count = paramOctets.count;
        paramOctets.count = i;

        const arrayOfByte = paramOctets.buffer;
        paramOctets.buffer = this.buffer;
        this.buffer = arrayOfByte;

        return this;
    }


    public pushBack(byte: number): Octets {
        this.buffer[this.count++] = byte;
        return this;
    }

    public erase(start: number, end: number): Octets {
        Octets.arrayCopy(this.buffer, end, this.buffer, start, this.count - end);
        this.count -= end - start;
        return this;
    }

    public insert(destLength: number, source: Buffer | Octets, sourceOffset = 0, sourceLength?: number): Octets {
        const sourceBuffer = source instanceof Octets ? source.buffer : source;
        sourceLength ??= source instanceof Octets ? source.size() : source.length;

        this.reserve(this.count + sourceLength);

        Octets.arrayCopy(this.buffer, destLength, this.buffer, destLength + sourceLength, this.count - destLength);
        Octets.arrayCopy(sourceBuffer, sourceOffset, this.buffer, destLength, sourceLength);

        this.count += sourceLength;
        return this;
    }

    public getBytes(): Uint8Array {
        const arrayOfByte = new Uint8Array(this.count);
        Octets.arrayCopy(this.buffer, 0, arrayOfByte, 0, this.count);

        return arrayOfByte;
    }

    public getByte(pos: number): number {
        return this.buffer[pos];
    }

    public setByte(paramInt: number, paramByte: number) {
        this.buffer[paramInt] = paramByte;
    }

    public getByteBuffer(start = 0, length?: number): Uint8Array {
        length ??= this.count - start;

        return Uint8Array.from(this.buffer.subarray(start, length));
    }

    /**
     * Same as .toString, but apply the default charset
     * @returns 
     */
    public getString(): string {
        return Buffer.from(this.buffer.subarray(0, this.count)).toString(Octets.DEFAULT_CHARSET as any);
    }

    public toString(): string {
        return Buffer.from(this.buffer.subarray(0, this.count)).toString();
    }

    public toHexString(): string {
        return Array.from(this.getBytes()).map(b =>
            ('0' + (b & 0xFF).toString(16)).toUpperCase().slice(-2)
        ).join('')
    }

    public setString(value: string) {
        this.buffer = Buffer.from(value, Octets.DEFAULT_CHARSET as any);
        this.count = this.buffer.length;
    }

    public static getCharset() {
        return Octets.DEFAULT_CHARSET;
    }

    public static setDefaultCharset(paramString: 'utf8' | 'utf16le') {
        Octets.DEFAULT_CHARSET = paramString;
    }

    public clone(): Octets {
        return new Octets(this);
    }

    public compareTo(paramOctets: Octets): number {
        const i: number = Math.min(this.count, paramOctets.count);
        const arrayOfByte1 = this.buffer;
        const arrayOfByte2 = paramOctets.buffer;
        for (let b = 0; (b < i); b++) {
            const j = (arrayOfByte1[b] - arrayOfByte2[b]);
            if ((j != 0)) {
                return j;
            }

        }

        return (this.count - paramOctets.count);
    }

    toJSON() {
        return null;
    }

    static arrayCopy(
        src: Uint8Array,
        srcStart: number,
        target: Uint8Array,
        targetStart: number,
        length: number,
    ) {
        for (let i = 0; i < length; i++) {
            target[targetStart + i] = src[srcStart + i];
        }
    }

    static copy(
        src: Uint8Array,
        start: number,
        end?: number,
    ) {
        const copy = new Uint8Array(end - start);
        Octets.arrayCopy(src, start, copy, 0, end - start);
        return copy;
    }
}