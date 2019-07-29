import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
import { BatchesComponent } from './processing/batches/component';
import { BatchDetailsComponent } from './processing/batches/details.component';
import { IngestComponent } from './data/ingest/component';
import { FeedComponent } from './data/feed/component';
import { NodesComponent } from './system/nodes/component';
import { StrikesComponent } from './system/strikes/component';
import { ScansComponent } from './system/scans/component';
import { ScanDetailsComponent } from './system/scans/details.component';
import { WorkspacesComponent } from './system/workspaces/component';
import { PendingChangesGuard } from './pending-changes.guard';

const routes: Routes = [
    { path: '', pathMatch: 'full', component: DashboardComponent },
    { path: 'dashboard', redirectTo: '' },
    { path: 'processing/jobs', component: JobsComponent },
    { path: 'processing/jobs/:id', component: JobDetailsComponent },
    { path: 'processing/running-jobs', component: RunningJobsComponent },
    { path: 'processing/queued-jobs', component: QueuedJobsComponent },
    { path: 'processing/job-type-history', component: JobTypeHistoryComponent },
    { path: 'processing/job-type-history/:name', component: JobTypeHistoryDetailsComponent },
    { path: 'processing/batches', component: BatchesComponent },
    { path: 'processing/batches/:id', component: BatchDetailsComponent },
    { path: 'processing/batches/create', component: BatchDetailsComponent },
    { path: 'configuration/job-types', component: JobTypesComponent },
    { path: 'configuration/job-types/:name/:version', component: JobTypesComponent },
    { path: 'configuration/job-types/edit/:name/:version', component: JobTypesCreateComponent },
    { path: 'configuration/job-types/create', component: JobTypesCreateComponent, canDeactivate: [PendingChangesGuard] },
    { path: 'processing/recipes', component: RecipesComponent },
    { path: 'processing/recipes/:id', component: RecipeDetailsComponent },
    { path: 'configuration/recipe-types', component: RecipeTypesComponent },
    { path: 'configuration/recipe-types/:name', component: RecipeTypesComponent, canDeactivate: [PendingChangesGuard] },
    { path: 'data/feed', component: FeedComponent },
    { path: 'data/ingest', component: IngestComponent },
    { path: 'data/metrics', component: MetricsComponent },
    { path: 'data/timeline', component: TimelineComponent },
    { path: 'system/nodes', component: NodesComponent },
    { path: 'system/strikes', component: StrikesComponent },
    { path: 'system/strikes/:id', component: StrikesComponent },
    { path: 'system/scans', component: ScansComponent },
    { path: 'system/scans/:id', component: ScanDetailsComponent },
    { path: 'system/workspaces', component: WorkspacesComponent },
    { path: 'system/workspaces/:id', component: WorkspacesComponent, canDeactivate: [PendingChangesGuard] }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
