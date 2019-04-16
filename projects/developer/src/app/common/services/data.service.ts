import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import * as moment from 'moment';
import * as _ from 'lodash';

import { throwError } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DataService {
    selectedJobRows = [];
    selectedRecipeRows = [];
    selectedBatchRows = [];
    selectedIngestRows = [];
    selectedScanRows = [];
    profile: any;

    constructor() {}

    private static padWithZero(input, length) {
        // Cast input to string
        input = '' + input;

        const paddingSize = Math.max(0, length - input.length);
        return new Array(paddingSize > 0 ? paddingSize + 1 : 0).join('0') + input;
    }

    static calculateFileSizeFromMib(num) {
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

    static calculateFileSizeFromBytes(num, decimals) {
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

    static calculateDuration(start, stop, noPadding?) {
        const to = moment.utc(stop),
            from = moment.utc(start),
            diff = moment.utc(to).diff(moment.utc(from)),
            duration = moment.duration(diff);

        let durationStr = '';

        if (!noPadding) {
            durationStr = duration.years() > 0 ? durationStr + DataService.padWithZero(duration.years(), 2) + 'Y, ' : durationStr;
            durationStr = duration.months() > 0 ? durationStr + DataService.padWithZero(duration.months(), 2) + 'M, ' : durationStr;
            durationStr = duration.days() > 0 ? durationStr + DataService.padWithZero(duration.days(), 2) + 'D, ' : durationStr;
            durationStr = duration.hours() > 0 ? durationStr + DataService.padWithZero(duration.hours(), 2) + 'h, ' : durationStr;
            durationStr = duration.minutes() > 0 ? durationStr + DataService.padWithZero(duration.minutes(), 2) + 'm, ' : durationStr;
            durationStr = durationStr + DataService.padWithZero(duration.seconds(), 2) + 's';
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

    static formatDate(date, humanize?: boolean) {
        humanize = humanize || false;
        if (date) {
            return humanize ?
                _.capitalize(moment.utc(date).from(moment.utc())) :
                moment.utc(date).format(environment.dateFormat);
        }
        return '';
    }

    static getViewportSize() {
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

    static getApiPrefix(endpoint) {
        const versionObj: any = _.find(environment.apiVersions, { endpoint: endpoint });
        const version = versionObj ? versionObj.version : environment.apiDefaultVersion;
        return `${environment.apiPrefix}/${version}`;
    }

    static handleError(error: HttpErrorResponse) {
        let body = null;
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong,
            if (error.message) {
                body = error.message;
            } else if (error.error) {
                body = error.error.detail ?
                    error.error.detail :
                    error.error.message ?
                        error.error.message :
                        JSON.stringify(error);
            } else {
                body = error.toString();
            }
            console.error(
                `Backend returned code ${error.status}, ` +
                `body was: ${body}`);
        }
        // return an observable with a user-facing error message
        return throwError({
            statusText: body
        });
    }

    getSelectedJobRows() {
        return this.selectedJobRows;
    }

    setSelectedJobRows(data) {
        this.selectedJobRows.push(data);
    }

    getSelectedRecipeRows() {
        return this.selectedRecipeRows;
    }

    setSelectedRecipeRows(data) {
        this.selectedRecipeRows.push(data);
    }

    getSelectedBatchRows() {
        return this.selectedBatchRows;
    }

    setSelectedBatchRows(data) {
        this.selectedBatchRows.push(data);
    }

    getSelectedIngestRows() {
        return this.selectedIngestRows;
    }

    setSelectedIngestRows(data) {
        this.selectedIngestRows.push(data);
    }

    getSelectedScanRows() {
        return this.selectedScanRows;
    }

    setSelectedScanRows(data) {
        this.selectedScanRows = data;
    }

    getUserProfile() {
        return this.profile;
    }

    setUserProfile(data) {
        this.profile = data;
    }
}
