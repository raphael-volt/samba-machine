import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepViewComponent } from './step-view.component';
import {H2Module} from "../../h2.module";
import {HttpClientModule} from "@angular/common/http";

describe('StepViewComponent', () => {
  let component: StepViewComponent;
  let fixture: ComponentFixture<StepViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StepViewComponent ],
      imports:[
        H2Module,
        HttpClientModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
