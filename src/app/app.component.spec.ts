import { TestBed, async } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';


describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
                AppModule
            ],
            providers: [{
                provide: APP_BASE_HREF,
                useValue: '/'
            }]
        }).compileComponents();
    }));

    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

});
