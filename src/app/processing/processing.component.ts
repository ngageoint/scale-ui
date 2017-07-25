import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { JobsDatatableOptions } from './jobs/jobs-datatable-options.model';
import { Observable } from 'rxjs/Observable';

interface DatatableState {
    jobsDatatableOptions: JobsDatatableOptions
}

@Component({
  selector: 'app-processing',
  templateUrl: './processing.component.html',
  styleUrls: ['./processing.component.scss']
})
export class ProcessingComponent implements OnInit {
    datatableOptionsState: Observable<JobsDatatableOptions>;
    datatableOptions: JobsDatatableOptions;
    constructor(
        private store: Store<DatatableState>
    ) {
        this.datatableOptionsState = store.select<JobsDatatableOptions>(s => s.jobsDatatableOptions);
    }
    ngOnInit() {
        this.datatableOptionsState.subscribe((state) => {
            this.datatableOptions = state;
        });
    }
}
