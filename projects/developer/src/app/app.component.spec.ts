import { TestBed, async } from '@angular/core/testing';

import { ThemeService } from './theme';
import { ACTIVE_THEME, THEMES } from './theme/symbols';
import { ProfileService } from './common/services/profile.service';
import { DataService } from './common/services/data.service';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';


describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
                AppModule
            ],
            providers: [ThemeService, ProfileService, DataService, {
                provide: THEMES,
                useValue: THEMES
            }, {
                provide: ACTIVE_THEME,
                useValue: ACTIVE_THEME
            }]
        }).compileComponents();
    }));

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    });

});
