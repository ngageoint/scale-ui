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
import { SeedImagesModule } from '@ngageoint/seed-images';

// Prime NG
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DataListModule } from 'primeng/datalist';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PaginatorModule } from 'primeng/paginator';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SliderModule } from 'primeng/slider';
import { SpinnerModule } from 'primeng/spinner';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { TooltipModule } from 'primeng/tooltip';
import { TreeTableModule } from 'primeng/treetable';
import { SlideMenuModule } from 'primeng/slidemenu';

import { ConfirmationService } from 'primeng/api';

// app
import { AppComponent } from './app.component';
import { AppConfigService } from './common/services/app-config.service';
import { AuthGuard } from './auth.guard';
import { ColorService } from './common/services/color.service';
import { AppRoutingModule } from './app-routing.module';
import { BatchDetailsComponent } from './processing/batches/details.component';
import { BatchesComponent } from './processing/batches/batches-component';
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
import { JobLatencyComponent } from './data/latency/component';
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
import { PendingChangesGuard } from './pending-changes.guard';
import { ProcessingStatusComponent } from './processing/status/component';
import { ProcessingStatusPhaseComponent } from './processing/status/phase/component';
import { ProcessingStatusProductsComponent } from './processing/status/products/component';
import { ProcessingStatusRecipeComponent } from './processing/status/recipe/component';
import { QueuedJobsComponent } from './processing/queued-jobs/component';
import { QueueLoadComponent } from './common/components/queue-load/component';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { RecipeGraphComponent } from './common/components/recipe-graph/component';
import { RecipesComponent } from './processing/recipes/component';
import { RecipeTypeConditionComponent } from './configuration/recipe-types/condition.component';
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
import { LiveRangeSelectorComponent } from './common/components/live-range-selector/component';
import { TemporalFilterComponent } from './common/components/temporal-filter/component';
import { ThemeModule, lightTheme, darkTheme } from './theme';
import { TimelineComponent } from './data/timeline/component';
import { WorkspacesComponent } from './system/workspaces/component';
import { BatchWorkflowComponent } from './processing/batches/batch-workflow/batch-workflow.component';
import { CreateDatasetComponent } from './processing/batches/batch-workflow/create-dataset/create-dataset.component';
import { CreateBatchComponent } from './processing/batches/batch-workflow/create-batch/create-batch.component';
import { RunBatchComponent } from './processing/batches/batch-workflow/run-batch/run-batch.component';
import { TruncatePipe } from './common/pipes/truncate.pipe';
import { Globals } from './globals';

// import after primeng component to ensure timeline plugin attached to correct chart.js instance
import 'chartjs-chart-timeline/src/timeline';
import 'chartjs-plugin-datalabels';

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
        JobLatencyComponent,
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
        ProcessingStatusComponent,
        ProcessingStatusPhaseComponent,
        ProcessingStatusProductsComponent,
        ProcessingStatusRecipeComponent,
        QueuedJobsComponent,
        QueueLoadComponent,
        RecipeDetailsComponent,
        RecipeGraphComponent,
        RecipesComponent,
        RecipeTypeConditionComponent,
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
        WorkspacesComponent,
        LiveRangeSelectorComponent,
        TemporalFilterComponent,
        BatchWorkflowComponent,
        CreateDatasetComponent,
        CreateBatchComponent,
        RunBatchComponent,
        TruncatePipe
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
        FieldsetModule,
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
        MessageModule,
        MessagesModule,
        MultiSelectModule,
        NgxGraphModule,
        OverlayPanelModule,
        PaginatorModule,
        PanelModule,
        ProgressBarModule,
        ProgressSpinnerModule,
        RadioButtonModule,
        ReactiveFormsModule,
        ScrollPanelModule,
        SeedImagesModule,
        SelectButtonModule,
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
    ],
    exports: [
        DropdownModule,
        PaginatorModule
    ],
    providers: [
        AuthGuard,
        ColorService,
        ConfirmationService,
        Globals,
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
