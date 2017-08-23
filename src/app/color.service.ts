import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

    constructor() { }

    public COMPLETED: string = '#618058';
    public ERROR: string = '#9d3f2e';
    public ERROR_DATA: string = '#9d3f2e';
    public ERROR_ALGORITHM: string = '#9d642e';
    public ERROR_SYSTEM: string = '#9d892e';

}
