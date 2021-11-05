import { DatabaseRow } from "../../../service/database/databaseRow";

const sampleObject = {
  Nazwa_srodka: "Reglone 200 SL",
  ID: "H-49-1",
  jednostka_opakowania: "l",
  Wartosc_netto: 183.5,
  Data_wprowadzenia_co_do_minuty: null,
  Data_waznosci: null,
  REF: 3,
  Cena_sr_wazona_zl_l: null,
  MEMENTO_ID: "1616326948012",
  lastMementoEditTime: {},
  uniqueName: "3",
  SysStartTime: {},
};

const databaseRow = new DatabaseRow(sampleObject);

describe("getRefKeyFromFields", () => {
  it("should return ref key of passed object", () => {
    expect(databaseRow.getRefKeyFromFields(sampleObject)).toEqual("REF");
  });

  it("should return ref empty string of passed object not contain ref", () => {
    const obj = {};
    expect(databaseRow.getRefKeyFromFields(obj)).toEqual("");
  });
});
