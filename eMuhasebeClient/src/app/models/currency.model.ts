export class CurrencyModel {
  name: string = "";
  value: number = 1;
  symbol: string = "";
}

export const CurrencyTypes: CurrencyModel[] = [
  { name: "Türk Lirası", value: 1, symbol: "₺" },
  { name: "Amerikan Doları", value: 2, symbol: "$" },
  { name: "Euro", value: 3, symbol: "€" }
];
