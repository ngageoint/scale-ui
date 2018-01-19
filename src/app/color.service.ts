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

    getRgba(hex, opacity?: number) {
        opacity = opacity || 0;
        // Expand shorthand form (e.g. '03F') to full form (e.g. '0033FF')
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity})` : null;
    }
}
