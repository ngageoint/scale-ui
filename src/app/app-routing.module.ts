import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/component';
import { JobsComponent } from './status/jobs/component';
import { JobDetailsComponent } from './status/jobs/details.component';
import { RecipesComponent } from './status/recipes/component';
import { RecipeDetailsComponent } from './status/recipes/details.component';
import { JobTypesComponent } from './configuration/job-types/component';
import { JobTypesImportComponent } from './configuration/job-types/import.component';
import { RecipeTypesComponent } from './configuration/recipe-types/component';

const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'status/jobs', component: JobsComponent },
    { path: 'status/jobs/:id', component: JobDetailsComponent },
    { path: 'configuration/job-types', component: JobTypesComponent },
    { path: 'configuration/job-types/import', component: JobTypesImportComponent },
    { path: 'status/recipes', component: RecipesComponent },
    { path: 'status/recipes/:id', component: RecipeDetailsComponent },
    { path: 'configuration/recipe-types', component: RecipeTypesComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})
export class AppRoutingModule {}
