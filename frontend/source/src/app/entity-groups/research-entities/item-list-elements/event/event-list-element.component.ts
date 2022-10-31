import { Component } from '@angular/core';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { AbstractListableElementComponent } from '../../../../shared/object-collection/shared/object-collection-element/abstract-listable-element.component';
import { Item } from '../../../../core/shared/item.model';

@listableObjectComponent('Event', ViewMode.ListElement)
@Component({
  selector: 'ds-event-list-element',
  styleUrls: ['./event-list-element.component.scss'],
  templateUrl: './event-list-element.component.html'
})
/**
 * The component for displaying a list element for an item of the type Organisation Unit
 */
export class EventListElementComponent extends AbstractListableElementComponent<Item> {
}
