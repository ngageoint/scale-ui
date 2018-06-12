import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DataService } from '../../services/data.service';
import { ProductsApiService } from './api.service';


describe('ProductsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService, ProductsApiService]
        });
    });

    it('should be created', inject([ProductsApiService], (service: ProductsApiService) => {
        expect(service).toBeTruthy();
    }));
});
