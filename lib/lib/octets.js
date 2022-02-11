"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Octets = void 0;
class Octets {
    constructor(param, srcStart, length) {
        this.count = 0;
        if (param == null)
            this.reserve(Octets.DEFAULT_SIZE);
        else if (typeof param === "number")
            this.reserve(param);
        else
            this.replace(param, srcStart, length);
    }
    roundup(paramInt) {
        let i;
        for (i = 16; paramInt > i; i <<= 1)
            ;
        return new Uint8Array(i);
    }
    reserve(paramInt) {
        if (this.buffer == null) {
            this.buffer = this.roundup(paramInt);
        }
        else if (paramInt > this.buffer.length) {
            const arrayOfByte = this.roundup(paramInt);
            arrayOfByte.set(this.buffer.subarray(0, this.count), 0);
            this.buffer = arrayOfByte;
        }
    }
    replace(source, srcStart = 0, length) {
        const buff = source instanceof Octets ? source.buffer : source;
        length ?? (length = source instanceof Octets ? source.count : buff.length);
        this.reserve(length);
        this.buffer.set(buff.subarray(srcStart, srcStart + length), 0);
        this.count = length;
        return this;
    }
    resize(size) {
        this.reserve(size);
        this.count = size;
        return this;
    }
    size() {
        return this.count;
    }
    capacity() {
        return this.buffer.length;
    }
    clear() {
        this.count = 0;
        return this;
    }
    swap(paramOctets) {
        const i = this.count;
        this.count = paramOctets.count;
        paramOctets.count = i;
        const arrayOfByte = paramOctets.buffer;
        paramOctets.buffer = this.buffer;
        this.buffer = arrayOfByte;
        return this;
    }
    pushBack(byte) {
        this.reserve(this.count + 1);
        this.buffer[this.count++] = byte;
        return this;
    }
    erase(start, end) {
        Octets.arrayCopy(this.buffer, end, this.buffer, start, this.count - end);
        this.count -= end - start;
        return this;
    }
    insert(destLength, source, sourceOffset = 0, sourceLength) {
        const sourceBuffer = source instanceof Octets ? source.buffer : source;
        sourceLength ?? (sourceLength = source instanceof Octets ? source.size() : source.length);
        this.reserve(this.count + sourceLength);
        Octets.arrayCopy(this.buffer, destLength, this.buffer, destLength + sourceLength, this.count - destLength);
        Octets.arrayCopy(sourceBuffer, sourceOffset, this.buffer, destLength, sourceLength);
        this.count += sourceLength;
        return this;
    }
    getBytes() {
        const arrayOfByte = new Uint8Array(this.count);
        Octets.arrayCopy(this.buffer, 0, arrayOfByte, 0, this.count);
        return arrayOfByte;
    }
    getByte(pos) {
        return this.buffer[pos];
    }
    setByte(paramInt, paramByte) {
        this.buffer[paramInt] = paramByte;
    }
    getByteBuffer(start = 0, length) {
        length ?? (length = this.count - start);
        return Uint8Array.from(this.buffer.subarray(start, length));
    }
    /**
     * Same as .toString, but apply the default charset
     * @returns
     */
    getString() {
        return Buffer.from(this.buffer.subarray(0, this.count)).toString(Octets.DEFAULT_CHARSET);
    }
    toString() {
        return Buffer.from(this.buffer.subarray(0, this.count)).toString();
    }
    toHexString() {
        return Array.from(this.getBytes()).map(b => ('0' + (b & 0xFF).toString(16)).toUpperCase().slice(-2)).join('');
    }
    setString(value) {
        this.buffer = Buffer.from(value, Octets.DEFAULT_CHARSET);
        this.count = this.buffer.length;
    }
    static getCharset() {
        return Octets.DEFAULT_CHARSET;
    }
    static setDefaultCharset(paramString) {
        Octets.DEFAULT_CHARSET = paramString;
    }
    clone() {
        return new Octets(this);
    }
    compareTo(paramOctets) {
        const i = Math.min(this.count, paramOctets.count);
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
    static arrayCopy(src, srcStart, target, targetStart, length) {
        for (let i = 0; i < length; i++) {
            target[targetStart + i] = src[srcStart + i];
        }
    }
    static copy(src, start, end) {
        const copy = new Uint8Array(end - start);
        Octets.arrayCopy(src, start, copy, 0, end - start);
        return copy;
    }
}
exports.Octets = Octets;
Octets.DEFAULT_SIZE = 128;
Octets.DEFAULT_CHARSET = 'utf16le';
