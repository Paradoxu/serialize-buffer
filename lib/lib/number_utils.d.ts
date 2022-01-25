export declare const numberUtils: {
    /**
     * Returns a float representation of the given int bits. ArrayBuffer
     * is used for the conversion.
     *
     * @method  intBitsToFloat
     * @static
     * @param  {Number} i the int to cast
     * @return {Number}   the float
     */
    intBitsToFloat: (i: any) => number;
    /**
     * Returns the int bits from the given float. ArrayBuffer is used
     * for the conversion.
     *
     * @method  floatToIntBits
     * @static
     * @param  {Number} f the float to cast
     * @return {Number}   the int bits
     */
    floatToIntBits: (f: any) => number;
    /**
     * Returns a double(64 bits) representation of the given bits. ArrayBuffer
     * is used for the conversion.
     */
    bigIntToDouble: (i: bigint) => number;
    /**
     * Returns the int bits from the given float. ArrayBuffer is used
     * for the conversion.
     */
    doubleToBigInt: (f: number) => BigInt;
};
