import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { Message, MenuItem, SelectItem } from 'primeng/api';
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
    batch: Batch;
    recipeTypeOptions: SelectItem[] = [];
    jobOptions: SelectItem[] = [];
    dateRangeStarted: any;
    dateRangeEnded: any;
    msgs: Message[] = [];
    startTime = {
        hour: null,
        minute: null,
        second: null
    };
    endTime = {
        hour: null,
        minute: null,
        second: null
    };
    createForm = new FormGroup({
        'title': new FormControl('', Validators.required),
        'recipeType': new FormControl('', Validators.required),
        'description': new FormControl(),
        'dateRangeType': new FormControl(),
        'startHour': new FormControl({value: '', disabled: true}),
        'startMinute': new FormControl({value: '', disabled: true}),
        'startSecond': new FormControl({value: '', disabled: true}),
        'endHour': new FormControl({value: '', disabled: true}),
        'endMinute': new FormControl({value: '', disabled: true}),
        'endSecond': new FormControl({value: '', disabled: true}),
        'jobNames': new FormControl(),
        'allJobs': new FormControl(),
        'priority': new FormControl()
    });

    constructor(
        private batchesApiService: BatchesApiService,
        private dataService: DataService,
        private recipeTypesApiService: RecipeTypesApiService
    ) {}

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

    setTime(type) {
        if (type === 'start') {
            this.startTime = {
                hour: ('0' + moment.utc(this.batch.definition.date_range[type]).hour()).slice(-2),
                minute: ('0' + moment.utc(this.batch.definition.date_range[type]).minute()).slice(-2),
                second: ('0' + moment.utc(this.batch.definition.date_range[type]).second()).slice(-2)
            };
        } else {
            this.endTime = {
                hour: ('0' + moment.utc(this.batch.definition.date_range[type]).hour()).slice(-2),
                minute: ('0' + moment.utc(this.batch.definition.date_range[type]).minute()).slice(-2),
                second: ('0' + moment.utc(this.batch.definition.date_range[type]).second()).slice(-2)
            };
        }
    }

    bindStartTime() {
        this.createForm.get('startHour').setValue(this.startTime.hour);
        this.createForm.get('startMinute').setValue(this.startTime.minute);
        this.createForm.get('startSecond').setValue(this.startTime.second);
    }

    bindEndTime() {
        this.createForm.get('endHour').setValue(this.endTime.hour);
        this.createForm.get('endMinute').setValue(this.endTime.minute);
        this.createForm.get('endSecond').setValue(this.endTime.second);
    }

    onDateRangeStartSelect(event) {
        this.batch.definition.date_range.started = moment.utc(event, 'YYYY-MM-DD').toISOString();
        this.setTime('start');
        this.createForm.get('startHour').enable();
        this.createForm.get('startMinute').enable();
        this.createForm.get('startSecond').enable();
        this.bindStartTime();
    }

    onDateRangeEndSelect(event) {
        this.batch.definition.date_range.ended = moment.utc(event, 'YYYY-MM-DD').toISOString();
        this.setTime('end');
        this.createForm.get('endHour').enable();
        this.createForm.get('endMinute').enable();
        this.createForm.get('endSecond').enable();
        this.bindEndTime();
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
                    this.bindStartTime();
                    console.log('start time: ' + this.batch.definition.date_range.started.toISOString());
                } else if (type === 'endTime') {
                    this.batch.definition.date_range.ended = timeSet.toDate();
                    this.bindEndTime();
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
        this.batch = new Batch();
        this.getRecipeTypes();
    }
}
