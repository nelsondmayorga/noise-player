import {Directive, ElementRef, EventEmitter, HostListener, Output} from '@angular/core';

@Directive({
  selector: '[appClickOutside]'
})
export class ClickOutsideDirective {

  @Output() public clickOutside = new EventEmitter();

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:mousedown', ['$event.target'])
  public onClick(targetElement) {
    const isClickedInside = this.elementRef.nativeElement.contains(targetElement);
    if (!isClickedInside) {
      this.clickOutside.emit(null);
    }
  }

}
