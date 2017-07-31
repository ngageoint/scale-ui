import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { DataTableModule, DropdownModule, DataListModule } from 'primeng/primeng';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { ProcessingComponent } from './processing/processing.component';
import { JobsComponent } from './processing/jobs/jobs.component';
import { JobService } from './processing/jobs/job.service';
import { LogoComponent } from './logo/logo.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RecipesComponent } from './processing/recipes/recipes.component';
import { RecipeService } from './processing/recipes/recipes.service';
import { DatatableService } from './services/datatable.service';
import { JobTypesComponent } from './processing/job-types/job-types.component';
import { JobTypeService } from './processing/job-types/job-type.service';


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        ProcessingComponent,
        JobsComponent,
        LogoComponent,
        DashboardComponent,
        SubnavComponent,
        RecipesComponent,
        JobTypesComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpModule,
        DataTableModule,
        DropdownModule,
        DataListModule
    ],
    exports: [
        DataTableModule,
        DropdownModule,
        DataListModule
    ],
    providers: [
        JobService,
        JobTypeService,
        RecipeService,
        DatatableService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
