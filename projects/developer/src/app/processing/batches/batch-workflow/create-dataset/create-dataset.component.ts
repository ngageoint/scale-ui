import { debounceTime } from 'rxjs/operators';
import { FileModel } from './../../../../common/services/files/file.model';
import { DatasetMemberDatatable } from './create-dataset-datable.model';
import { FilesApiService } from './../../../../common/services/files/api.service';
import { SelectItem } from 'primeng/api';
import { IDatasetDefinition } from '../../../../data/services/dataset';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DatasetsApiService } from '../../../../data/services/dataset.api.service';
import {
    FormGroup,
    FormBuilder,
    Validators,
    FormControl,
    AbstractControl
} from '@angular/forms';
import { onlyUnique } from '../../../../common/utils/filters';
import { ValidationMessages } from '../../../../common/utils/CustomValidation';
import * as _ from 'lodash';

@Component({
    selector: 'dev-create-dataset',
    templateUrl: './create-dataset.component.html',
    styleUrls: ['./create-dataset.component.scss']
})
export class CreateDatasetComponent implements OnInit {
    form: FormGroup;
    data: IDatasetDefinition;
    @Output() valueChange = new EventEmitter();
    @Output() nextStepEvent = new EventEmitter();

    datasetOptions: SelectItem[] = [];
    @Input() datasetSelection: any = {};
    @Input() datasetFormOptions: any = {};

    locationOptions: SelectItem[] = [];
    locationSelected: any = null;

    mediaTypeOptions: SelectItem[] = [];
    mediaTypeSelected: any = null;

    recipeTypeOptions: SelectItem[] = [];
    @Input() batchRecipe: any = null;
    @Input() multipleInputRecipe = false;

    datasetFileList: FileModel[] = [];
    filteredDatasetFileList: FileModel[] = [];
    dataFilesFilter: any = {};
    savedDataset: any;
    searchTimeTypes: SelectItem[] = [];

    datatableOptions: DatasetMemberDatatable;
    datatableLoading: boolean;
    datasetColumns: any[];

    datasetSelectionControl: FormControl;
    titleControl: FormControl;
    descriptionControl: FormControl;
    startDateControl: FormControl;
    endDateControl: FormControl;
    searchTimeControl: FormControl;
    locationFilterControl: FormControl;
    mediaTypesFilterControl: FormControl;
    recipeTypesFilterControl: FormControl;
    optionalFiltersControl: FormGroup;

    titleMessage: string;
    startDateMessage: string;
    endDateMessage: string;

    private validationMessages = {
        title: {
            name: 'titleMessage',
            required: 'Please enter a title for your dataset.'
        },
        startDate: {
            name: 'startDateMessage',
            required: 'Please select a start date for dataset files.'
        },
        endDate: {
            name: 'endDateMessage',
            required: 'Please select an end date for dataset files.'
        }
    };

    get yearRange(): string {
        const now = new Date();
        const start = now.getFullYear() - 20;
        const end = now.getFullYear() + 5;
        return `${start}:${end}`;
    }

    constructor(
        private datasetService: DatasetsApiService,
        private fileService: FilesApiService,
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        this.datatableOptions = new DatasetMemberDatatable(0, 20, 'id', -1);

        this.datasetColumns = [
            { field: 'id', header: 'ID', width: '10%' },
            { field: 'file_name', header: 'File Name', width: '30%' },
            { field: 'media_type', header: 'Media Type', width: '40%' },
            { field: 'countries', header: 'Location(s)', width: '20%' }
        ];

        this.searchTimeTypes = [
            { label: 'Data Time', value: 'data' },
            { label: 'Ingest Time', value: 'ingest' }
        ];

        if (this.datasetFormOptions) {
            this.datasetSelectionControl = this.fb.control(
                this.datasetFormOptions.datasetSelection || '',
                Validators.required
            );

            this.titleControl = this.fb.control(
                {
                    value: this.datasetFormOptions.title || '',
                    disabled: !this.datasetSelectionControl.value
                },
                Validators.required
            );

            this.descriptionControl = this.fb.control({
                value: this.datasetFormOptions.description || '',
                disabled: !this.datasetSelectionControl.value
            });

            this.startDateControl = this.fb.control(
                {
                    value: this.datasetFormOptions.startDate || '',
                    disabled: !this.datasetSelectionControl.value
                },
                Validators.required
            );

            this.endDateControl = this.fb.control(
                {
                    value: this.datasetFormOptions.endDate || '',
                    disabled: !this.datasetSelectionControl.value
                },
                Validators.required
            );

            this.searchTimeControl = this.fb.control({
                value: this.datasetFormOptions.searchTime || 'data',
                disabled: !this.datasetSelectionControl.value
            });

            const locationFilterValue = this.datasetFormOptions.optionalFilters
                ? this.datasetFormOptions.optionalFilters.locationFilter
                : null;
            this.locationFilterControl = this.fb.control({
                value: locationFilterValue,
                disabled: true
            });

            const mediaTypesFilterValue = this.datasetFormOptions
                .optionalFilters
                ? this.datasetFormOptions.optionalFilters.mediaTypesFilter
                : null;
            this.mediaTypesFilterControl = this.fb.control({
                value: mediaTypesFilterValue,
                disabled: true
            });

            const recipeTypesFilterValue = this.datasetFormOptions
                .optionalFilters
                ? this.datasetFormOptions.optionalFilters.recipeTypesFilter
                : null;
            this.recipeTypesFilterControl = this.fb.control({
                value: recipeTypesFilterValue,
                disabled: true
            });
        } else {
            this.datasetSelectionControl = this.fb.control(
                '',
                Validators.required
            );

            this.titleControl = this.fb.control(
                { value: '', disabled: !this.datasetSelectionControl.value },
                Validators.required
            );

            this.descriptionControl = this.fb.control({
                value: '',
                disabled: !this.datasetSelectionControl.value
            });

            this.startDateControl = this.fb.control(
                { value: '', disabled: !this.datasetSelectionControl.value },
                Validators.required
            );

            this.endDateControl = this.fb.control(
                { value: '', disabled: !this.datasetSelectionControl.value },
                Validators.required
            );

            this.searchTimeControl = this.fb.control(
                { value: 'data', disabled: !this.datasetSelectionControl.value },
                Validators.required
            );

            this.locationFilterControl = this.fb.control({
                value: null,
                disabled: !this.datasetSelectionControl.value
            });
            this.mediaTypesFilterControl = this.fb.control({
                value: null,
                disabled: !this.datasetSelectionControl.value
            });
            this.recipeTypesFilterControl = this.fb.control({
                value: null,
                disabled: !this.datasetSelectionControl.value
            });

            this.optionalFiltersControl = this.fb.group({
                locationFilter: this.locationFilterControl,
                mediaTypesFilter: this.mediaTypesFilterControl,
                recipeTypesFilter: this.recipeTypesFilterControl
            });
        }

        this.form = this.fb.group({
            datasetSelection: this.datasetSelectionControl
        });
        if (!this.multipleInputRecipe) {
            this.datasetOptions = [{ label: 'Create New', value: 'CreateNew' }];
        }

        this.datasetService.getDatasets({}).subscribe(
            data => {
                this.datasetOptions.push(
                    ...data.results.map(dataset => ({
                        label: dataset.title,
                        value: dataset
                    }))
                );
            },
            err => { }
        );

        this.titleControl.valueChanges
            .pipe(debounceTime(1000))
            .subscribe(() => {
                this.setMessage(
                    this.titleControl,
                    this.validationMessages.title
                );
            });

        this.startDateControl.valueChanges
            .pipe(debounceTime(1000))
            .subscribe(() => {
                this.setMessage(
                    this.startDateControl,
                    this.validationMessages.startDate
                );
            });

        this.endDateControl.valueChanges
            .pipe(debounceTime(1000))
            .subscribe(() => {
                this.setMessage(
                    this.endDateControl,
                    this.validationMessages.endDate
                );
            });

        if (this.datasetSelection) {
            this.form.patchValue({ datasetSelection: this.datasetSelection });
        }

        if (this.batchRecipe) {
            this.recipeTypeOptions = [
                {
                    label: `${this.batchRecipe.title} v${this.batchRecipe.revision_num}`,
                    value: this.batchRecipe
                }
            ];
            this.form.patchValue({ recipeTypesFilter: this.batchRecipe });
            this.recipeTypesFilterControl.disable();
        }
    }

    onDatasetSelectionClick() {
        if (!this.isCreateNewDataset()) {
            this.valueChange.emit({
                dataset: {
                    datasetSelection: this.form.get('datasetSelection').value
                }
            });
        } else {
            if (this.form.valid) {
                const options = {
                    title: this.form.get('title').value || '',
                    description: this.form.get('description').value || '',
                };
                options['startDate'] = new Date(this.form.get('startDate').value).toISOString();
                options['endDate'] = new Date(this.form.get('endDate').value).toISOString();
                options['optionalFilters'] = this.form.get('optionalFilters').value;

                this.datasetService.createDatasetWithDataTemplate(options)
                    .subscribe(savedDataset => {
                        this.savedDataset = savedDataset;
                    });
            } else {
                console.log('Please complete required fields before saving.');
            }
        }
        this.handleNextStep();
    }

    handleNextStep(): void {
        this.nextStepEvent.emit({
            dataset: {
                datasetSelection: this.form.get('datasetSelection').value,
                datasetFormOptions: this.form.value
            },
            index: 1
        });
    }

    isCreateNewDataset(): boolean {
        return this.form.get('datasetSelection').value === 'CreateNew';
    }

    canSave() {
        return (
            this.form.valid &&
            (this.datasetSelection !== 'CreateNew' ||
                (this.datasetSelection === 'CreateNew' &&
                    this.datasetFileList.length > 0))
        );
    }

    getDatasetButtonLabel(): string {
        return this.isCreateNewDataset() ? 'Create Dataset' : 'Select Dataset';
    }

    createQueryOptions(): any {
        let options = {};
        if (this.form.get('searchTime').value === 'data') {
            options = {
                data_started: this.form.get('startDate').value.toISOString(),
                data_ended: this.form.get('endDate').value.toISOString()
            };
        } else {
            options = {
                created_started: this.form.get('startDate').value.toISOString(),
                created_ended: this.form.get('endDate').value.toISOString()
            };
        }
        return options;
    }

    onQueryDataFilesClick() {
        // get list of files
        this.datatableLoading = true;
        if (
            this.form.get('startDate').valid &&
            this.form.get('endDate').valid
        ) {
            this.fileService
                .getFiles(this.createQueryOptions())
                .subscribe(data => {
                    this.datasetFileList = data.results;
                    this.filteredDatasetFileList = data.results;

                    this.mediaTypeOptions = this.datasetFileList
                        .map(file => file.media_type)
                        .filter(onlyUnique)
                        .map(mediaType => ({
                            label: mediaType,
                            value: mediaType
                        }));

                    this.locationOptions = []
                        .concat(...data.results.map(file => file.countries))
                        .filter(onlyUnique)
                        .map(country => ({ label: country, value: country }));

                    this.recipeTypeOptions = data.results
                        .map(file => file.recipe_type)
                        .filter((obj, pos, arr) => {
                            return (
                                arr
                                    .map(mapObj => mapObj['id'])
                                    .indexOf(obj['id']) === pos
                            );
                        })
                        .map(rt => ({
                            label: `${rt.title} v${rt.revision_num}`,
                            value: rt
                        }));

                    this.datatableLoading = false;
                });
        } else {
            const values = this.form.value;
            this.form.patchValue(values);
            this.form.get('startDate').markAsTouched();
            this.form.get('endDate').markAsTouched();
            this.form.get('startDate').markAsDirty();
            this.form.get('endDate').markAsDirty();
            this.form.get('searchTime').markAsDirty();
            this.form.updateValueAndValidity({ emitEvent: true });
        }
    }

    onDatasetSelectChange(event) {
        this.datasetSelection = event.value;
        if (this.isCreateNewDataset()) {
            this.form.addControl('title', this.titleControl);
            this.titleControl.enable();
            this.form.addControl('description', this.descriptionControl);
            this.descriptionControl.enable();
            this.form.addControl('startDate', this.startDateControl);
            this.startDateControl.enable();
            this.form.addControl('endDate', this.endDateControl);
            this.endDateControl.enable();
            this.form.addControl('searchTime', this.searchTimeControl);
            this.searchTimeControl.enable();
            this.form.addControl(
                'optionalFilters',
                this.optionalFiltersControl
            );
            this.optionalFiltersControl.enable();
        } else {
            this.titleControl.disable();
            this.descriptionControl.disable();
            this.startDateControl.disable();
            this.endDateControl.disable();
            this.searchTimeControl.disable();
            this.optionalFiltersControl.disable();
        }
    }

    filterDataSetFiles(): void {
        this.filteredDatasetFileList = _.filter(
            this.datasetFileList,
            this.dataFilesFilter
        );
    }

    onLocationFilterChange(event) {
        if (!event.value) {
            delete this.dataFilesFilter.countries;
        } else {
            this.dataFilesFilter = {
                ...this.dataFilesFilter,
                countries: [event.value]
            };
        }
        this.filterDataSetFiles();
    }

    onMediaTypeFilterChange(event) {
        if (!event.value) {
            delete this.dataFilesFilter.media_type;
        } else {
            this.dataFilesFilter = {
                ...this.dataFilesFilter,
                media_type: event.value
            };
        }
        this.filterDataSetFiles();
    }

    onRecipeTypeFilterChange(event) {
        if (!event.value) {
            delete this.dataFilesFilter.recipe_type;
        } else {
            this.dataFilesFilter = {
                ...this.dataFilesFilter,
                recipe_type: { id: event.value.id }
            };
        }
        this.filterDataSetFiles();
    }

    setMessage(
        control: AbstractControl,
        validationMessages: ValidationMessages
    ): void {
        this[validationMessages.name] = '';
        if ((control.touched || control.dirty) && control.errors) {
            this[validationMessages.name] = Object.keys(control.errors)
                .map(key => validationMessages[key])
                .join(' ');
        }
    }
}
