import { debounceTime } from 'rxjs/operators';
import { FileModel } from './../../../../common/services/files/file.model';
import { DatasetMemberDatatable } from './create-dataset-datable.model';
import { FilesApiService } from './../../../../common/services/files/api.service';
import { SelectItem } from 'primeng/primeng';
import { IDatasetDefinition } from '../../../../data/services/dataset';
import { Component, OnInit } from '@angular/core';
import { DatasetsApiService } from '../../../../data/services/dataset.api.service';
import {
    FormGroup,
    FormBuilder,
    Validators,
    FormControl,
    AbstractControl
} from '@angular/forms';
import { onlyUnique } from '../../../../common/utils/filters';
import { ValidationMessages } from '../../../../common/utils/ValidationMessages';

@Component({
    selector: 'dev-create-dataset',
    templateUrl: './create-dataset.component.html',
    styleUrls: ['./create-dataset.component.scss']
})
export class CreateDatasetComponent implements OnInit {
    form: FormGroup;
    data: IDatasetDefinition;

    datasetOptions: SelectItem[] = [];
    selectedDataset: any = null;

    locationOptions: SelectItem[] = [];
    locationSelected: any = null;

    mediaTypeOptions: SelectItem[] = [];
    mediaTypeSelected: any = null;

    recipeTypeOptions: SelectItem[] = [];
    recipeTypeSelected: any = null;

    datasetFileList: FileModel[] = [];
    savedDataset: any;
    datatableOptions: DatasetMemberDatatable;

    datatableLoading: boolean;
    datasetColumns: any[];
    datasetSelectedControl: FormControl;
    titleControl: FormControl;
    descriptionControl: FormControl;
    startDateControl: FormControl;
    endDateControl: FormControl;
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
    ) {}

    ngOnInit() {
        this.datatableOptions = new DatasetMemberDatatable(0, 20, 'id', -1);

        this.datasetColumns = [
            { field: 'id', header: 'ID' },
            { field: 'file_name', header: 'File Name' },
            { field: 'media_type', header: 'Media Type' },
            { field: 'countries', header: 'Location(s)' }
        ];

        this.datasetSelectedControl = this.fb.control('', Validators.required);

        this.titleControl = this.fb.control(
            { value: '', disabled: !this.datasetSelectedControl.value },
            Validators.required
        );

        this.descriptionControl = this.fb.control({
            value: '',
            disabled: !this.datasetSelectedControl.value
        });

        this.startDateControl = this.fb.control(
            { value: '', disabled: !this.datasetSelectedControl.value },
            Validators.required
        );

        this.endDateControl = this.fb.control(
            { value: '', disabled: !this.datasetSelectedControl.value },
            Validators.required
        );

        this.locationFilterControl = this.fb.control(null);
        this.mediaTypesFilterControl = this.fb.control(null);
        this.recipeTypesFilterControl = this.fb.control(null);

        this.optionalFiltersControl = this.fb.group({
            locationFilter: this.locationFilterControl,
            mediaTypesFilter: this.mediaTypesFilterControl,
            recipeTypesFilter: this.recipeTypesFilterControl
        });

        this.form = this.fb.group({
            datasetSelected: this.datasetSelectedControl
        });

        this.datasetOptions = [{ label: 'Create New', value: 'CreateNew' }];
        this.datasetService.getDatasets({}).subscribe(
            data => {
                this.datasetOptions.push(
                    ...data.results.map(dataset => {
                        return { label: dataset.title, value: dataset };
                    })
                );
            },
            err => {}
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
    }

    onSaveClick() {
        console.log('Save Dataset.');
        if (this.form.valid) {
            const title = this.form.get('title').value || '';
            const description = this.form.get('description').value || '';
            this.savedDataset = this.datasetService
                .createDataset({
                    title: title,
                    description: description
                })
                .subscribe(savedDataset => {
                    const fileIds = this.datasetFileList.map(file => file.id);
                    this.datasetService.addMembers(savedDataset.id, fileIds);
                });
        } else {
            console.log('Please complete required fields before saving.');
        }
    }

    canSave() {
        return this.form.valid &&
            (this.selectedDataset !== 'CreateNew' ||
            (this.selectedDataset === 'CreateNew' && this.datasetFileList.length > 0));
    }

    onLocationFilterChange(event) {
        console.log('Change location filter:', event);
    }

    onGetDataFilesClick() {
        // get list of files
        this.datatableLoading = true;
        if (
            this.form.get('startDate').valid &&
            this.form.get('endDate').valid
        ) {
            this.fileService
                .getFiles({
                    data_started: this.form
                        .get('startDate')
                        .value.toISOString(),
                    data_ended: this.form.get('endDate').value.toISOString()
                    // locaiton: this.form.get('locationFilter').value,
                    // media_type: this.form.get('mediaTypesFilter').value,
                    // recipe_type_id: this.form.get('recipeTypesFilter').value
                })
                .subscribe(data => {
                    this.datasetFileList = data.results;
                    this.datatableLoading = false;

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
                });
        } else {
            const values = this.form.value;
            this.form.patchValue(values);
            this.form.get('startDate').markAsTouched();
            this.form.get('endDate').markAsTouched();
            this.form.get('startDate').markAsDirty();
            this.form.get('endDate').markAsDirty();
            this.form.updateValueAndValidity({emitEvent: true});
        }
    }

    onDatasetSelectChange(event) {
        this.selectedDataset = event.value;
        if (event.value === 'CreateNew') {
            this.form.addControl('title', this.titleControl);
            this.titleControl.enable();
            this.form.addControl('description', this.descriptionControl);
            this.descriptionControl.enable();
            this.form.addControl('startDate', this.startDateControl);
            this.startDateControl.enable();
            this.form.addControl('endDate', this.endDateControl);
            this.endDateControl.enable();
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
            this.optionalFiltersControl.disable();
        }
    }

    onMediaTypeFilterChange(event) {
        console.log('Change media type filter:', event);
    }

    onRecipeTypeFilterChange(event) {
        console.log('Change recipe type filter:', event);
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
