import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';

import { IngestFile } from '../../common/models/api.ingest-file.model';

export class ScanConfiguration {
    files_to_ingest_display: SelectItem[] = [];

    private static build(data) {
        if (data) {
            return new ScanConfiguration(
                data.workspace,
                data.scanner,
                data.recursive,
                IngestFile.transformer(data.files_to_ingest)
            );
        }
    }

    public static transformer(data) {
        if (data) {
            return ScanConfiguration.build(data);
        }
        return new ScanConfiguration('', {}, false, []);
    }

    public addIngestFile(file): object {
        if (!this.files_to_ingest) {
            this.files_to_ingest = [];
        }
        file = _.pickBy(file, d => {
            return d !== null && typeof d !== 'undefined' && d !== '';
        });
        const fileToAdd = IngestFile.transformer(file);
        this.files_to_ingest.push(fileToAdd);
        this.files_to_ingest_display.push({
            label: JSON.stringify(file, null, 4),
            value: fileToAdd
        });
        return fileToAdd;
    }

    public removeIngestFile(file): object {
        const fileToRemove = IngestFile.transformer(file);
        _.remove(this.files_to_ingest, f => {
            return _.isEqual(f, fileToRemove);
        });
        _.remove(this.files_to_ingest_display, (f: any) => {
            return _.isEqual(f.value, file);
        });
        return fileToRemove;
    }

    constructor(
        public workspace: string,
        public scanner: any,
        public recursive: boolean,
        public files_to_ingest: any
    ) {
        if (this.files_to_ingest) {
            _.forEach(this.files_to_ingest, file => {
                this.files_to_ingest_display.push({
                    label: JSON.stringify(file, null, 4),
                    value: IngestFile.transformer(file)
                });
            });
        }
    }
}
