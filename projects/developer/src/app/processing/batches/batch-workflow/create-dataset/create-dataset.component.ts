import { SelectItem } from 'primeng/primeng';
import { IDatasetDefinition } from '../../../../data/services/dataset';
import { Component, OnInit } from '@angular/core';
import { DatasetsApiService } from '../../../../data/services/dataset.api.service';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'dev-create-dataset',
  templateUrl: './create-dataset.component.html',
  styleUrls: ['./create-dataset.component.scss'],
})
export class CreateDatasetComponent implements OnInit {
    form: FormGroup;
    useExistingDataSet = false;
    data: IDatasetDefinition;
    countryOptions: SelectItem[] = [];

    constructor(
        private datasetService: DatasetsApiService,
        private fb: FormBuilder
    ) { }

    ngOnInit() {
        this.form = this.fb.group({
            title: [''],
            description: [''],
            startDate: [''],
            endDate: ['']
        });
        this.countryOptions = [
            { label: '1', value: '1'},
            { label: '2', value: '2'},
            { label: '3', value: '3'},
            { label: '4', value: '4'},
            { label: '5', value: '5'},
            { label: '6', value: '6'}
        ];
    }

    onSaveClick(data) {
        data = {
            'title': this.form.get('title').value,
            'startDate': this.form.get('startDate').value,
            'endDate': this.form.get('endDate').value,
            'global_data': ['asd', ['asdas']],
            'global_parameters': ['asd', ['asdas']]
        };
        this.datasetService.createDataset(data);
        console.log('Save Dataset.', data);
    }

    onCountryFilterChange(event) {
        console.log('Change country filter:', event);
    }

    onGetDataFilesClick(data) {
        data = {
            'title': this.form.get('title').value,
            'startDate': this.form.get('startDate').value,
            'endDate': this.form.get('endDate').value,
            'global_data': ['asd', ['asdas']],
            'global_parameters': ['asd', ['asdas']],
            'dry_run': true
        };
        // debugger;
        this.datasetService.createDataset(data);
        console.log('Save Dataset.', data);
    }
}
