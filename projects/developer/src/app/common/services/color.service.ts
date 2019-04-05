import { Injectable } from '@angular/core';

@Injectable()
export class ColorService {
    public static ERROR = '#D5393E';
    public static ERROR_DATA = '#e02026';
    public static ERROR_ALGORITHM = '#be292e';
    public static ERROR_SYSTEM = '#912125';
    public static COMPLETED = '#017cce';
    public static FAILED = '#88382a';
    public static PENDING = '#e46f21'; // FAILS ADA
    public static QUEUED = '#FFC505';
    public static RUNNING = '#529D39';
    public static CANCELED = '#000000';
    public static BLOCKED = '#cf6a34';
    public static INGEST = '#bbbbbb';
    public static SCALE_BLUE1 = '#48ACFF';
    public static SCALE_BLUE2 = '#017cce';
    public static SCALE_BLUE3 = '#24567F';
    public static RECIPE_NODE = '#777';
    public static WARNING = '#fdb813';

    constructor() { }

    static getRgba(hex, opacity?: number) {
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
