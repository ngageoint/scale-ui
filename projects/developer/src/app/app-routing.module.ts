import { CreateBatchComponent } from './processing/batches/batch-workflow/create-batch/create-batch.component';
import { CreateDatasetComponent } from './processing/batches/batch-workflow/create-dataset/create-dataset.component';
import { SelectRecipeTypeComponent } from './processing/batches/batch-workflow/select-recipe-type/select-recipe-type.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, ChildrenOutletContexts } from '@angular/router';

import { DashboardComponent } from './dashboard/component';
import { JobsComponent } from './processing/jobs/component';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { RecipesComponent } from './processing/recipes/component';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesCreateComponent } from './configuration/job-types/create.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { JobTypeHistoryComponent } from './processing/job-type-history/component';
import { JobTypeHistoryDetailsComponent } from './processing/job-type-history/details.component';
import { MetricsComponent } from './data/metrics/component';
import { TimelineComponent } from './data/timeline/component';
import { RunningJobsComponent } from './processing/running-jobs/component';
import { QueuedJobsComponent } from './processing/queued-jobs/component';
import { BatchesComponent } from './processing/batches/batches-component';
import { BatchDetailsComponent } from './processing/batches/details.component';
import { BatchWorkflowComponent } from './processing/batches/batch-workflow/batch-workflow.component';
import { IngestComponent } from './data/ingest/component';
import { FeedComponent } from './data/feed/component';
import { NodesComponent } from './system/nodes/component';
import { StrikesComponent } from './system/strikes/component';
import { ScansComponent } from './system/scans/component';
import { ScanDetailsComponent } from './system/scans/details.component';
import { SystemStatusComponent } from './system/status/component';
import { WorkspacesComponent } from './system/workspaces/component';
import { PendingChangesGuard } from './pending-changes.guard';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: DashboardComponent,
        data: {title: 'Dashboard | Scale'}
    },
    {
        path: 'dashboard',
        redirectTo: ''
    },
    {
        path: 'processing/jobs',
        component: JobsComponent,
        data: {title: 'Jobs | Scale'}
    },
    {
        path: 'processing/jobs/:id',
        component: JobDetailsComponent,
        data: {title: 'Job Details | Scale'}
    },
    {
        path: 'processing/running-jobs',
        component: RunningJobsComponent,
        data: {title: 'Running Jobs | Scale'}
    },
    {
        path: 'processing/queued-jobs',
        component: QueuedJobsComponent,
        data: {title: 'Queued Jobs | Scale'}
    },
    {
        path: 'processing/job-type-history',
        component: JobTypeHistoryComponent,
        data: {title: 'Job Type History | Scale'}
    },
    {
        path: 'processing/job-type-history/:name',
        component: JobTypeHistoryDetailsComponent,
        data: {title: 'Job Type History Details | Scale'}
    },
    {
        path: 'processing/batches',
        component: BatchesComponent,
        data: {title: 'Batches | Scale'}
    },
    {
        path: 'processing/batches/create',
        component: BatchWorkflowComponent,
        data: {title: 'Create Batch | Scale'}
    },
    {
        path: 'processing/batches/:id',
        component: BatchDetailsComponent,
        canDeactivate: [PendingChangesGuard],
        data: {title: 'Batch Details | Scale'}
    },
    {
        path: 'configuration/job-types',
        component: JobTypesComponent,
        data: {title: 'Job Types | Scale'}
    },
    {
        path: 'configuration/job-types/:name/:version',
        component: JobTypesComponent,
        data: {title: 'Job Type Details | Scale'}
    },
    {
        path: 'configuration/job-types/edit/:name/:version',
        component: JobTypesCreateComponent,
        data: {title: 'Edit Job Types | Scale'}
    },
    {
        path: 'configuration/job-types/create',
        component: JobTypesCreateComponent,
        canDeactivate: [PendingChangesGuard],
        data: {title: 'Create Job Types | Scale'}
    },
    {
        path: 'processing/recipes',
        component: RecipesComponent,
        data: {title: 'Recipes | Scale'}
    },
    {
        path: 'processing/recipes/:id',
        component: RecipeDetailsComponent,
        data: {title: 'Recipe Details | Scale'}
    },
    {
        path: 'configuration/recipe-types',
        component: RecipeTypesComponent,
        data: {title: 'Recipe Types | Scale'}
    },
    {
        path: 'configuration/recipe-types/:name',
        component: RecipeTypesComponent,
        canDeactivate: [PendingChangesGuard],
        data: {title: 'Recipe Type Details | Scale'}
    },
    {
        path: 'data/feed',
        component: FeedComponent,
        data: {title: 'Data Feed | Scale'}
    },
    {
        path: 'data/ingest',
        component: IngestComponent,
        data: {title: 'Ingest Records | Scale'}
    },
    {
        path: 'data/metrics',
        component: MetricsComponent,
        data: {title: 'Metrics | Scale'}
    },
    {
        path: 'data/timeline',
        component: TimelineComponent,
        data: {title: 'Timeline | Scale'}
    },
    {
        path: 'system/nodes',
        component: NodesComponent,
        data: {title: 'Nodes | Scale'}
    },
    {
        path: 'system/strikes',
        component: StrikesComponent,
        data: {title: 'Strikes | Scale'}
    },
    {
        path: 'system/strikes/:id',
        component: StrikesComponent,
        canDeactivate: [PendingChangesGuard],
        data: {title: 'Strike Details | Scale'}
    },
    {
        path: 'system/scans',
        component: ScansComponent,
        data: {title: 'Scans | Scale'}
    },
    {
        path: 'system/scans/:id',
        component: ScanDetailsComponent,
        canDeactivate: [PendingChangesGuard],
        data: {title: 'Scan Details | Scale'}
    },
    {
        path: 'system/status',
        component: SystemStatusComponent,
        data: {title: 'System Status | Scale'}
    },
    {
        path: 'system/workspaces',
        component: WorkspacesComponent,
        data: {title: 'Workspaces | Scale'}
    },
    {
        path: 'system/workspaces/:id',
        component: WorkspacesComponent,
        canDeactivate: [PendingChangesGuard],
        data: {title: 'Workspace Details | Scale'}
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
