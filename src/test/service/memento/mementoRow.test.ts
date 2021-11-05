import { MementoRow } from "../../../service/memento/mementoRow";

export const objectSample = {
  nazwa_srodka: {
    value: "SUPEROL CC SAE 40 (luz)",
    name: "Nazwa srodka",
    type: "ft_string",
  },
  "cena_sr_wazona__zl/l_": {
    value: null,
    name: "Cena sr wazona (zl/l)",
    type: "ft_real",
  },
  notatka_glosowa: {
    value: [],
    name: "Notatka glosowa",
    type: "ft_audio",
  },
  zdjecie: {
    value: [],
    name: "Zdjęcie",
    type: "ft_img",
  },
  id: {
    value: "O-O-S-14-1",
    name: "ID",
    type: "ft_string",
  },
  ref: {
    value: 282,
    name: "REF",
    type: "ft_int",
  },
  wartosc_netto: {
    value: 80.8,
    name: "Wartość netto",
    type: "ft_real",
  },
  idl: {
    value: [],
    name: "IDL",
    type: "ft_lib_entry",
  },
  MEMENTO_ID: "SkFkTXJFeWQ1WG5FRHolQGVDV3A",
  Author: null,
  creationTime: "2021-10-22T22:53:52.000Z",
  lastModifiedTime: "2021-10-22T22:53:52.000Z",
  uniqueName: "SUPEROL CC SAE 40 (luz) 282",
};
const mementoRow = new MementoRow(objectSample);

describe("checkIfValueIsObject", () => {
  it("should return true if value is object", () => {
    const value = {
      wartosc_netto: {
        value: 80.8,
        name: "Wartość netto",
        type: "ft_real",
      },
    };
    expect(mementoRow.checkIfValueIsObject(value)).toBe(true);
  });

  it("should return false if value is null", () => {
    const value = null;
    expect(mementoRow.checkIfValueIsObject(value)).toBe(false);
  });
  it("should return false if value is string", () => {
    const value = "SomeString";
    expect(mementoRow.checkIfValueIsObject(value)).toBe(false);
  });
});

describe("getValuesForColumnList", () => {
  it("should return values from passed columns list", () => {
    const columnst = ["nazwa_srodka", "id", "ref"];
    const columnsValuesString = `${objectSample.nazwa_srodka.value} ${objectSample.id.value} ${objectSample.ref.value}`;
    expect(mementoRow.getValuesForColumnList(columnst)).toEqual(
      columnsValuesString
    );
  });
});
