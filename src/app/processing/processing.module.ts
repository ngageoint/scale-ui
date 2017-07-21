import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JobsComponent } from './jobs/jobs.component';
import { ProcessingComponent } from './processing.component';
import { JobService } from './jobs/jobs.service';

import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  imports: [
    CommonModule,
    AppRoutingModule
  ],
  declarations: [JobsComponent, ProcessingComponent],
  providers: [JobService]
})
export class ProcessingModule { }
