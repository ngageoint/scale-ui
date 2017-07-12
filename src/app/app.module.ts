import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { ProcessingComponent } from './screens/processing/processing.component';

import { AppRoutingModule } from './app-routing.module';
import { LogoComponent } from './logo/logo.component';


@NgModule({
    declarations: [
        AppComponent,
        SidebarComponent,
        DashboardComponent,
        ProcessingComponent,
        LogoComponent
    ],
    imports: [
        AppRoutingModule,
        BrowserModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
