import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DashboardJobsService } from '../jobs.service';
import { JobTypeItemComponent } from './component';


describe('JobTypeItemComponent', () => {
    let component: JobTypeItemComponent;
    let fixture: ComponentFixture<JobTypeItemComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [JobTypeItemComponent],
            providers: [DashboardJobsService]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobTypeItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
