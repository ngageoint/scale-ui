import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

@Pipe({
    name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
    transform(value: string, limit = 25, completeWords = false, ellipsis = '...') {
        let truncateOptions = { length: limit };
        truncateOptions = Object.assign({ ...truncateOptions }, { omission: ellipsis });
        if (completeWords) {
            truncateOptions = Object.assign({ ...truncateOptions }, { separator: /,? +/ });
        }
        return _(value).truncate(truncateOptions);
    }
}
