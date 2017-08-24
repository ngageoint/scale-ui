import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

    public COMPLETED = '#618058';
    public ERROR = '#9d3f2e';
    public ERROR_DATA = '#9d3f2e';
    public ERROR_ALGORITHM = '#9d642e';
    public ERROR_SYSTEM = '#9d892e';

    constructor() { }
}
