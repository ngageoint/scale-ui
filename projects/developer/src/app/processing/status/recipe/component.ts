import { Component, OnDestroy, OnInit, OnChanges, Input } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { ProcessingStatusApiService } from '../api.service';
import { Job } from '../../jobs/api.model';
import { Recipe } from '../../recipes/api.model';


enum STATUS {
    Incomplete = 'Incomplete',
    Complete = 'Complete',
    Running = 'Running'
}

@Component({
    selector: 'dev-processing-status-recipe',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ProcessingStatusRecipeComponent implements OnInit, OnDestroy, OnChanges {
    @Input() recipe: Recipe;

    // loading status when fetching jobs
    public isLoading = false;
    // calculated label for column based on jobs
    public status: STATUS;
    // calculated human-readable processing time for column based on jobs and status
    public duration = '';
    // calcaulated label for duration column based on status
    public durationLabel = '';
    // all jobs
    public jobs: Job[] = [];
    // jobs in the "parse" category
    public parseJobs: Job[] = [];
    // jobs in the "publish" category
    public publishJobs: Job[] = [];
    // remaining jobs not categorized
    public processingJobs: Job[] = [];

    private subscriptions = [];

    constructor(
        private api: ProcessingStatusApiService
    ) {
    }

    ngOnInit(): void {
        this.fetchJobs();
    }

    ngOnDestroy(): void {
        this.unsubscribe();
    }

    ngOnChanges(): void {
        // refetch jobs whenever changes are detected
        // completed recipes do not need to be updated
        if (!this.recipe.is_completed) {
            this.fetchJobs();
        }
    }

    /**
     * Fetch jobs for the recipe.
     */
    private fetchJobs(): void {
        this.isLoading = true;

        this.subscriptions.push(
            this.api.getJobsForRecipe(this.recipe.id).subscribe(jobs => {
                this.isLoading = false;
                this.jobs = jobs.results;
                this.partitionJobs();
                this.createJobFields();
            })
        );
    }

    /**
     * Unsubscribe from all subscriptions.
     */
    private unsubscribe(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }

    /**
     * Partition jobs into separate categories.
     */
    private partitionJobs(): void {
        let remainingJobs: Job[];

        // partition first by the "parse" jobs
        // any job with "parse" in the title, name, or description
        [this.parseJobs, remainingJobs] = _.partition(this.jobs, (j: Job) => {
            return j.job_type.name.toLowerCase().includes('parse') ||
                   j.job_type.title.toLowerCase().includes('parse') ||
                   j.job_type.description.toLowerCase().includes('parse');
        });

        // partition remaining jobs into "publish" jobs
        [this.publishJobs, remainingJobs] = _.partition(remainingJobs, j => {
            return j.job_type.is_published;
        });

        // all other jobs will be considered "processing"
        this.processingJobs = remainingJobs;
    }

    /**
     * Calculates additional fields for the recipe based on the jobs.
     */
    private createJobFields(): void {
        let durationEnd: moment.Moment;

        if (this.recipe.is_completed) {
            // recipe is marked as completed
            // always use "complete" status
            this.status = STATUS.Complete;
            // duration will be from the recipe start to it's completion
            durationEnd = moment(this.recipe.completed);
            this.durationLabel = 'Completed in';
        } else {
            // recipe is not complete, base fields on whether or not any job has failed
            // look to see if any of the jobs are in a failed state
            let hasFailedJob = false;
            this.jobs.forEach(job => {
                if (job.status === 'FAILED') {
                    hasFailedJob = true;
                }
            });

            if (hasFailedJob) {
                // at least one job has failed, so use "incomplete" state
                this.status = STATUS.Incomplete;
                // duration will be from recipe start to last modified time
                durationEnd = moment(this.recipe.last_modified);
                this.durationLabel = 'Ran for';
            } else {
                // default to running state
                this.status = STATUS.Running;
                // durtion will be from recipe start to now
                durationEnd = moment();
                this.durationLabel = 'Running for';
            }
        }

        // create human-readable duration
        const durationStart = moment(this.recipe.created);
        const duration = moment.duration(durationEnd.diff(durationStart));
        this.duration = duration.humanize();
    }

}
