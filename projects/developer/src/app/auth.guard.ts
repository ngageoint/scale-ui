import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Globals } from './globals';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private globals: Globals,
    private router: Router,
  ) {
  }

  public canActivate(): boolean {
    if (!this.globals.is_staff) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
