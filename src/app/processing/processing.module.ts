import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DataTableModule, DropdownModule } from 'primeng/primeng';

import { JobsComponent } from './jobs/jobs.component';
import { ProcessingComponent } from './processing.component';
import { JobService } from './jobs/jobs.service';

import { AppRoutingModule } from '../app-routing.module';

@NgModule({
    imports: [
        CommonModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        DataTableModule,
        DropdownModule
    ],
    exports: [
        DataTableModule,
        DropdownModule
    ],
    declarations: [JobsComponent, ProcessingComponent],
    providers: [JobService]
})
export class ProcessingModule { }
