import { Injectable } from '@angular/core';
import { hasValue, isEmpty } from '../../shared/empty.util';
import { DSpaceObject } from '../shared/dspace-object.model';
import { TranslateService } from '@ngx-translate/core';
import { LocaleService } from 'src/app/core/locale/locale.service'; // import LocaleService

/**
 * Returns a name for a {@link DSpaceObject} based
 * on its render types.
 */
@Injectable({
  providedIn: 'root'
})
export class DSONameService {
  //kware-edit check locale
localeAr: boolean;
localeEn: boolean;
arabicLang: boolean;
englishLang: boolean;
title: string; // kware-edit

  constructor(private translateService: TranslateService,
    public localeService: LocaleService , /* kware edit - call service from LocaleService */
    ) {

  }

  /**
   * Functions to generate the specific names.
   *
   * If this list ever expands it will probably be worth it to
   * refactor this using decorators for specific entity types,
   * or perhaps by using a dedicated model for each entity type
   *
   * With only two exceptions those solutions seem overkill for now.
   */
  private readonly factories = {
    Person: (dso: DSpaceObject): string => {
      const familyName = dso.firstMetadataValue('person.familyName');
      const givenName = dso.firstMetadataValue('person.givenName');
      if (isEmpty(familyName) && isEmpty(givenName)) {
        return dso.firstMetadataValue('dc.title') || dso.name;
      } else if (isEmpty(familyName) || isEmpty(givenName)) {
        return familyName || givenName;
      } else {
        return `${familyName}, ${givenName}`;
      }
    },
    OrgUnit: (dso: DSpaceObject): string => {
      return dso.firstMetadataValue('organization.legalName');
    },
    SubOrgUnit: (dso: DSpaceObject): string => {
      return dso.firstMetadataValue('organization.legalName');
    },
    Place: (dso: DSpaceObject): string => {
      return dso.firstMetadataValue('place.legalName');
    },
    Event: (dso: DSpaceObject): string => {
      return dso.firstMetadataValue('event.title');
    },
    Default: (dso: DSpaceObject): string => {
      // If object doesn't have dc.title metadata use name property
             // kware-edit keywords end
   // kware-edit replace title ith alternative-title of items based on langugae

   this.localeAr = this.localeService.getCurrentLanguageCode() === 'ar';
   this.localeEn = this.localeService.getCurrentLanguageCode()   === 'en';
   this.arabicLang = dso.firstMetadataValue('dc.language.iso') === 'Arabic | العربية';
   this.englishLang = dso.firstMetadataValue('dc.language.iso') === 'English | الإنجليزية';

    switch (true){
        case (this.localeAr && this.arabicLang):
           this.title = dso.firstMetadataValue('dc.title');
           break;
         case (this.localeAr && !this.arabicLang && !!dso.firstMetadataValue('dc.title.alternative')  ):
           this.title = dso.firstMetadataValue('dc.title.alternative');
           break;
         case (this.localeAr && !this.arabicLang  && !dso.firstMetadataValue('dc.title.alternative') ):
           this.title = dso.firstMetadataValue('dc.title');
           break;
         case (this.localeEn && this.englishLang) :
           this.title = dso.firstMetadataValue('dc.title');
           break;
          case (this.localeEn && !this.englishLang && !!dso.firstMetadataValue('dc.title.alternative')  ) :
             this.title = dso.firstMetadataValue('dc.title.alternative');
             break;
           case (this.localeEn && !this.englishLang && !dso.firstMetadataValue('dc.title.alternative') ) :
             this.title = dso.firstMetadataValue('dc.title');
             break;

    }
    //kware-edit end
      return this.title || dso.name || this.translateService.instant('dso.name.untitled');
    }
  };

  /**
   * Get the name for the given {@link DSpaceObject}
   *
   * @param dso  The {@link DSpaceObject} you want a name for
   */
  getName(dso: DSpaceObject): string {
    const types = dso.getRenderTypes();
    const match = types
      .filter((type) => typeof type === 'string')
      .find((type: string) => Object.keys(this.factories).includes(type)) as string;

    let name;
    //kware-edit
    if (hasValue(match)) {
      name = this.localeService.getStringByLocale(this.factories[match](dso));
    }
    if (isEmpty(name)) {
      name = this.localeService.getStringByLocale(this.factories.Default(dso)) ;
    }
    return this.localeService.getStringByLocale(name);
  }

}
