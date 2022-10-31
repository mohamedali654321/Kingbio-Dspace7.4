import { Component } from '@angular/core';
import { LocaleService } from 'src/app/core/locale/locale.service'; //kware-edit
@Component({
  selector: 'ds-privacy-content',
  templateUrl: './privacy-content.component.html',
  styleUrls: ['./privacy-content.component.scss']
})
/**
 * Component displaying the contents of the Privacy Statement
 */
export class PrivacyContentComponent {
  //kware-edit
  constructor(
    public localeService: LocaleService ,/* kware edit - call service from LocaleService */
  ){}
  currentLocale: boolean = this.localeService.getCurrentLanguageCode() === 'ar' ? false : true;
  //kware-edit end
}
