"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberUtils = void 0;
const buffer32 = new Int8Array(4);
const int32 = new Int32Array(buffer32.buffer, 0, 1);
const float32 = new Float32Array(buffer32.buffer, 0, 1);
const buffer64 = new Int8Array(8);
const bigintArray = new BigInt64Array(buffer64.buffer, 0, 1);
const double = new Float64Array(buffer64.buffer, 0, 1);
exports.numberUtils = {
    /**
     * Returns a float representation of the given int bits. ArrayBuffer
     * is used for the conversion.
     *
     * @method  intBitsToFloat
     * @static
     * @param  {Number} i the int to cast
     * @return {Number}   the float
     */
    intBitsToFloat: (i) => {
        int32[0] = i;
        return float32[0];
    },
    /**
     * Returns the int bits from the given float. ArrayBuffer is used
     * for the conversion.
     *
     * @method  floatToIntBits
     * @static
     * @param  {Number} f the float to cast
     * @return {Number}   the int bits
     */
    floatToIntBits: (f) => {
        float32[0] = f;
        return int32[0];
    },
    /**
     * Returns a double(64 bits) representation of the given bits. ArrayBuffer
     * is used for the conversion.
     */
    bigIntToDouble: (i) => {
        bigintArray[0] = i;
        return double[0];
    },
    /**
     * Returns the int bits from the given float. ArrayBuffer is used
     * for the conversion.
     */
    doubleToBigInt: (f) => {
        double[0] = f;
        return bigintArray[0];
    },
};
