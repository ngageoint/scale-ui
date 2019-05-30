import { Injectable, Inject, EventEmitter } from '@angular/core';
import { THEMES, ACTIVE_THEME, Theme } from './symbols';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    themeChange = new EventEmitter<Theme>();

    constructor(
        @Inject(THEMES) public themes: Theme[],
        @Inject(ACTIVE_THEME) public theme: string
    ) {}

    getTheme(name: string) {
        if (name) {
            const theme = this.themes.find(t => t.name === name);
            if (!theme) {
                throw new Error(`Theme not found: '${name}'`);
            }
            return theme;
        }
        return null;
    }

    getThemes() {
        return this.themes;
    }

    getActiveTheme() {
        return this.getTheme(this.theme);
    }

    getProperty(propName: string) {
        return this.getActiveTheme().properties[propName];
    }

    setTheme(name: string) {
        this.theme = name;
        this.themeChange.emit( this.getActiveTheme());
    }

    registerTheme(theme: Theme) {
        this.themes.push(theme);
    }

    updateTheme(name: string, properties: { [key: string]: string; }) {
        const theme = this.getTheme(name);
        if (theme) {
            theme.properties = {
                ...theme.properties,
                ...properties
            };

            if (name === this.theme) {
                this.themeChange.emit(theme);
            }
        }
    }
}
