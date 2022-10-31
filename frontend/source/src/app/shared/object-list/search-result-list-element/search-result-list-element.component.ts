import { Component, Inject, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { SearchResult } from '../../search/models/search-result.model';
import { DSpaceObject } from '../../../core/shared/dspace-object.model';
import { hasValue } from '../../empty.util';
import { AbstractListableElementComponent } from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';
import { TruncatableService } from '../../truncatable/truncatable.service';
import { Metadata } from '../../../core/shared/metadata.utils';
import { DSONameService } from '../../../core/breadcrumbs/dso-name.service';
import { APP_CONFIG, AppConfig } from '../../../../config/app-config.interface';

@Component({
  selector: 'ds-search-result-list-element',
  template: ``
})
export class SearchResultListElementComponent<T extends SearchResult<K>, K extends DSpaceObject> extends AbstractListableElementComponent<T> implements OnInit {
  /**
   * The DSpaceObject of the search result
   */
  dso: K;
  dsoTitle: string;
  authors = [];
  keywords = [];  //subject
  
   //kware-edit check locale
   localeAr: boolean;
   localeEn: boolean;
   arabicLang: boolean;
   englishLang: boolean;

  public constructor(protected truncatableService: TruncatableService,
                     protected dsoNameService: DSONameService,
                     @Inject(APP_CONFIG) protected appConfig?: AppConfig) {
    super();
  }

  /**
   * Retrieve the dso from the search result
   */
  ngOnInit(): void {
    if (hasValue(this.object)) {
      this.dso = this.object.indexableObject;
      this.dsoTitle = this.dsoNameService.getName(this.dso);
    }
     // this.keywords=this.dso.allMetadataValues('dc.subject').slice(0,3); //kwar-edit
     let  arabic = /[\u0600-\u06FF]/;
     let english = /[a-zA-Z]/;
     let arabicKeyswords = this.dso.allMetadataValues('dc.subject').filter(key=>arabic.test(key));
     let englishKeywords = this.dso.allMetadataValues('dc.subject').filter(key=>english.test(key));
     (typeof window === 'object' && hasValue(window.localStorage)) && window.localStorage.getItem('selectedLangCode')  === 'ar' ? this.keywords = arabicKeyswords : this.keywords = englishKeywords;
     // kware-edit replace title ith alternative-title of items based on langugae

     this.localeAr = (typeof window === 'object' && hasValue(window.localStorage)) && window.localStorage.getItem('selectedLangCode')  === 'ar';
     this.localeEn = (typeof window === 'object' && hasValue(window.localStorage)) && window.localStorage.getItem('selectedLangCode')  === 'en';
     this.arabicLang = this.dso.firstMetadataValue('dc.language.iso') === 'Arabic | العربية';
     this.englishLang = this.dso.firstMetadataValue('dc.language.iso') === 'English | الإنجليزية';

      switch (true){
          case (this.localeAr && this.arabicLang && this.dso.firstMetadataValue('dc.entity.type') === 'publication'):
             this.dsoTitle = this.dso.firstMetadataValue('dc.title');
             break;
           case (this.localeAr && !this.arabicLang && !!this.dso.firstMetadataValue('dc.title.alternative')  && this.dso.firstMetadataValue('dc.entity.type') === 'publication' ):
             this.dsoTitle = this.dso.firstMetadataValue('dc.title.alternative');
             break;
           case (this.localeAr && !this.arabicLang  && !this.dso.firstMetadataValue('dc.title.alternative')  && this.dso.firstMetadataValue('dc.entity.type') === 'publication' ):
             this.dsoTitle = this.dso.firstMetadataValue('dc.title');
             break;
           case (this.localeEn && this.englishLang  && this.dso.firstMetadataValue('dc.entity.type') === 'publication') :
             this.dsoTitle = this.dso.firstMetadataValue('dc.title');
             break;
            case (this.localeEn && !this.englishLang && !!this.dso.firstMetadataValue('dc.title.alternative')  && this.dso.firstMetadataValue('dc.entity.type') === 'publication' ) :
               this.dsoTitle = this.dso.firstMetadataValue('dc.title.alternative');
               break;
             case (this.localeEn && !this.englishLang && !this.dso.firstMetadataValue('dc.title.alternative')  && this.dso.firstMetadataValue('dc.entity.type') === 'publication' ) :
               this.dsoTitle = this.dso.firstMetadataValue('dc.title');
               break;
      }


 
      //kware-edit end

    // kware-edit replace author ith alternative-author of items based on langugaee



    switch (true){
     case (this.localeAr && this.arabicLang ):
       this.authors = this.dso.allMetadataValues(['dc.contributor.author', 'dc.creator', 'dc.contributor.advisor']);
        break;
      case (this.localeAr && !this.arabicLang && this.dso.allMetadataValues(['dc.contributor.authoralternative',  'dc.contributor.advisoralternative']).length > 0   ):
      this.authors = this.dso.allMetadataValues(['dc.contributor.authoralternative',  'dc.contributor.advisoralternative']);
        break;
      case (this.localeAr && !this.arabicLang  && this.dso.allMetadataValues(['dc.contributor.authoralternative',  'dc.contributor.advisoralternative']).length <= 0 ):
       this.authors = this.dso.allMetadataValues(['dc.contributor.author', 'dc.creator', 'dc.contributor.advisor']);
        break;
      case (this.localeEn && this.englishLang) :
       this.authors = this.dso.allMetadataValues(['dc.contributor.author', 'dc.creator', 'dc.contributor.advisor']);
        break;
       case (this.localeEn && !this.englishLang && this.dso.allMetadataValues(['dc.contributor.authoralternative',  'dc.contributor.advisoralternative']).length > 0  ) :
         this.authors = this.dso.allMetadataValues(['dc.contributor.authoralternative',  'dc.contributor.advisoralternative']);
          break;
        case (this.localeEn && !this.englishLang && this.dso.allMetadataValues(['dc.contributor.authoralternative',  'dc.contributor.advisoralternative']).length <= 0 ) :
         this.authors = this.dso.allMetadataValues(['dc.contributor.author', 'dc.creator', 'dc.contributor.advisor']);
          break;
 }

 // kware-edit end


  }

  /**
   * Gets all matching metadata string values from hitHighlights or dso metadata, preferring hitHighlights.
   *
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see [[Metadata]].
   * @returns {string[]} the matching string values or an empty array.
   */
  allMetadataValues(keyOrKeys: string | string[]): string[] {
    return Metadata.allValues([this.object.hitHighlights, this.dso.metadata], keyOrKeys);
  }

  /**
   * Gets the first matching metadata string value from hitHighlights or dso metadata, preferring hitHighlights.
   *
   * @param {string|string[]} keyOrKeys The metadata key(s) in scope. Wildcards are supported; see [[Metadata]].
   * @returns {string} the first matching string value, or `undefined`.
   */
  firstMetadataValue(keyOrKeys: string | string[]): string {
    return Metadata.firstValue([this.object.hitHighlights, this.dso.metadata], keyOrKeys);
  }

  /**
   * Emits if the list element is currently collapsed or not
   */
  isCollapsed(): Observable<boolean> {
    return this.truncatableService.isCollapsed(this.dso.id);
  }

}
