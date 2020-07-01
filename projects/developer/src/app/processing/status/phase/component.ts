import { Component, OnDestroy, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { MenuItem } from 'primeng/api';

import { Job } from '../../jobs/api.model';
import { Recipe } from '../../recipes/api.model';
import { PHASE_STATUS } from '../api.service';

enum ICONS {
    NotStarted = 'fa-question-circle',
    InProgress = 'fa-circle-o-notch fa fa-spinner fa-spin',
    Complete = 'fa-check-circle',
    Failed = 'fa-exclamation-circle'
}

@Component({
    selector: 'dev-processing-status-phase',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class ProcessingStatusPhaseComponent implements OnInit, OnDestroy {
    @Input() label: string;
    // provide either jobs or recipes
    @Input() jobs: Job[];
    @Input() recipes: Recipe[];

    public menuItems: MenuItem[] = [];
    private subscriptions = [];


    constructor(
    ) {
    }

    ngOnInit() {
        if (this.jobs && this.jobs.length) {
            // set menu items in the dropdown based on the jobs
            this.menuItems = this.jobs.map(j => {
                let icon = ICONS.NotStarted;
                let styleClass: string;

                // determine the icon and class based on the job status
                if (j.status === 'COMPLETED') {
                    icon = ICONS.Complete;
                    styleClass = 'status-complete';
                } else if (j.status === 'RUNNING') {
                    icon = ICONS.InProgress;
                    styleClass = 'status-running';
                } else if (j.status === 'FAILED') {
                    icon = ICONS.Failed;
                    styleClass = 'status-failed';
                }

                return {
                    label: `${j.job_type.title} v${j.job_type.version}`,
                    icon: `fa ${icon}`,
                    styleClass,
                    routerLink: `/processing/jobs/${j.id}`,
                };
            });
        }

        if (this.recipes && this.recipes.length) {
            // set menu items in the dropdown based on the sub recipes
            this.menuItems = this.recipes.map(r => {
                return {
                    label: `${r.recipe_type['title']} rev. ${r.recipe_type['revision_num']}`,
                    icon: `fa ${r.is_completed ? ICONS.Complete : ICONS.InProgress}`,
                    styleClass: r.is_completed ? 'status-complete' : 'status-unknown',
                    routerLink: `/processing/recipes/${r.id}`
                };
            });
        }
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    /**
     * Getter for the overall status, based on the status of all the jobs.
     * @return the overall status
     */
    get status(): PHASE_STATUS {
        // complete if no jobs
        // also complete if recipes are provided, since we don't know their status
        if (!this.jobs || !this.jobs.length) {
            return PHASE_STATUS.Complete;
        }

        // completed if all jobs are complete
        if (_.every(this.jobs, j => j.status === 'COMPLETED')) {
            return PHASE_STATUS.Complete;
        }
        // failed if any job has failed
        if (this.jobs.filter(j => j.status === 'FAILED').length) {
            return PHASE_STATUS.Failed;
        }
        // running if any job is running
        if (this.jobs.filter(j => j.status === 'RUNNING').length) {
            return PHASE_STATUS.InProgress;
        }
        return PHASE_STATUS.NotStarted;
    }

    /**
     * Getter for the overall status icon, based on the overall status getter.
     * @return the overall status icon
     */
    get icon(): string {
        if (this.status === PHASE_STATUS.NotStarted) {
            return ICONS.NotStarted;
        } else if (this.status === PHASE_STATUS.InProgress) {
            return ICONS.InProgress;
        } else if (this.status === PHASE_STATUS.Complete) {
            return ICONS.Complete;
        } else if (this.status === PHASE_STATUS.Failed) {
            return ICONS.Failed;
        }
        return '';
    }

    /**
     * Getter for the overall color, based on the overall status getter.
     * @return overall color of the button
     */
    get color(): string {
        if (this.status === PHASE_STATUS.InProgress) {
            return 'ui-button-info';
        } else if (this.status === PHASE_STATUS.Complete) {
            return 'ui-button-success';
        } else if (this.status === PHASE_STATUS.Failed) {
            return 'ui-button-danger';
        }
        return 'ui-button-secondary';
    }

    /**
     * Unsubscribe from all subscriptions.
     */
    private unsubscribe(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
        this.subscriptions = [];
    }

}
