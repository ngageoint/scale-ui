import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { DashboardJobsService } from '../jobs.service';
import { JobtypeitemComponent } from './jobtypeitem.component';


describe('JobtypeitemComponent', () => {
    let component: JobtypeitemComponent;
    let fixture: ComponentFixture<JobtypeitemComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [JobtypeitemComponent],
            providers: [DashboardJobsService]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(JobtypeitemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
});
