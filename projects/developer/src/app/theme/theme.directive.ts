import { Directive, OnInit, OnDestroy, ElementRef, Inject, Input } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ThemeService } from './theme.service';
import { Theme } from './symbols';

@Directive({
    selector: '[devTheme]'
})
export class ThemeDirective implements OnInit, OnDestroy {
    @Input() scoped = true;
    private destroy = new Subject();

    constructor(
        private elementRef: ElementRef,
        private themeService: ThemeService,
        @Inject(DOCUMENT) private _document: any
    ) {}

    ngOnInit() {
        const active = this.themeService.getActiveTheme();
        if (active) {
            this.updateTheme(active);
        }

        this.themeService.themeChange
            .pipe(takeUntil(this.destroy))
            .subscribe((theme: Theme) => this.updateTheme(theme));
    }

    ngOnDestroy() {
        this.destroy.next();
        this.destroy.complete();
    }

    updateTheme(theme: Theme) {
        const element = this.getElement();

        // project properties onto the element
        for (const key of Object.keys(theme.properties)) {
            element.style.setProperty(key, theme.properties[key]);
        }

        // remove old theme
        for (const name of this.themeService.theme) {
            element.classList.remove(`${name}-theme`);
        }

        // alias element with theme name
        element.classList.add(`${theme.name}-theme`);
    }

    // Element to attach the styles to.
    getElement() {
        return this.scoped ? this.elementRef.nativeElement : this._document.body;
    }

}
