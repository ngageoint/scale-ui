import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/component';
import { JobsComponent } from './processing/jobs/component';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { RecipesComponent } from './processing/recipes/component';
import { JobTypesComponent } from './processing/job-types/component';
import { RecipeTypesComponent } from './processing/recipe-types/component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'processing/jobs', component: JobsComponent },
    { path: 'processing/jobs/:id', component: JobDetailsComponent },
    { path: 'processing/job-types', component: JobTypesComponent },
    { path: 'processing/recipes', component: RecipesComponent },
    { path: 'processing/recipe-types', component: RecipeTypesComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
