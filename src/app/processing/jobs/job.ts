export class Job {
    id: number;
    job_type: object;
    job_type_rev: object;
    event: object;
    error: object;
    status: string;
    priority: number;
    num_exes: number;
    timeout: number;
    max_tries: number;
    cpus_required: number;
    mem_required: number;
    disk_in_required: number;
    disk_out_required: number;
    is_superseded: boolean;
    root_superseded_job: object;
    superseded_job: object;
    superseded_by_job: object;
    delete_superseded: boolean;
    created: string;
    queued: string;
    started: string;
    ended: string;
    last_status_change: string;
    superseded: string;
    last_modified: string;
}
