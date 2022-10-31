import { Pipe, PipeTransform } from '@angular/core';
import { LocaleService } from 'src/app/core/locale/locale.service';

@Pipe({
  name: 'kwareTranslate',
  pure:true
})
export class KwareTranslatePipe implements PipeTransform {
  constructor(public localeService: LocaleService) {}


  transform(value: any): any {
    if (value && value.includes('|')) {
      return this.localeService.getCurrentLanguageCode() === 'ar'? value.split("|")[1] : value.split("|")[0]
    }
    return value;
  }

}
