import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataTableModule, DropdownModule } from 'primeng/primeng';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from '../app-routing.module';
import { ProcessingComponent } from './processing.component';
import { JobsComponent } from './jobs/jobs.component';
import { JobService } from './jobs/jobs.service';
import { jobsDatatableReducer } from './jobs/jobs-datatable.reducer';

@NgModule({
    imports: [
        CommonModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        DataTableModule,
        DropdownModule,
        StoreModule.forRoot({ jobsDatatableOptions: jobsDatatableReducer })
    ],
    exports: [
        DataTableModule,
        DropdownModule
    ],
    declarations: [JobsComponent, ProcessingComponent],
    providers: [JobService]
})
export class ProcessingModule { }
