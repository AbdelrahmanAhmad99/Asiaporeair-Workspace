export interface ICountryDto {
  isoCode: string;
  name: string;
  continent: string;
  currencyCode?: string;
  phoneCode?: string;
}

export interface ICreateCountryDto {
  isoCode: string;
  name: string;
  continent: string;
  currencyCode?: string;
  phoneCode?: string;
}

export interface IUpdateCountryDto {
  name: string;
  continent: string;
  currencyCode?: string;
  phoneCode?: string;
}

export interface IAirportBriefDto {
  iataCode: string;
  name: string;
}

export interface ICountryWithAirportsDto extends ICountryDto {
  airports: IAirportBriefDto[];
}
