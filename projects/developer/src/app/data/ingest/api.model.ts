import { DataService } from '../../common/services/data.service';

export class Ingest {
    transferStartedTooltip: any;
    transferEndedTooltip: any;
    transferStartedDisplay: any;
    transferEndedDisplay: any;
    ingestStartedTooltip: any;
    ingestEndedTooltip: any;
    ingestStartedDisplay: any;
    ingestEndedDisplay: any;
    bytesTransferredFormatted: any;
    fileSizeFormatted: any;
    statusClass: any;

    private static build(data) {
        if (data) {
            return new Ingest(
                data.id,
                data.file_name,
                data.scan,
                data.strike,
                data.status,
                data.bytes_transferred,
                data.transfer_started,
                data.transfer_ended,
                data.media_type,
                data.file_size,
                data.data_type,
                data.file_path,
                data.workspace,
                data.new_file_path,
                data.new_workspace,
                data.job,
                data.ingest_started,
                data.ingest_ended,
                data.source_file,
                data.data_started,
                data.data_ended,
                data.created,
                data.last_modified,
                data.selected
            );
        }
    }
    public static transformer(data) {
        if (data) {
            if (Array.isArray(data)) {
                return data.map(item => Ingest.build(item));
            }
            return Ingest.build(data);
        }
        return null;
    }

    constructor(
        public id: number,
        public file_name: string,
        public scan: any,
        public strike: any,
        public status: string,
        public bytes_transferred: number,
        public transfer_started: any,
        public transfer_ended: any,
        public media_type: string,
        public file_size: number,
        public data_type: any,
        public file_path: string,
        public workspace: any,
        public new_file_path: string,
        public new_workspace: any,
        public job: any,
        public ingest_started: any,
        public ingest_ended: any,
        public source_file: any,
        public data_started: any,
        public data_ended: any,
        public created: any,
        public last_modified: any,
        public selected?: boolean
    ) {
        this.transferStartedTooltip = this.transfer_started ? DataService.formatDate(this.transfer_started) : '';
        this.transferEndedTooltip = this.transfer_ended ? DataService.formatDate(this.transfer_ended) : '';
        this.transferStartedDisplay = this.transfer_started ? DataService.formatDate(this.transfer_started, true) : '';
        this.transferEndedDisplay = this.transfer_ended ? DataService.formatDate(this.transfer_ended, true) : '';
        this.ingestStartedTooltip = this.ingest_started ? DataService.formatDate(this.ingest_started) : '';
        this.ingestEndedTooltip = this.ingest_ended ? DataService.formatDate(this.ingest_ended) : '';
        this.ingestStartedDisplay = this.ingest_started ? DataService.formatDate(this.ingest_started, true) : '';
        this.ingestEndedDisplay = this.ingest_ended ? DataService.formatDate(this.ingest_ended, true) : '';
        this.bytesTransferredFormatted = this.bytes_transferred ?
            DataService.calculateFileSizeFromBytes(this.bytes_transferred, 2) :
            '';
        this.fileSizeFormatted = this.file_size ? DataService.calculateFileSizeFromBytes(this.file_size, 2) : '';
        this.statusClass = this.status === 'RUNNING' ?
            `${this.status.toLowerCase()}-text throb-text` :
            `${this.status.toLowerCase()}-text`;
    }
}
