// Angular Modules
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientXsrfModule } from '@angular/common/http';

// vendor
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { SeedImagesModule } from 'seed-images';
import { UtcDatepickerModule } from 'angular-utc-datepicker';

// Prime NG
import {
    AutoCompleteModule, ButtonModule, CalendarModule, ChartModule, CheckboxModule, ChipsModule, ColorPickerModule, ConfirmationService,
    DataListModule, DialogModule, DropdownModule, InputSwitchModule, InputTextModule, InputTextareaModule, ListboxModule, MenubarModule,
    MessagesModule, MultiSelectModule, OverlayPanelModule, PaginatorModule, PanelModule, ScrollPanelModule, SidebarModule, SliderModule,
    SpinnerModule, StepsModule, TabViewModule, ToggleButtonModule, TooltipModule, TreeTableModule, SlideMenuModule
} from 'primeng/primeng';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataViewModule } from 'primeng/dataview';
import { MenuModule } from 'primeng/menu';
import { PendingChangesGuard } from './pending-changes.guard';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

// app
import { AppComponent } from './app.component';
import { AppConfigService } from './common/services/app-config.service';
import { AppRoutingModule } from './app-routing.module';
import { BatchDetailsComponent } from './processing/batches/details.component';
import { BatchesComponent } from './processing/batches/component';
import { CandyBarComponent } from './common/components/candy-bar/component';
import { DashboardComponent } from './dashboard/component';
import { DataFeedComponent } from './dashboard/data-feed/component';
import { FeedComponent } from './data/feed/component';
import { FooterComponent } from './footer/footer.component';
import { HealthbarComponent } from './navbar/status/healthbar/healthbar.component';
import { IngestComponent } from './data/ingest/component';
import { LoadingIndicatorComponent } from './common/components/loading-indicator/component';
import { JobActivityComponent } from './dashboard/job-activity/component';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { JobHistoryComponent } from './dashboard/job-history/component';
import { JobsComponent } from './processing/jobs/component';
import { JobTypeHistoryComponent } from './processing/job-type-history/component';
import { JobTypeHistoryDetailsComponent } from './processing/job-type-history/details.component';
import { JobTypeItemComponent } from './dashboard/job-type-item/component';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesCreateComponent } from './configuration/job-types/create.component';
import { LogoComponent } from './logo/logo.component';
import { LogViewerComponent } from './common/components/log-viewer/component';
import { MetricsComponent } from './data/metrics/component';
import { NavbarComponent } from './navbar/navbar.component';
import { NodesComponent } from './system/nodes/component';
import { ProcessingFormComponent } from './navbar/subnav/processing-form/component';
import { QueuedJobsComponent } from './processing/queued-jobs/component';
import { QueueLoadComponent } from './common/components/queue-load/component';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { RecipeGraphComponent } from './common/components/recipe-graph/component';
import { RecipesComponent } from './processing/recipes/component';
import { RecipeTypeFileComponent } from './configuration/recipe-types/file.component';
import { RecipeTypeFilterComponent } from './configuration/recipe-types/filter.component';
import { RecipeTypeJsonComponent } from './configuration/recipe-types/json.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { RunningJobsComponent } from './processing/running-jobs/component';
import { ScanDetailsComponent } from './system/scans/details.component';
import { ScansComponent } from './system/scans/component';
import { StatusComponent } from './navbar/status/component';
import { StrikesComponent } from './system/strikes/component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { SystemStatusComponent } from './system/status/component';
import { ThemeModule, lightTheme, darkTheme } from './theme';
import { TimelineComponent } from './data/timeline/component';
import { WorkspacesComponent } from './system/workspaces/component';

const appInitializer = (appConfig: AppConfigService) => {
    return () => {
        return appConfig.loadAppConfig('./assets/appConfig.json')
            .catch(err => {
                console.log(err);
            });
    };
};

@NgModule({
    declarations: [
        AppComponent,
        BatchDetailsComponent,
        BatchesComponent,
        CandyBarComponent,
        DashboardComponent,
        DataFeedComponent,
        FeedComponent,
        FooterComponent,
        HealthbarComponent,
        IngestComponent,
        JobActivityComponent,
        JobDetailsComponent,
        JobHistoryComponent,
        JobsComponent,
        JobTypeHistoryComponent,
        JobTypeHistoryDetailsComponent,
        JobTypeItemComponent,
        JobTypesComponent,
        JobTypesCreateComponent,
        LoadingIndicatorComponent,
        LogoComponent,
        LogViewerComponent,
        MetricsComponent,
        NavbarComponent,
        NodesComponent,
        ProcessingFormComponent,
        QueuedJobsComponent,
        QueueLoadComponent,
        RecipeDetailsComponent,
        RecipeGraphComponent,
        RecipesComponent,
        RecipeTypeFileComponent,
        RecipeTypeFilterComponent,
        RecipeTypeJsonComponent,
        RecipeTypesComponent,
        RunningJobsComponent,
        ScanDetailsComponent,
        ScansComponent,
        StatusComponent,
        StrikesComponent,
        SubnavComponent,
        SystemStatusComponent,
        TimelineComponent,
        WorkspacesComponent
    ],
    imports: [
        AccordionModule,
        AppRoutingModule,
        AutoCompleteModule,
        BrowserAnimationsModule,
        BrowserModule,
        ButtonModule,
        CalendarModule,
        CardModule,
        ChartModule,
        CheckboxModule,
        ChipsModule,
        CodemirrorModule,
        ColorPickerModule,
        ConfirmDialogModule,
        DataListModule,
        DataViewModule,
        DialogModule,
        DropdownModule,
        HttpClientModule,
        HttpClientXsrfModule.withOptions({
            cookieName: 'csrftoken',
            headerName: 'X-CSRFToken'
        }),
        InputSwitchModule,
        InputTextareaModule,
        InputTextModule,
        FormsModule,
        ListboxModule,
        MenubarModule,
        MenuModule,
        MessagesModule,
        MultiSelectModule,
        NgxGraphModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        ReactiveFormsModule,
        ScrollPanelModule,
        SeedImagesModule,
        SidebarModule,
        SlideMenuModule,
        SliderModule,
        SpinnerModule,
        StepsModule,
        TableModule,
        TabViewModule,
        ThemeModule.forRoot({
            themes: [lightTheme, darkTheme],
            active: localStorage.getItem('scale.theme') || 'light'
        }),
        ToastModule,
        ToggleButtonModule,
        TooltipModule,
        TreeTableModule,
        UtcDatepickerModule
    ],
    exports: [
        DropdownModule,
        PaginatorModule
    ],
    providers: [
        ConfirmationService,
        PendingChangesGuard,
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializer,
            multi: true,
            deps: [AppConfigService]
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
