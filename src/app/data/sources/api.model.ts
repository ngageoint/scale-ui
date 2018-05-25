import { environment } from '../../../environments/environment';
import { DataService } from '../../data.service';
import * as moment from 'moment';

export class Source {
    dataService: DataService;
    file_size_formatted: string;
    last_modified_formatted: string;

    private static build(data) {
        if (data) {
            return new Source(
                data.id,
                data.workspace,
                data.file_name,
                data.media_type,
                data.file_size,
                data.data_type,
                data.is_deleted,
                data.uuid,
                data.url,
                data.created,
                data.deleted,
                data.data_started,
                data.data_ended,
                data.geometry,
                data.center_point,
                data.meta_data,
                data.countries,
                data.last_modified,
                data.is_parsed,
                data.parsed
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Source.build(item));
            }
            return Source.build(data);
        }
        return null;
    }
    constructor(
        public id: number,
        public workspace: any,
        public file_name: string,
        public media_type: string,
        public file_size: number,
        public data_type: string[],
        public is_deleted: boolean,
        public uuid: string,
        public url: string,
        public created: string,
        public deleted: string,
        public data_started: string,
        public data_ended: string,
        public geometry: string,
        public center_point: string,
        public meta_data: object,
        public countries: string[],
        public last_modified: string,
        public is_parsed: boolean,
        public parsed: string
    ) {
        this.dataService = new DataService();
        this.file_size_formatted = this.dataService.calculateFileSizeFromBytes(this.file_size, 0);
        this.last_modified_formatted = moment.utc(this.last_modified).format(environment.dateFormat);
    }
}
