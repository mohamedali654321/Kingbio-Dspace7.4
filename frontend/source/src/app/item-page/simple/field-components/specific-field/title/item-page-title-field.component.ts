import { Component, Input } from '@angular/core';

import { Item } from '../../../../../core/shared/item.model';
import { DSONameService } from '../../../../../core/breadcrumbs/dso-name.service';
import { LocaleService } from 'src/app/core/locale/locale.service'; //kware-edit
@Component({
  selector: 'ds-item-page-title-field',
  templateUrl: './item-page-title-field.component.html'
})
/**
 * This component is used for displaying the title (defined by the {@link DSONameService}) of an item
 */
export class ItemPageTitleFieldComponent {

  /**
   * The item to display metadata for
   */
  @Input() item: Item;

  constructor(
    public dsoNameService: DSONameService,public localeService: LocaleService, //kware-edit
  ) {
  }
     // replace comma ', or ;' to '،' if language  is Arabic
     convertComma(str: string): string{
      let newstr = '';
      if (this.localeService.getCurrentLanguageCode() === 'ar'){
        let regx = /;|,/gi;
       newstr = str.replace(regx, '،');
       return newstr;

      } else {
        return str;
      }
    }

}
