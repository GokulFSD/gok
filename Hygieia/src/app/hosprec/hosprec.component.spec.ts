import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HosprecComponent } from './hosprec.component';

describe('HosprecComponent', () => {
  let component: HosprecComponent;
  let fixture: ComponentFixture<HosprecComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HosprecComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HosprecComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
