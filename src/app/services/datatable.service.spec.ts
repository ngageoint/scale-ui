import { TestBed, inject } from '@angular/core/testing';

import { DatatableService } from './datatable.service';

describe('DatatableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatatableService]
    });
  });

  it('should be created', inject([DatatableService], (service: DatatableService) => {
    expect(service).toBeTruthy();
  }));
});
