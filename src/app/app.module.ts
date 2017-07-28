import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { DataTableModule, DropdownModule } from 'primeng/primeng';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { ProcessingComponent } from './processing/processing.component';
import { JobsComponent } from './processing/jobs/jobs.component';
import { JobService } from './processing/jobs/jobs.service';
import { jobsDatatableReducer } from './processing/jobs/jobs-datatable.reducer';
import { LogoComponent } from './logo/logo.component';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        ProcessingComponent,
        JobsComponent,
        LogoComponent,
        DashboardComponent,
        SubnavComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpModule,
        DataTableModule,
        DropdownModule,
        StoreModule.forRoot({ jobsDatatableOptions: jobsDatatableReducer })
    ],
    exports: [
        DataTableModule,
        DropdownModule
    ],
    providers: [
        JobService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
