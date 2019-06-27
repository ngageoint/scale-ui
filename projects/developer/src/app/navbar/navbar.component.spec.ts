import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/components/common/messageservice';

import { DataService } from '../common/services/data.service';
import { ThemeService } from '../theme';
import { StatusService } from '../common/services/status.service';
import { SchedulerApiService } from '../common/services/scheduler/api.service';
import { THEMES, ACTIVE_THEME } from '../theme/symbols';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
    let component: NavbarComponent;
    let fixture: ComponentFixture<NavbarComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [MessageService, DataService, ThemeService, StatusService, SchedulerApiService, {
                provide: THEMES,
                useValue: THEMES
            }, {
                provide: ACTIVE_THEME,
                useValue: ACTIVE_THEME
            }],
            declarations: [ NavbarComponent ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
