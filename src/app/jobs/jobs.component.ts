import { Component, OnInit, Injectable } from '@angular/core';

import { DataTableModule, SharedModule } from 'primeng/primeng';
import { Job } from './job';

@Component({
  selector: 'app-jobs',
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.scss']
})
export class JobsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
