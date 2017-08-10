import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Prime NG
import { DataTableModule } from 'primeng/components/datatable/datatable';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { ChartModule } from 'primeng/components/chart/chart';
import { PaginatorModule } from 'primeng/components/paginator/paginator';
import { InputTextModule } from 'primeng/components/inputtext/inputtext';
import { InputTextareaModule } from 'primeng/components/inputtextarea/inputtextarea';
import { PanelModule } from 'primeng/components/panel/panel';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { JobsComponent } from './status/jobs/component';
import { JobsApiService } from './status/jobs/api.service';
import { JobsDatatableService } from './status/jobs/datatable.service';
import { JobDetailsComponent } from './status/jobs/details.component';
import { LogoComponent } from './logo/logo.component';
import { DashboardComponent } from './dashboard/component';
import { DashboardApiService } from './dashboard/api.service';
import { RecipesComponent } from './status/recipes/component';
import { RecipesApiService } from './status/recipes/api.service';
import { RecipesDatatableService } from './status/recipes/datatable.service';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesApiService } from './configuration/job-types/api.service';
import { JobTypesDatatableService } from './configuration/job-types/datatable.service';
import { JobTypesImportComponent } from './configuration/job-types/import.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { RecipeTypesApiService } from './configuration/recipe-types/api.service';
import { RecipeTypesDatatableService } from './configuration/recipe-types/datatable.service';
import { RecipeDetailsComponent } from './status/recipes/details.component';
import { StatusComponent } from './navbar/status/status.component';
import { HealthbarComponent } from './navbar/status/healthbar/healthbar.component';


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        JobsComponent,
        LogoComponent,
        DashboardComponent,
        SubnavComponent,
        RecipesComponent,
        JobTypesComponent,
        RecipeTypesComponent,
        StatusComponent,
        HealthbarComponent,
        JobDetailsComponent,
        RecipeDetailsComponent,
        JobTypesImportComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        // Prime NG
        ChartModule,
        DataTableModule,
        DropdownModule,
        PaginatorModule,
        InputTextModule,
        InputTextareaModule,
        PanelModule
    ],
    exports: [
        DataTableModule,
        DropdownModule,
        PaginatorModule
    ],
    providers: [
        JobsApiService,
        JobsDatatableService,
        JobTypesApiService,
        JobTypesDatatableService,
        RecipesApiService,
        RecipesDatatableService,
        DashboardApiService,
        RecipeTypesApiService,
        RecipeTypesDatatableService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
