import { OctetsStream } from './octets_stream';
export declare class CheckOctetsStream extends OctetsStream {
    checkPolicy: boolean;
    checkedSize: number;
    constructor(data: number);
}
