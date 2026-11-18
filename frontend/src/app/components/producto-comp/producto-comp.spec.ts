import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductoComp } from './producto-comp';

describe('ProductoComp', () => {
  let component: ProductoComp;
  let fixture: ComponentFixture<ProductoComp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoComp],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductoComp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
