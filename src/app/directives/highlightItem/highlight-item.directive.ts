import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appHighlightItem]'
})
export class HighlightItemDirective {

  constructor(private el: ElementRef) {}

  @HostListener('click') click() {
    this.el.nativeElement.style.backgroundColor = 'lightgray';
  }

}
