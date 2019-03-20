import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {

    public ERROR = '#D5393E';
    public ERROR_DATA = '#e02026';
    public ERROR_ALGORITHM = '#be292e';
    public ERROR_SYSTEM = '#912125';
    public COMPLETED = '#017cce';
    public FAILED = '#88382a';
    public PENDING = '#e46f21'; // FAILS ADA
    public QUEUED = '#FFC505';
    public RUNNING = '#529D39';
    public CANCELED = '#000000';
    public BLOCKED = '#cf6a34';
    public INGEST = '#bbbbbb';
    public SCALE_BLUE1 = '#48ACFF';
    public SCALE_BLUE2 = '#017cce';
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
