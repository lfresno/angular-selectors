import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CountriesService } from '../../services/countries.service';
import { Region, SmallCountry } from '../../interfaces/country.interfaces';
import { filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: ``
})
export class SelectorPageComponent implements OnInit{

  public countriesByRegion :SmallCountry[] = [];
  public selectedBorders : SmallCountry[] = [];

  public myForm: FormGroup = this.fb.group(
    {
      region: ['', [Validators.required]],
      country: ['', [Validators.required]],
      borders: ['', [Validators.required]]
    }
  );

  constructor(
    private fb:FormBuilder,
    private countriesService: CountriesService
  ) {}
  //se ejecuta cuando se inicializa el componente
  ngOnInit(): void {

    this.onRegionChanged();
    this.onCountryChanged();

  }

  get regions() : Region[] {  //apunta por referencia al lugar donde estén las regiones
    return this.countriesService.regions;
  }

  onRegionChanged(): void { //al cambiar la región se podrán ver los países de esta misma

    this.myForm.get('region')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('country')!.setValue('')), //para que cambie a este valor cuando se cambia la región
        tap( () => this.selectedBorders= []),
        //permite recibir el valor de un observable y suscribirme a otro
        switchMap( region => this.countriesService.getCountriesByRegion(region) )
      )
      .subscribe( region => {
        console.log({region});

        this.countriesByRegion = region;
      });
  }

  onCountryChanged() :void {  //cuando se elige un país se enseñan las fronteras

    this.myForm.get('country')!.valueChanges
      .pipe(
        tap( () => this.myForm.get('borders')!.setValue('')), //para que cambie a este valor cuando se cambia la región
        //permite recibir el valor de un observable y suscribirme a otro
        filter( (value : string) => value.length > 0),  //si es un string vacío, no sigue
        switchMap( alphaCode => this.countriesService.getCountryByAlphaCode(alphaCode) ),
        //queremos poder escribir el nombre de los países de las fronteras, no sólo su código
        switchMap( country => this.countriesService.getCountryBordersByCodes(country.borders))
      )
      .subscribe( countries => {

        this.selectedBorders = countries;
      });
  }
}
