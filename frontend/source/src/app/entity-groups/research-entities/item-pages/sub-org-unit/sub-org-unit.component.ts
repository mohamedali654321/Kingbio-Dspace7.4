import { Component } from '@angular/core';
import { ViewMode } from '../../../../core/shared/view-mode.model';
import { listableObjectComponent } from '../../../../shared/object-collection/shared/listable-object/listable-object.decorator';
import { VersionedItemComponent } from '../../../../item-page/simple/item-types/versioned-item/versioned-item.component';

/**
 * Component that represents a publication Item page
 */

@listableObjectComponent('SubOrgUnit', ViewMode.StandalonePage)
@Component({
  selector: 'ds-sub-org-unit',
  styleUrls: ['./sub-org-unit.component.scss'],
  templateUrl: './sub-org-unit.component.html',
  
})
export class SubOrgUnitComponent extends VersionedItemComponent {

}
