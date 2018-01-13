// Angular Modules
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { NgModule } from '@angular/core';
import { CodemirrorModule } from 'ng2-codemirror';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { UtcDatepickerModule } from 'angular-utc-datepicker';

// Prime NG
import {
    AccordionModule, AutoCompleteModule, ButtonModule, CalendarModule, ChartModule, CheckboxModule, ChipsModule, DataListModule,
    DataTableModule, DialogModule, DropdownModule, InputSwitchModule, InputTextModule, InputTextareaModule, ListboxModule, MessagesModule,
    MultiSelectModule, PaginatorModule, PanelModule, SidebarModule, SpinnerModule, StepsModule, ToggleButtonModule, TooltipModule,
    TreeTableModule
} from 'primeng/primeng';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ColorService } from './color.service';
import { NavbarComponent } from './navbar/navbar.component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { JobsComponent } from './processing/jobs/component';
import { JobsApiService } from './processing/jobs/api.service';
import { JobsDatatableService } from './processing/jobs/datatable.service';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { LogoComponent } from './logo/logo.component';
import { DashboardComponent } from './dashboard/component';
import { DashboardFavoritesService } from './dashboard/favorites.service';
import { RecipesComponent } from './processing/recipes/component';
import { RecipesApiService } from './processing/recipes/api.service';
import { RecipesDatatableService } from './processing/recipes/datatable.service';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesApiService } from './configuration/job-types/api.service';
import { JobTypesImportComponent } from './configuration/job-types/import.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { RecipeTypesApiService } from './configuration/recipe-types/api.service';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { StatusComponent } from './navbar/status/status.component';
import { HealthbarComponent } from './navbar/status/healthbar/healthbar.component';
import { FooterComponent } from './footer/footer.component';
import { JobtypeitemComponent } from './dashboard/jobtypeitem/jobtypeitem.component';
import { WorkspacesComponent } from './configuration/workspaces/component';
import { WorkspacesApiService } from './configuration/workspaces/api.service';
import { HistorychartComponent } from './dashboard/historychart/historychart.component';
import { SourcesComponent } from './data/sources/component';
import { SourcesApiService } from './data/sources/api.service';
import { SourcesDatatableService } from './data/sources/datatable.service';
import { SourceDetailsComponent } from './data/sources/details.component';
import { DataService } from './data.service';
import { ProcessingFormComponent } from './navbar/subnav/processing-form/component';
import { FailureRatesComponent } from './processing/failure-rates/component';
import { FailureRatesDatatableService } from './processing/failure-rates/datatable.service';
import { MetricsComponent } from './data/metrics/component';
import { MetricsApiService } from './data/metrics/api.service';
import { RunningJobsComponent } from './processing/running-jobs/component';
import { RunningJobsDatatableService } from './processing/running-jobs/datatable.service';
import { RunningJobsApiService } from './processing/running-jobs/api.service';
import { LogViewerComponent } from './common/log-viewer/component';
import { LogViewerApiService } from './common/log-viewer/api.service';
import { RecipeGraphComponent } from './common/recipe-graph/component';
import { ErrorDialsComponent } from './common/error-dials/component';


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
        JobTypesImportComponent,
        FooterComponent,
        JobtypeitemComponent,
        WorkspacesComponent,
        HistorychartComponent,
        SourcesComponent,
        SourceDetailsComponent,
        ProcessingFormComponent,
        FailureRatesComponent,
        MetricsComponent,
        RunningJobsComponent,
        LogViewerComponent,
        RecipeGraphComponent,
        ErrorDialsComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        CodemirrorModule,
        NgxGraphModule,
        UtcDatepickerModule,
        // Prime NG
        AutoCompleteModule,
        CalendarModule,
        ChartModule,
        DataListModule,
        DataTableModule,
        DialogModule,
        DropdownModule,
        PaginatorModule,
        InputTextModule,
        InputTextareaModule,
        PanelModule,
        ButtonModule,
        SpinnerModule,
        ListboxModule,
        InputSwitchModule,
        StepsModule,
        MessagesModule,
        CheckboxModule,
        ChipsModule,
        AccordionModule,
        TooltipModule,
        MultiSelectModule,
        TreeTableModule,
        SidebarModule,
        ToggleButtonModule
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
        RecipesApiService,
        RecipesDatatableService,
        ColorService,
        DashboardFavoritesService,
        RecipeTypesApiService,
        WorkspacesApiService,
        SourcesApiService,
        SourcesDatatableService,
        DataService,
        FailureRatesDatatableService,
        MetricsApiService,
        RunningJobsApiService,
        RunningJobsDatatableService,
        LogViewerApiService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
