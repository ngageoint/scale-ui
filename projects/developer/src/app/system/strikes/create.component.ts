import { Component, OnDestroy, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Strike } from './api.model';
import { filter, map } from 'rxjs/operators';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { StrikesApiService } from './api.service';

@Component({
    selector: 'dev-strikes-create',
    templateUrl: './create.component.html',
    styleUrls: ['./create.component.scss']
})
export class StrikesCreateComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    mode: string;
    strike: any;
    workspaces: any = [];
    createForm: FormGroup;
    jsonConfig: any;
    items: MenuItem[] = [
        { label: 'Validate', icon: 'fa fa-check', command: () => { this.onValidateClick(); } },
        { label: 'Save', icon: 'fa fa-save', command: () => { this.onSaveClick(); } },
        { separator: true },
        { label: 'Cancel', icon: 'fa fa-remove', command: () => { this.onCancelClick(); } }
    ];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder,
        private strikesApiService: StrikesApiService
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events.pipe(
                filter((event) => event instanceof NavigationEnd),
                map(() => this.route)
            ).subscribe(() => {
                let id = null;
                if (this.route && this.route.paramMap) {
                    this.routeParams = this.route.paramMap.subscribe(params => {
                        id = params.get('id');
                    });
                }
                if (id) {
                    this.mode = 'Edit';
                    this.strikesApiService.getStrike(id).subscribe(data => {
                        this.strike = data;
                    });
                } else {
                    this.mode = 'Create';
                    this.strike = Strike.transformer(null);
                }

                this.createForm = this.fb.group({
                    'name': new FormControl(''),
                    'title': new FormControl('')
                });
                this.workspaces = [];
                this.jsonConfig = {
                    mode: {name: 'application/json', json: true},
                    indentUnit: 4,
                    lineNumbers: true,
                    readOnly: 'nocursor',
                    viewportMargin: Infinity
                };
                this.createForm.valueChanges.subscribe(() => {
                    this.validateForm();
                });
            });
        }
    }

    private validateForm() {
        console.log('validate form');
    }

    onValidateClick() {
        console.log('validate');
    }

    onSaveClick() {
        console.log('save');
    }

    onCancelClick() {
        console.log('cancel');
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.routerEvents) {
            this.routerEvents.unsubscribe();
        }
        if (this.routeParams) {
            this.routeParams.unsubscribe();
        }
    }
}
