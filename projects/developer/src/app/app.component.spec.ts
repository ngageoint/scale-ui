import { TestBed, async } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';

import { ThemeService } from './theme';
import { ACTIVE_THEME, THEMES } from './theme/symbols';
import { ProfileService } from './common/services/profile.service';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';


describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
                AppModule
            ],
            providers: [ThemeService, ProfileService, {
                provide: APP_BASE_HREF,
                useValue: '/'
            }, {
                provide: THEMES,
                useValue: THEMES
            }, {
                provide: ACTIVE_THEME,
                useValue: ACTIVE_THEME
            }]
        }).compileComponents();
    }));

    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

});
