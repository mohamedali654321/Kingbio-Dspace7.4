import { Component, Inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MetadataValue } from '../../../core/shared/metadata.models';
import { APP_CONFIG, AppConfig } from '../../../../config/app-config.interface';
import { LocaleService } from 'src/app/core/locale/locale.service'; // import LocaleService
/**
 * This component renders the configured 'values' into the ds-metadata-field-wrapper component.
 * It puts the given 'separator' between each two values.
 */
@Component({
  selector: 'ds-metadata-values',
  styleUrls: ['./metadata-values.component.scss'],
  templateUrl: './metadata-values.component.html'
})
export class MetadataValuesComponent implements OnChanges {

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    public localeService: LocaleService  /* kware edit - call service from LocaleService */
  ) {
  }
  // kware edit
  link: any;
  check: boolean;
  /**
   * The metadata values to display
   */
  @Input() mdValues: MetadataValue[];

  /**
   * The seperator used to split the metadata values (can contain HTML)
   */
  @Input() separator: string;

  /**
   * The label for this iteration of metadata values
   */
  @Input() label: string;

  /**
   * Whether the {@link MarkdownPipe} should be used to render these metadata values.
   * This will only have effect if {@link MarkdownConfig#enabled} is true.
   * Mathjax will only be rendered if {@link MarkdownConfig#mathjax} is true.
   */
  @Input() enableMarkdown = false;



  /**
   * This variable will be true if both {@link environment.markdown.enabled} and {@link enableMarkdown} are true.
   */
  renderMarkdown;

  ngOnChanges(changes: SimpleChanges): void {
    this.renderMarkdown = !!this.appConfig.markdown.enabled && this.enableMarkdown;
  }

     // kware edit
     ngOnInit(): void {
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.

      this.link = this.label?.split('.')[2];
     if (this.link === 'type') {this.link = 'itemtype';}
     // if(this.link === 'date') this.link="issued";

     if (this.link === 'date') {this.link = 'issued';}

      if (this.link === 'authoralternative') {this.link = 'author';}

     if (this.link === 'advisoralternative') {this.link = 'advisor';}

       this.check = this.link === 'abstract' || this.link === 'citation' || this.link === 'description' || this.link === 'isbn' || this.link === 'ddc' || this.link === 'papersnumber'
        || this.link === 'linesnumber' || this.link === 'dimensions' || this.link === 'introduction' || this.link === 'conclusion'  || this.link === 'note'  || this.link === 'tableofcontents'
        || this.link === 'usagerestrictions' || this.link === 'maintenance' || this.link === 'usagerestrictions' || this.link === 'isrelated' || this.link === 'statementofresponsibility' || this.link === 'isversionof'  || this.link === 'jobTitleDescription'  || this.link === 'about' || this.link === 'issuedhijri' || this.link === 'title' || this.link === 'name'  ? false : true;



    }

     // kware edit end
}
