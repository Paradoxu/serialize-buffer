import { OctetsStream } from './octets_stream';

export class CheckOctetsStream extends OctetsStream {
  checkPolicy = true;
  checkedSize = 0;

  constructor(data: number) {
    super(data);
  }
}
