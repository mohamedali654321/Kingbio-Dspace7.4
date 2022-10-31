import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { MenuService } from '../shared/menu/menu.service';
import { MenuID } from '../shared/menu/menu-id.model';
import { LocaleService } from 'src/app/core/locale/locale.service'; // import LocaleService

/**
 * Represents the header with the logo and simple navigation
 */
@Component({
  selector: 'ds-header',
  styleUrls: ['header.component.scss'],
  templateUrl: 'header.component.html',
})
export class HeaderComponent {
  /**
   * Whether user is authenticated.
   * @type {Observable<string>}
   */
  public isAuthenticated: Observable<boolean>;
  public showAuth = false;
  menuID = MenuID.PUBLIC;

  constructor(
    private menuService: MenuService,
    public localeService: LocaleService , /* kware edit - call service from LocaleService */
  ) {
  }

  public toggleNavbar(): void {
    this.menuService.toggleMenu(this.menuID);
  }
}
