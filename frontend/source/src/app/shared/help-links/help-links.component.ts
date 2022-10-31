import { Component, OnInit } from '@angular/core';
import { LocaleService } from 'src/app/core/locale/locale.service'; // import LocaleService 
@Component({
  selector: 'ds-help-links',
  templateUrl: './help-links.component.html',
  styleUrls: ['./help-links.component.scss']
})
export class HelpLinksComponent implements OnInit {

  constructor(
    private localeService : LocaleService , /* kware edit - call service from LocaleService */
  ) {
    
  }

   links=[{
    label:"text",
    link:"http://dspace-wiki.kwaretech.com/"+this.localeService.getCurrentLanguageCode()+"/DSpace/functional-overview"
  }]
  lang=this.localeService.getCurrentLanguageCode();
 

  ngOnInit(): void {
   
  }

}
