import { Component } from '@angular/core';

import { Collection } from '../../../core/shared/collection.model';
import { AbstractListableElementComponent } from '../../object-collection/shared/object-collection-element/abstract-listable-element.component';
import { ViewMode } from '../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../object-collection/shared/listable-object/listable-object.decorator';
import { hasNoValue, hasValue } from '../../empty.util';
import { LinkService } from 'src/app/core/cache/builders/link.service';
import { followLink } from '../../utils/follow-link-config.model';


@Component({
  selector: 'ds-collection-list-element',
  styleUrls: ['./collection-list-element.component.scss'],
  templateUrl: './collection-list-element.component.html'
})
/**
 * Component representing list element for a collection
 */
@listableObjectComponent(Collection, ViewMode.ListElement)
export class CollectionListElementComponent extends AbstractListableElementComponent<Collection> {
  // private _object: Collection;

  // constructor(private linkService: LinkService) {
  //   super();
  // }

  // // @ts-ignore
  // @Input() set object(object: Collection) {
  //   this._object = object;
  //   if (hasValue(this._object) && hasNoValue(this._object.logo)) {
  //     this.linkService.resolveLink<Collection>(
  //       this._object,
  //       followLink('logo')
  //     );
  //   }
  // }

  // get object(): Collection {
  //   return this._object;
  // }

}
