import { MementoTable } from "../../../service/memento/mementoTable";

const sampleObject = {
  entries: [
    {
      nazwa_srodka: {
        value: "Rzepak oz. Columbia Fa Ca Buteo",
        name: "Nazwa srodka",
        type: "ft_string",
      },
      "cena_sr_wazona__zl/l_": {
        value: null,
        name: "Cena sr wazona (zl/l)",
        type: "ft_real",
      },
      kod_paskowy: {
        value: "",
        name: "kod paskowy",
        type: "ft_barcode",
      },
      zdjecie: {
        value: [],
        name: "Zdjęcie",
        type: "ft_img",
      },
      id: {
        value: "S-301-17",
        name: "ID",
        type: "ft_string",
      },
      ref: {
        value: 1353,
        name: "REF",
        type: "ft_int",
      },
      "data_wprowadzenia_co_do minuty": {
        value: null,
        name: "Data wprowadzenia co do minuty",
        type: "ft_date_time",
      },
      ost_zmiana: {
        value: "2021-10-21T20:14:03.349Z",
        name: "Ost_zmiana",
        type: "ft_date_time",
      },
      MEMENTO_ID: "WyNkSV1yciNwVm1yKEhvVVhqUSM",
      Author: null,
      creationTime: "2021-10-21T20:14:03.000Z",
      lastModifiedTime: "2021-10-21T20:14:03.000Z",
      uniqueName: "Rzepak oz. Columbia Fa Ca Buteo 1353",
    },
    {
      nazwa_srodka: {
        value: "Nero 424EC",
        name: "Nazwa srodka",
        type: "ft_string",
      },
      "cena_sr_wazona__zl/l_": {
        value: null,
        name: "Cena sr wazona (zl/l)",
        type: "ft_real",
      },
      zdjecie: {
        value: [],
        name: "Zdjęcie",
        type: "ft_img",
      },
      id: {
        value: "H-41-1",
        name: "ID",
        type: "ft_string",
      },
      ref: {
        value: 1352,
        name: "REF",
        type: "ft_int",
      },
      "data_wprowadzenia_co_do minuty": {
        value: null,
        name: "Data wprowadzenia co do minuty",
        type: "ft_date_time",
      },
      ost_zmiana: {
        value: "2021-10-21T20:14:03.326Z",
        name: "Ost_zmiana",
        type: "ft_date_time",
      },
      MEMENTO_ID: "SGsxMDZXQURIUG9OIVhOO3AoOkA",
      Author: null,
      creationTime: "2021-10-21T20:14:03.000Z",
      lastModifiedTime: "2021-10-21T20:29:36.000Z",
      uniqueName: "Nero 424EC 1352",
    },
  ],
  tableName: "Inwentura PROD",
  userName: "GospoTab 1",
};

const mementoTable = new MementoTable(sampleObject);

describe("setTableNameAsInGS", () => {
  it("should return pola if value is 'pola PROD' ", () => {
    expect(mementoTable.setTableNameAsInGS("pola PROD")).toEqual("pola");
  });

  it("should else should return passed value ", () => {
    const somePassedValues = "SomeTableName";
    expect(mementoTable.setTableNameAsInGS(somePassedValues)).toEqual(
      somePassedValues
    );
  });
});
