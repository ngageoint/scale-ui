import * as moment from 'moment';

export class UTCDates {
    constructor() {}

    /**
     * Converts and strips a date string to local date.
     * @param  date string or date with timezone component
     * @return      date object without timezone
     */
    public static utcDateToLocal(date: string | Date): Date {
        const v = moment(date).utc();
        // drop milliseconds since it isn't exposed to the user
        return new Date(
            v.year(), v.month(), v.date(),
            v.hours(), v.minutes(), v.seconds()
        );
    }

    /**
     * Converts and strips the given date to a date for UTC time.
     * @param  date string or date with timezone component
     * @return      date converted to UTC
     */
    public static localDateToUTC(date: Date): Date {
        const v = moment(date);
        // drop milliseconds since it isn't exposed to the user
        const utc = moment.utc([
            v.year(), v.month(), v.date(),
            v.hours(), v.minutes(), v.seconds()
        ]);
        return utc.toDate();
    }
}
