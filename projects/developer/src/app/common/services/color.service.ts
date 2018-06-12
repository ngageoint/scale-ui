import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

    public ERROR = '#55231A';
    public ERROR_DATA = '#88382a';
    public ERROR_ALGORITHM = '#88582A';
    public ERROR_SYSTEM = '#88772A';
    public COMPLETED = '#576f50';
    public FAILED = '#88382a';
    public PENDING = '#DBA59C';
    public QUEUED = '#9A59B1';
    public RUNNING = '#0071BC';
    public INGEST = '#bbbbbb';
    public SCALE_BLUE1 = '#48ACFF';
    public SCALE_BLUE2 = '#0071BC';
    public SCALE_BLUE3 = '#24567F';
    public RECIPE_NODE = '#777';
    public WARNING = '#fdb813';

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
