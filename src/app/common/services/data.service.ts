import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class DataService {

    constructor() {
    }

    private padWithZero(input, length) {
        // Cast input to string
        input = '' + input;

        const paddingSize = Math.max(0, length - input.length);
        return new Array(paddingSize > 0 ? paddingSize + 1 : 0).join('0') + input;
    }

    public calculateFileSizeFromMib(num) {
        if (num > 0) {
            if (num < 1024) {
                return num.toFixed(2) + ' MB';
            }
            if (num >= 1024 && num < 1024 * 1024) {
                return (num / 1024).toFixed(2) + ' GB';
            }
            return (num / 1024 / 1024).toFixed(2) + ' TB';
        }
        return num;
    }

    public calculateFileSizeFromBytes(num, decimals) {
        if (num > 0) {
            if (num < 1024) {
                return num.toFixed(decimals) + ' Bytes';
            }
            if (num >= 1024 && num < 1024 * 1024) {
                return (num / 1024).toFixed(decimals) + ' KB';
            }
            if (num >= 1024 * 1024 && num < 1024 * 1024 * 1024) {
                return (num / 1024 / 1024).toFixed(decimals) + ' MB';
            }
            if (num >= 1024 * 1024 * 1024 && num < 1024 * 1024 * 1024 * 1024) {
                return (num / 1024 / 1024 / 1024).toFixed(decimals) + ' GB';
            }
            return (num / 1024 / 1024 / 1024 / 1024).toFixed(decimals) + ' TB';
        }
        return num;
    }

    public calculateDuration(start, stop, noPadding?) {
        const to = moment.utc(stop),
            from = moment.utc(start),
            diff = moment.utc(to).diff(moment.utc(from)),
            duration = moment.duration(diff);

        let durationStr = '';

        if (!noPadding) {
            durationStr = duration.years() > 0 ? durationStr + this.padWithZero(duration.years(), 2) + 'Y, ' : durationStr;
            durationStr = duration.months() > 0 ? durationStr + this.padWithZero(duration.months(), 2) + 'M, ' : durationStr;
            durationStr = duration.days() > 0 ? durationStr + this.padWithZero(duration.days(), 2) + 'D, ' : durationStr;
            durationStr = duration.hours() > 0 ? durationStr + this.padWithZero(duration.hours(), 2) + 'h, ' : durationStr;
            durationStr = duration.minutes() > 0 ? durationStr + this.padWithZero(duration.minutes(), 2) + 'm, ' : durationStr;
            durationStr = durationStr + this.padWithZero(duration.seconds(), 2) + 's';
        } else {
            durationStr = duration.years() > 0 ? durationStr + duration.years() + 'Y, ' : durationStr;
            durationStr = duration.months() > 0 ? durationStr + duration.months() + 'M, ' : durationStr;
            durationStr = duration.days() > 0 ? durationStr + duration.days() + 'D, ' : durationStr;
            durationStr = duration.hours() > 0 ? durationStr + duration.hours() + 'h, ' : durationStr;
            durationStr = duration.minutes() > 0 ? durationStr + duration.minutes() + 'm, ' : durationStr;
            durationStr = durationStr + duration.seconds() + 's';
        }

        return durationStr;
    }

    public formatDate(date, humanize?: boolean) {
        humanize = humanize || false;
        if (date) {
            return humanize ?
                _.capitalize(moment.utc(date).from(moment.utc())) :
                moment.utc(date).format(environment.dateFormat);
        }
        return '';
    }

    public getViewportSize() {
        const w = window,
            d = document,
            e = d.documentElement,
            g = document.body,
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight || e.clientHeight || g.clientHeight;

        return {
            width: x,
            height: y
        };
    }

    public getApiPrefix(endpoint) {
        const versionObj = _.find(environment.apiVersions, { endpoint: endpoint });
        const version = versionObj ? versionObj.version : environment.apiDefaultVersion;
        return `${environment.apiPrefix}/${version}`;
    }
}
