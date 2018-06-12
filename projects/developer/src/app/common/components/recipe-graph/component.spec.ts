import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RecipeGraphComponent } from './component';
import { ColorService } from '../../services/color.service';
import { DataService } from '../../services/data.service';


describe('RecipeGraphComponent', () => {
    let component: RecipeGraphComponent;
    let fixture: ComponentFixture<RecipeGraphComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [RecipeGraphComponent],
            imports: [HttpClientTestingModule],
            providers: [ColorService, DataService],
            // Tells the compiler not to error on unknown elements and attributes
            schemas: [NO_ERRORS_SCHEMA]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(RecipeGraphComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
