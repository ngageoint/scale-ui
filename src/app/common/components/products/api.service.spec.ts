import { TestBed, inject } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { DataService } from '../../services/data.service';
import { ProductsApiService } from './api.service';


describe('ProductsApiService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpModule],
            providers: [DataService, ProductsApiService]
        });
    });

    it('should be created', inject([ProductsApiService], (service: ProductsApiService) => {
        expect(service).toBeTruthy();
    }));
});
