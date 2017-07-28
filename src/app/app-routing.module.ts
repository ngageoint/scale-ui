import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { ProcessingComponent } from './processing/processing.component';
import { JobsComponent } from './processing/jobs/jobs.component';
import { RecipesComponent } from './processing/recipes/recipes.component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'processing', component: ProcessingComponent },
    { path: 'processing/jobs', component: JobsComponent },
    { path: 'processing/recipes', component: RecipesComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
