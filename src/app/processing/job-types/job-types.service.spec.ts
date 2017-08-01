import { TestBed, inject } from '@angular/core/testing';

import { JobTypesService } from './job-types.service';

describe('JobTypesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JobTypesService]
    });
  });

  it('should be created', inject([JobTypesService], (service: JobTypesService) => {
    expect(service).toBeTruthy();
  }));
});
