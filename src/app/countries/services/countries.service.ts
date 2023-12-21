import { Injectable } from '@angular/core';
import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private baseUrl: string = 'https://restcountries.com/v3.1';


  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor( private http : HttpClient ) { }

  get regions() : Region[] {
    return [...this._regions];
  }

  getCountriesByRegion( region: Region) : Observable<SmallCountry[]> {

    //https://restcountries.com/v3.1/region/europe?fields=cca3,name,borders

    if(!region) return of([]);  //si no hay región, se devuelve un array vacío

    const url : string = `${ this.baseUrl }/region/${ region }?fields=cca3,name,borders`

    return this.http.get<Country[]>(url)
      .pipe(
        //transforma la info que recibe
        map( countries => countries.map( country => ({  //con la función .map de los arrays renombramos los valores que nos interesan
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []  //operador de covalencia: si es nulo devuelve []
        })))
      );
  }

  getCountryByAlphaCode( alphaCode: string) : Observable<SmallCountry> {

    if(!alphaCode) return of();

    const url: string = `${ this.baseUrl }/alpha/${ alphaCode }?fields=cca3,name,borders`;

    return this.http.get<Country>(url)
      .pipe(
        map( country => ({
          name: country.name.common,
          cca3: country.cca3,
          borders: country.borders ?? []
        }))
      );
  }

  getCountryBordersByCodes (borders:string[]) : Observable<SmallCountry[]> {

    if(!borders || borders.length === 0) return of([]);

    const countriesRequests : Observable<SmallCountry>[] = [];

    borders.forEach( code => {
      const request = this.getCountryByAlphaCode( code );
      countriesRequests.push (request);
    });

    //combineLatest cuando se le llame con un .subscribe emite hasta que todos los observables dentro del array emitan un valor
    return combineLatest( countriesRequests);
  }

}
