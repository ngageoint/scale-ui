import {Component, OnDestroy, OnInit} from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { MessageService } from 'primeng/components/common/messageservice';

import { StrikesApiService } from './api.service';
import { Strike } from './api.model';
import {filter, map} from 'rxjs/operators';
import * as _ from 'lodash';

@Component({
    selector: 'dev-strikes',
    templateUrl: './component.html',
    styleUrls: ['./component.scss']
})
export class StrikesComponent implements OnInit, OnDestroy {
    private routerEvents: any;
    private routeParams: any;
    loading: boolean;
    strikes: SelectItem[] = [];
    selectedStrike: Strike;
    selectedStrikeDetail: Strike;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private messageService: MessageService,
        private strikesApiService: StrikesApiService
    ) {
        if (this.router.events) {
            this.routerEvents = this.router.events.pipe(
                filter(event => event instanceof NavigationEnd),
                map(() => this.route)
            ).subscribe(() => {
                this.strikes = [];
                let id = null;
                if (this.route && this.route.paramMap) {
                    this.routeParams = this.route.paramMap.subscribe(params => {
                        id = +params.get('id');
                    });
                }
                this.loading = true;
                this.strikesApiService.getStrikes().subscribe(data => {
                    _.forEach(data.results, result => {
                        this.strikes.push({
                            label: result.title,
                            value: result
                        });
                        if (id === result.id) {
                            this.selectedStrike = result;
                        }
                    });
                    if (id) {
                        this.getStrikeDetail(id);
                    } else {
                        this.loading = false;
                    }
                }, err => {
                    this.loading = false;
                    console.log(err);
                    this.messageService.add({severity: 'error', summary: 'Error retrieving strikes', detail: err.statusText});
                });
            });
        }
    }

    private getStrikeDetail(id: number) {
        this.strikesApiService.getStrike(id).subscribe(data => {
            this.loading = false;
            this.selectedStrikeDetail = data;
        }, err => {
            this.loading = false;
            this.messageService.add({severity: 'error', summary: 'Error retrieving strike details', detail: err.statusText});
        });
    }

    getUnicode(code) {
        return `&#x${code};`;
    }

    onEditClick(e) {
        if (e.ctrlKey || e.metaKey) {
            window.open(`/system/strikes/edit/${this.selectedStrikeDetail.id}`);
        } else {
            this.router.navigate([`/system/strikes/edit/${this.selectedStrikeDetail.id}`]);
        }
    }

    onRowSelect(e) {
        if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) {
            window.open(`/system/strikes/${e.value.id}`);
        } else {
            this.router.navigate([`/system/strikes/${e.value.id}`]);
        }
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
