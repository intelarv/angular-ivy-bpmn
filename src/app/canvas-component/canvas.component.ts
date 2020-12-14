import {
  AfterContentInit,
  Component,
  ElementRef,
  EventEmitter, HostListener,
  Input, NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild, ViewEncapsulation
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { importDiagram } from './rx';
import { CustomModeler } from './bpmn';

import { throwError } from 'rxjs';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss', './canvas.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class CanvasComponent implements OnInit, AfterContentInit, OnChanges, OnDestroy {

  private defaultcanvasurl = '/assets/hf/canvas/bpmn/initial.bpmn';
  // instantiate BpmnJS with component
  private modeler: CustomModeler;

  // retrieve DOM element reference
  @ViewChild('canvasRef', { static: true }) private el: ElementRef;

  @Output() private importDone: EventEmitter<any> = new EventEmitter();

  @Input() private url: string;

  constructor(
    private http: HttpClient,
    private zone: NgZone) {
    console.log('reference added');
  }

  initModeler(): void{

     this.modeler = new CustomModeler({ container: '#canvas',
       width: '100%',
       height: '900px'
     });

     this.loadUrl(this.defaultcanvasurl);


     this.modeler.on('import.done', ({ error }) => {
      if (!error) {
        this.modeler.get('canvas').zoom('fit-viewport');

      }
    });


    // this.modeler.addCustomElements(customElements);

  }

  ngOnInit(): void {
    this.initModeler();
  }

  ngAfterContentInit(): void {

  }

  ngOnChanges(changes: SimpleChanges): void {
    // re-import whenever the url changes
    if (changes.url) {
      // this.loadUrl(changes.url.currentValue);
    }
  }

  ngOnDestroy(): void {
    // destroy BpmnJS instance
    this.modeler.destroy();

  }


  /**
   * Load diagram from URL and emit completion event
   */
  loadUrl(url: string): any {

    return (
      this.http.get(url, { responseType: 'text' }).pipe(
        catchError(err => throwError(err)),
        importDiagram(this.modeler)
      ).subscribe(
        (warnings) => {
          this.importDone.emit({
            type: 'success',
            warnings
          });
        },
        (err) => {
          this.importDone.emit({
            type: 'error',
            error: err
          });
        }
      )
    );
  }


  handleError(err: any): void {
    if (err) {
      console.warn('Ups, error: ', err);
    }
  }


  fitToView(): void {
    this.modeler.get('canvas').zoom('fit-viewport');
    // this.modeler.saveXML((err: any, xml: any) => console.log('Result of saving XML: ', err, xml));
  }

  @HostListener('window:hf-canvas-element-selected-event', ['$event'])
  public hfCanvasElementSelected(event): void {
    console.log('selected event', event);
  }

  @HostListener('window:hf-canvas-element-unselected-event', ['$event'])
  public hfCanvasElementUnSelected(event): void {
    console.log('unselected event', event);
  }
}
