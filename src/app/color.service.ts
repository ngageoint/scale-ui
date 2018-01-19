import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

    public COMPLETED = '#576f50';
    public ERROR = '#88382a';
    public FAILED = '#88382a';
    public ERROR_DATA = '#88382a';
    public ERROR_ALGORITHM = '#88582A';
    public ERROR_SYSTEM = '#88772A';
    public PENDING = '#C5FBB5';
    public QUEUED = '#93BB87';
    public RUNNING = '#576F50';

    constructor() { }
}
