import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { StrikeIngestFile } from './api.ingest-file.model';

export class StrikeConfiguration {
    files_to_ingest_display: SelectItem[] = [];
    private static build(data) {
        if (data) {
            return new StrikeConfiguration(
                data.workspace,
                data.monitor,
                StrikeIngestFile.transformer(data.files_to_ingest)
            );
        }
    }
    public static transformer(data) {
        if (data) {
            return StrikeConfiguration.build(data);
        }
        return null;
    }
    constructor(
        public workspace: string,
        public monitor: any,
        public files_to_ingest: any
    ) {
        if (this.files_to_ingest) {
            _.forEach(this.files_to_ingest, file => {
                this.files_to_ingest_display.push({
                    label: JSON.stringify(file, null, 4),
                    value: file
                });
            });
        }
    }
}
