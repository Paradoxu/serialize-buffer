import { OctetsStream } from './octets_stream';
export declare abstract class Marshal implements Record<string, any> {
    constructor();
    private getFields;
    marshal(os: OctetsStream): OctetsStream;
    unmarshal(os: OctetsStream): OctetsStream;
    /**
     * A function that calculates the size of the properties
     */
    get sizeOf(): number;
    private getSizeOfBasicField;
}
