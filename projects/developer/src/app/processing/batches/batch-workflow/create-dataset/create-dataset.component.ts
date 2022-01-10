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
import { UTCDates } from '../../../../common/utils/utcdates';
import { ValidationMessages } from '../../../../common/utils/CustomValidation';
import * as _ from 'lodash';
import { ApiResults } from 'projects/developer/src/app/common/models/api-results.model';

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
    @Input() batchRecipe: any = {};

    locationOptions: SelectItem[] = [];
    locationSelected: any = null;

    mediaTypeOptions: SelectItem[] = [];
    mediaTypeSelected: any = null;

    fileTypeOptions: SelectItem[] = [];
    @Input() multipleInputRecipe = false;

    datasetFileList: FileModel[] = [];
    filteredDatasetFileList: FileModel[] = [];
    datasetFilesData: ApiResults;
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
    fileTypesFilterControl: FormControl;
    optionalFiltersControl: FormGroup;

    titleMessage: string;
    startDateMessage: string;
    endDateMessage: string;
    totalFiles: number;

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
            { field: 'created', header: 'Ingested', width: '15%' },
            { field: 'file_name', header: 'File Name', width: '20%' },
            { field: 'file_type', header: 'File Type', width: '15%' },
            { field: 'media_type', header: 'Media Type', width: '20%' },
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

            const fileTypesFilterValue = this.datasetFormOptions
                .optionalFilters
                ? this.datasetFormOptions.optionalFilters.fileTypesFilter
                : null;
            this.fileTypesFilterControl = this.fb.control({
                value: fileTypesFilterValue,
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
            this.fileTypesFilterControl = this.fb.control({
                value: null,
                disabled: !this.datasetSelectionControl.value
            });

            this.optionalFiltersControl = this.fb.group({
                locationFilter: this.locationFilterControl,
                mediaTypesFilter: this.mediaTypesFilterControl,
                fileTypesFilter: this.fileTypesFilterControl
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
                options['type'] = this.form.get('searchTime').value;
                options['optionalFilters'] = this.form.get('optionalFilters').value;
                options['recipeFile'] = this.batchRecipe.definition.input.files[0];
                options['recipeJson'] = this.batchRecipe.definition.input.json[0];

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
        let type = 'ingest'
        if (this.form.get('searchTime').value === 'data') {
            type = 'data';
        }
        let options = {
            type: type,
            created_started: UTCDates.localDateToUTC(this.form.get('startDate').value).toISOString(),
            created_ended: UTCDates.localDateToUTC(this.form.get('endDate').value).toISOString(),
            file_type: this.dataFilesFilter.file_type,
            media_type: this.dataFilesFilter.media_type,
            countries: this.dataFilesFilter.countries
        };
        return options;
    }

    onQueryDataFilesClick() {
        // get list of files
        this.datatableLoading = true;
        if (this.form.get('startDate').valid && this.form.get('endDate').valid) {
            this.fileService
            .getFiles(this.createQueryOptions())
            .subscribe(data => {
                this.totalFiles = data.count;
                this.datasetFilesData = data;
                this.datasetFileList = data.results;
                this.filteredDatasetFileList = data.results;
                this.datatableLoading = false;
                this.buildOptionalFilters(data);
            });
        } else {
            const values = this.form.value;
            this.form.patchValue(values);
            this.form.get('startDate').markAsTouched();
            this.form.get('endDate').markAsTouched();
            this.form.get('startDate').markAsDirty();
            this.form.get('endDate').markAsDirty();
            this.form.get('searchTime').markAsDirty();
            this.form.updateValueAndValidity();
        }
    }

    buildOptionalFilters(data: ApiResults) {
        this.mediaTypeOptions = data.results
            .map((file) => file.media_type)
            .filter(onlyUnique)
            .map((mediaType) => ({
                label: mediaType,
                value: mediaType,
            }));

        this.locationOptions = []
            .concat(...data.results.map((file) => file.countries))
            .filter(onlyUnique)
            .map((country) => ({ label: country, value: country }));

        this.fileTypeOptions = [{ label: 'Product', value: 'PRODUCT' },
        { label: 'Source', value: 'SOURCE' }];
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
        this.onQueryDataFilesClick();
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
        this.onQueryDataFilesClick();
    }

    onFileTypeFilterChange(event) {
        if (!event.value) {
            delete this.dataFilesFilter.file_type;
        } else {
            this.dataFilesFilter = {
                ...this.dataFilesFilter,
                file_type : event.value
            };
        }
        this.filterDataSetFiles();
        this.onQueryDataFilesClick();
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
