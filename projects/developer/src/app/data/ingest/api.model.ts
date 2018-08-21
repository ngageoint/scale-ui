import { DataService } from '../../common/services/data.service';

export class Ingest {
    dataService: DataService;
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
                data.last_modified
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
        public last_modified: any
    ) {
        this.dataService = new DataService();
        this.transferStartedTooltip = this.dataService.formatDate(this.transfer_started);
        this.transferEndedTooltip = this.dataService.formatDate(this.transfer_ended);
        this.transferStartedDisplay = this.dataService.formatDate(this.transfer_started, true);
        this.transferEndedDisplay = this.dataService.formatDate(this.transfer_ended, true);
        this.ingestStartedTooltip = this.dataService.formatDate(this.ingest_started);
        this.ingestEndedTooltip = this.dataService.formatDate(this.ingest_ended);
        this.ingestStartedDisplay = this.dataService.formatDate(this.ingest_started, true);
        this.ingestEndedDisplay = this.dataService.formatDate(this.ingest_ended, true);
        this.bytesTransferredFormatted = this.dataService.calculateFileSizeFromBytes(this.bytes_transferred, 2);
        this.fileSizeFormatted = this.dataService.calculateFileSizeFromBytes(this.file_size, 2);
    }
}
