import { Component, OnInit } from '@angular/core';
import { SelectItem } from 'primeng/api';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Batch } from './api.model';
import { BatchesApiService } from './api.service';
import { DataService } from '../../common/services/data.service';
import { RecipeType } from '../../configuration/recipe-types/api.model';
import { RecipeTypesApiService } from '../../configuration/recipe-types/api.service';

@Component({
    selector: 'dev-batches-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class BatchesCreateComponent implements OnInit {
    batch = new Batch();
    recipeTypeOptions: SelectItem[] = [];
    dateRangeOptions: SelectItem[] = [
        {
            label: 'Created',
            value: 'created'
        },
        {
            label: 'Data',
            value: 'data'
        }
    ];
    jobOptions: SelectItem[] = [];
    startTime = {
        hour: '00',
        minute: '00',
        second: '00'
    };
    endTime = {
        hour: '00',
        minute: '00',
        second: '00'
    };

    constructor(
        private batchesApiService: BatchesApiService,
        private dataService: DataService,
        private recipeTypesApiService: RecipeTypesApiService
    ) {
        this.batch.title = 'Untitled Batch';
    }

    private getRecipeTypes() {
        return this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            const recipeTypes = RecipeType.transformer(data.results);
            _.forEach(recipeTypes, rt => {
                this.recipeTypeOptions.push({
                    label: rt.title,
                    value: rt
                });
            });
        }, err => {
            console.log('Error retrieving recipe types: ' + err);
        });
    }

    onDateRangeStartSelect(event) {
        this.batch.definition.date_range.started = moment.utc(event, 'YYYY-MM-DD').toISOString();
    }

    onDateRangeEndSelect(event) {
        this.batch.definition.date_range.ended = moment.utc(event, 'YYYY-MM-DD').toISOString();
    }

    setJobs() {
        _.forEach(this.batch.recipe_type.definition.jobs, job => {
            this.jobOptions.push({
                label: job.name,
                value: job.name
            });
        });
    }

    setAllJobs(event) {
        this.batch.definition.all_jobs = event;
    }

    changeTime(type, unit) {
        if (this.batch.definition.date_range) {
            if (this[type][unit].length > 2) {
                this[type][unit] = ('0' + this[type].hour).slice(-2);
            }
            if (!isNaN(this[type][unit])) {
                if (this[type].hour > 23 || this[type].hour < 0) {
                    this[type].hour = this[type].hour > 23 ? 23 : 0;
                }
                if (this[type].minute > 59 || this[type].minute < 0) {
                    this[type].minute = this[type].minute > 59 ? 59 : 0;
                }
                if (this[type].second > 59 || this[type].second < 0) {
                    this[type].second = this[type].second > 59 ? 59 : 0;
                }
                const timeSet = type === 'startTime' ?
                    moment.utc(this.batch.definition.date_range.started, 'YYYY-MM-DD') :
                    moment.utc(this.batch.definition.date_range.ended, 'YYYY-MM-DD');
                timeSet.set({
                    'hour': (this[type].hour).slice(-2),
                    'minute': (this[type].minute).slice(-2),
                    'second': (this[type].second).slice(-2)
                });
                if (type === 'startTime') {
                    this.batch.definition.date_range.started = timeSet.toDate();
                    console.log('start time: ' + this.batch.definition.date_range.started.toISOString());
                } else if (type === 'endTime') {
                    this.batch.definition.date_range.ended = timeSet.toDate();
                    console.log('end time: ' + this.batch.definition.date_range.ended.toISOString());
                }
            }
        }
    }

    keydown($event, unit, type) {
        let max = 0;
        if (unit === 'hour') {
            max = 23;
        } else if (unit === 'minute' || unit === 'second') {
            max = 60;
        }
        if ($event.keyCode === 38) {
            // up arrow
            if (isNaN(this[type][unit])) {
                this[type][unit] = ('0' + 0).slice(-2);
            }
            if (this[type][unit] < max) {
                this[type][unit]++;
            }
            this[type][unit] = ('0' + this[type][unit]).slice(-2);
            this.changeTime(type, unit);
        } else if ($event.keyCode === 40) {
            // down arrow
            if (isNaN(this[type][unit])) {
                this[type][unit] = ('0' + 0).slice(-2);
            }
            if (this[type][unit] > 0) {
                this[type][unit]--;
            }
            this[type][unit] = ('0' + this[type][unit]).slice(-2);
            this.changeTime(type, unit);
        }
    }

    ngOnInit() {
        this.getRecipeTypes();
    }
}
