import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/component';
import { JobsComponent } from './processing/jobs/component';
import { JobDetailsComponent } from './processing/jobs/details.component';
import { RecipesComponent } from './processing/recipes/component';
import { RecipeDetailsComponent } from './processing/recipes/details.component';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesImportComponent } from './configuration/job-types/import.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';
import { SourceFilesComponent } from './data/source-files/component';
import { SourceFileDetailsComponent } from './data/source-files/details.component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'processing/jobs', component: JobsComponent },
    { path: 'processing/jobs/:id', component: JobDetailsComponent },
    { path: 'configuration/job-types', component: JobTypesComponent },
    { path: 'configuration/job-types/import', component: JobTypesImportComponent },
    { path: 'processing/recipes', component: RecipesComponent },
    { path: 'processing/recipes/:id', component: RecipeDetailsComponent },
    { path: 'configuration/recipe-types', component: RecipeTypesComponent },
    { path: 'data/source-files', component: SourceFilesComponent },
    { path: 'data/source-files/:id', component: SourceFileDetailsComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
