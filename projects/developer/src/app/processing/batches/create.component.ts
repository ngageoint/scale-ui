import { Component, OnInit } from '@angular/core';
import { Validators, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { Message, MenuItem, SelectItem } from 'primeng/api';
import * as moment from 'moment';

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
    recipeTypes: any;
    createForm: FormGroup;
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

    constructor(
        private batchesApiService: BatchesApiService,
        private dataService: DataService,
        private recipeTypesApiService: RecipeTypesApiService,
        private fb: FormBuilder,
    ) {
        this.batch = new Batch();
        this.createForm = this.fb.group({
            'title': new FormControl('', Validators.required),
            'recipeType': new FormControl('', Validators.required),
            'description': new FormControl('')
        });
    }

    private getRecipeTypes() {
        return this.recipeTypesApiService.getRecipeTypes().subscribe(data => {
            this.recipeTypes = RecipeType.transformer(data.results);
        }, err => {
            console.log('Error retrieving recipe types: ' + err);
        });
    }

    setTime(type) {
        if (type === 'started') {
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

    onDateRangeStartSelect(event) {
        console.log(event);
    }

    onDateRangeEndSelect(event) {
        console.log(event);
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
                    moment.utc(this.batch.definition.date_range.started.toISOString()) :
                    moment.utc(this.batch.definition.date_range.ended.toISOString());
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

    keypress($event, unit, type) {
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
