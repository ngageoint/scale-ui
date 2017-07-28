import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { DataTableModule, DropdownModule } from 'primeng/primeng';
import { StoreModule } from '@ngrx/store';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { SubnavComponent } from './navbar/subnav/subnav.component';
import { ProcessingComponent } from './processing/processing.component';
import { JobsComponent } from './processing/jobs/jobs.component';
import { JobService } from './processing/jobs/jobs.service';
import { jobsDatatableReducer } from './processing/jobs/jobs-datatable.reducer';
import { LogoComponent } from './logo/logo.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RecipesComponent } from './processing/recipes/recipes.component';
import { RecipeService } from './processing/recipes/recipes.service';
import { recipesDatatableReducer } from './processing/recipes/recipes-datatable.reducer';


@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        ProcessingComponent,
        JobsComponent,
        LogoComponent,
        DashboardComponent,
        SubnavComponent,
        RecipesComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule,
        HttpModule,
        DataTableModule,
        DropdownModule,
        StoreModule.forRoot(
            {
                jobsDatatableOptions: jobsDatatableReducer,
                recipesDatatableOptions: recipesDatatableReducer
            }
        )
    ],
    exports: [
        DataTableModule,
        DropdownModule
    ],
    providers: [
        JobService,
        RecipeService
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
