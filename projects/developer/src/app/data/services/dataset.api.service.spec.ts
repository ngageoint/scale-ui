import { TestBed } from '@angular/core/testing';

import { DatasetApiService } from './dataset.api.service';

describe('DatasetApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatasetApiService = TestBed.get(DatasetApiService);
    expect(service).toBeTruthy();
  });
});
