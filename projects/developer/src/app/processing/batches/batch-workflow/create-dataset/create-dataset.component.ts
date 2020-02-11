import { SelectItem } from 'primeng/api';
import { IDatasetDefinition } from '../../../../data/services/dataset';
import { Component, OnInit, Input } from '@angular/core';
import { DatasetsApiService } from '../../../../data/services/dataset.api.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
    selector: 'dev-create-dataset',
    templateUrl: './create-dataset.component.html',
    styleUrls: ['./create-dataset.component.scss']
})
export class CreateDatasetComponent implements OnInit {
    form: FormGroup;
    data: IDatasetDefinition;

    datasetOptions: SelectItem[] = [];
    selectedDataset: any;

    locationOptions: SelectItem[] = [];
    // locationSelected: any;

    mediaTypeOptions: SelectItem[] = [];
    // mediaTypeSelected: any;

    recipeTypeOptions: SelectItem[] = [];
    // recipeTypeSelected: any;

    datasetList: any[] = [];
    datatableLoading: boolean;

    constructor(
        private datasetService: DatasetsApiService,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            datasetSelected: ['', Validators.required]
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

        this.form.get('datasetSelected').valueChanges.subscribe(value => {
            this.selectedDataset = value;
            if (value === 'CreateNew') {
                this.form.addControl('title',  this.fb.control('', Validators.required));
                this.form.addControl('description', this.fb.control(''));
                this.form.addControl('startDate', this.fb.control('', Validators.required));
                this.form.addControl('endDate', this.fb.control('', Validators.required));
                this.form.addControl('optionalFilters', this.fb.group({}));
            }
        });
    }

    onSaveClick() {
        console.log('Save Dataset.');
    }

    onLocationFilterChange(event) {
        console.log('Change location filter:', event);
    }

    onGetDataFilesClick() {
        console.log('Get Data files.');
    }

    onDatasetSelectChange(event) {
        console.log('Dataset selected is: ', event);
    }

    onMediaTypeFilterChange(event) {}

    onRecipeTypeFilterChange(event) {}
}
