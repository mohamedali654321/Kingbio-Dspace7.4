import { Component, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  DynamicFormControlModel,
  DynamicFormOptionConfig,
  DynamicFormService,
  DynamicSelectModel
} from '@ng-dynamic-forms/core';

import { Collection } from '../../core/shared/collection.model';
import { ComColFormComponent } from '../../shared/comcol/comcol-forms/comcol-form/comcol-form.component';
import { NotificationsService } from '../../shared/notifications/notifications.service';
import { CommunityDataService } from '../../core/data/community-data.service';
import { AuthService } from '../../core/auth/auth.service';
import { RequestService } from '../../core/data/request.service';
import { ObjectCacheService } from '../../core/cache/object-cache.service';
import { EntityTypeDataService } from '../../core/data/entity-type-data.service';
import { ItemType } from '../../core/shared/item-relationships/item-type.model';
import { MetadataValue } from '../../core/shared/metadata.models';
import { getFirstSucceededRemoteListPayload } from '../../core/shared/operators';
import { collectionFormEntityTypeSelectionConfig, collectionFormModels, } from './collection-form.models';
import { NONE_ENTITY_TYPE } from '../../core/shared/item-relationships/item-type.resource-type';
import { LocaleService } from 'src/app/core/locale/locale.service'; //kware-edit

/**
 * Form used for creating and editing collections
 */
@Component({
  selector: 'ds-collection-form',
  styleUrls: ['../../shared/comcol/comcol-forms/comcol-form/comcol-form.component.scss'],
  templateUrl: '../../shared/comcol/comcol-forms/comcol-form/comcol-form.component.html'
})
export class CollectionFormComponent extends ComColFormComponent<Collection> implements OnInit {
  /**
   * @type {Collection} A new collection when a collection is being created, an existing Input collection when a collection is being edited
   */
  @Input() dso: Collection = new Collection();

  /**
   * @type {Collection.type} This is a collection-type form
   */
  type = Collection.type;

  /**
   * The dynamic form field used for entity type selection
   * @type {DynamicSelectModel<string>}
   */
  entityTypeSelection: DynamicSelectModel<string> = new DynamicSelectModel(collectionFormEntityTypeSelectionConfig);

  /**
   * The dynamic form fields used for creating/editing a collection
   * @type {DynamicFormControlModel[]}
   */
  formModel: DynamicFormControlModel[];

  public constructor(protected formService: DynamicFormService,
                     protected translate: TranslateService,
                     protected notificationsService: NotificationsService,
                     protected authService: AuthService,
                     protected dsoService: CommunityDataService,
                     protected requestService: RequestService,
                     public localeService: LocaleService, //kware-edit
                     protected objectCache: ObjectCacheService,
                     protected entityTypeService: EntityTypeDataService) {
    super(formService, translate, notificationsService, authService, requestService, objectCache);
  }

  ngOnInit() {

    let currentRelationshipValue: MetadataValue[];
    if (this.dso && this.dso.metadata) {
      currentRelationshipValue = this.dso.metadata['dspace.entity.type'];
    }

    const entities$: Observable<ItemType[]> = this.entityTypeService.findAll({ elementsPerPage: 100, currentPage: 1 }).pipe(
      getFirstSucceededRemoteListPayload()
    );

    // retrieve all entity types to populate the dropdowns selection
    entities$.subscribe((entityTypes: ItemType[]) => {

        entityTypes
          .filter((type: ItemType) => type.label !== NONE_ENTITY_TYPE)
          .forEach((type: ItemType, index: number) => {
          this.entityTypeSelection.add({
            disabled: false,
            label: this.getEntityType(type.label), //kware-edit
            value: type.label
          } as DynamicFormOptionConfig<string>);
          if (currentRelationshipValue && currentRelationshipValue.length > 0 && currentRelationshipValue[0].value === type.label) {
            this.entityTypeSelection.select(index);
            this.entityTypeSelection.disabled = true;
          }
        });

        this.formModel = [...collectionFormModels, this.entityTypeSelection];

        super.ngOnInit();
    });

  }

// kware-edit
  getEntityType(label) {
    switch (true) {
      case label === 'Person' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'شخص';
        break;
      case label === 'Person' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'Publication' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'منشور';
        break;
      case label === 'Publication' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'Project' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'مشروع';
        break;
      case label === 'Project' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'OrgUnit' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'مؤسسة';
        break;
      case label === 'OrgUnit' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'Journal' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'دورية';
        break;
      case label === 'Journal' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'JournalVolume' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'مجلد دورية';
        break;
      case label === 'JournalVolume' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'JournalIssue' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'عدد دورية';
        break;
      case label === 'JournalIssue' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'Event' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'حدث';
        break;
      case label === 'Event' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'Place' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'مكان';
        break;
      case label === 'Place' &&
        this.localeService.getCurrentLanguageCode() === 'en':
        return label;
        break;
      case label === 'Series' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'سلسة';
        break;
      case label === 'Series' &&
          this.localeService.getCurrentLanguageCode() === 'en':
          return label;
        break;
        case label === 'Era' &&
        this.localeService.getCurrentLanguageCode() === 'ar':
        return 'حقبة زمنية';
        break;
      case label === 'Era' &&
          this.localeService.getCurrentLanguageCode() === 'en':
          return label;
          break;
          case label === 'SubOrgUnit' &&
          this.localeService.getCurrentLanguageCode() === 'ar':
          return 'مؤسسة فرعية';
          break;
        case label === 'SubOrgUnit' &&
            this.localeService.getCurrentLanguageCode() === 'en':
            return label;
            break;
            case label === 'Location' &&
            this.localeService.getCurrentLanguageCode() === 'ar':
            return 'موقع';
            break;
          case label === 'Location' &&
              this.localeService.getCurrentLanguageCode() === 'en':
              return label;
        break;
      default:
        return label;
    }
  }
  // kware-edit end
}
