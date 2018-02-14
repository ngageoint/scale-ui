import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/components/common/messageservice';
import { HttpModule } from '@angular/http';
import { ActivatedRoute } from '@angular/router';

import { RecipesApiService } from './api.service';
import { RecipeDetailsComponent } from './details.component';


describe('RecipeDetailsComponent', () => {
    let component: RecipeDetailsComponent;
    let fixture: ComponentFixture<RecipeDetailsComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecipeDetailsComponent],
            imports: [HttpModule],
            providers: [
                MessageService, RecipesApiService,
                {provide: ActivatedRoute, useClass: class { navigate = jasmine.createSpy('navigate'); }}
            ],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecipeDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
