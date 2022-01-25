"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckOctetsStream = void 0;
const octets_stream_1 = require("./octets_stream");
class CheckOctetsStream extends octets_stream_1.OctetsStream {
    constructor(data) {
        super(data);
        this.checkPolicy = true;
        this.checkedSize = 0;
    }
}
exports.CheckOctetsStream = CheckOctetsStream;
