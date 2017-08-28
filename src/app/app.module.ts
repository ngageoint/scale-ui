import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Prime NG
import { AutoCompleteModule } from 'primeng/components/autocomplete/autocomplete';
import { DataTableModule } from 'primeng/components/datatable/datatable';
import { DropdownModule } from 'primeng/components/dropdown/dropdown';
import { CalendarModule } from 'primeng/components/calendar/calendar';
import { ChartModule } from 'primeng/components/chart/chart';
import { PaginatorModule } from 'primeng/components/paginator/paginator';
import { InputTextModule } from 'primeng/components/inputtext/inputtext';
import { InputTextareaModule } from 'primeng/components/inputtextarea/inputtextarea';
import { PanelModule } from 'primeng/components/panel/panel';
import { ButtonModule } from 'primeng/components/button/button';
import { SpinnerModule } from 'primeng/components/spinner/spinner';
import { ListboxModule } from 'primeng/components/listbox/listbox';
import { InputSwitchModule } from 'primeng/components/inputswitch/inputswitch';
import { StepsModule } from 'primeng/components/steps/steps';
import { MessagesModule } from 'primeng/components/messages/messages';
import { CheckboxModule } from 'primeng/components/checkbox/checkbox';
import { ChipsModule } from 'primeng/components/chips/chips';
import { AccordionModule } from 'primeng/components/accordion/accordion';
import { TooltipModule } from 'primeng/components/tooltip/tooltip';

import { CodemirrorModule } from 'ng2-codemirror';
import { NgxChartsDagModule } from '@swimlane/ngx-charts-dag';

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
import { DashboardApiService } from './dashboard/api.service';
import { DashboardFavoritesService } from './dashboard/favorites.service';
import { RecipesComponent } from './processing/recipes/component';
import { RecipesApiService } from './processing/recipes/api.service';
import { RecipesDatatableService } from './processing/recipes/datatable.service';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesApiService } from './configuration/job-types/api.service';
import { JobTypesDatatableService } from './configuration/job-types/datatable.service';
import { JobTypesImportComponent } from './configuration/job-types/import.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { RecipeTypesApiService } from './configuration/recipe-types/api.service';
import { RecipeTypesDatatableService } from './configuration/recipe-types/datatable.service';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { StatusComponent } from './navbar/status/status.component';
import { HealthbarComponent } from './navbar/status/healthbar/healthbar.component';
import { FooterComponent } from './footer/footer.component';
import { JobtypeitemComponent } from './dashboard/jobtypeitem/jobtypeitem.component';
import { WorkspacesComponent } from './configuration/workspaces/component';
import { WorkspacesApiService } from './configuration/workspaces/api.service';
import { ErrordialsComponent } from './dashboard/errordials/errordials.component';
import { HistorychartComponent } from './dashboard/historychart/historychart.component';
import { SourceFilesComponent } from './data/source-files/component';
import { SourceFilesApiService } from './data/source-files/api.service';
import { SourceFilesDatatableService } from './data/source-files/datatable.service';


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
        ErrordialsComponent,
        HistorychartComponent,
        SourceFilesComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        CodemirrorModule,
        NgxChartsDagModule,
        // Prime NG
        AutoCompleteModule,
        CalendarModule,
        ChartModule,
        DataTableModule,
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
        TooltipModule
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
        ColorService,
        DashboardApiService,
        DashboardFavoritesService,
        RecipeTypesApiService,
        RecipeTypesDatatableService,
        WorkspacesApiService,
        SourceFilesApiService,
        SourceFilesDatatableService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
