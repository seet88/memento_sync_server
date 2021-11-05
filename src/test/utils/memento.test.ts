import * as utils from "../../utils/memento";

describe("isNotEmpty", () => {
  it("should return true if not empty value", () => {
    const value = "SomeText";
    expect(utils.isNotEmpty(value)).toBe(true);
  });

  it("should return false if object empty, undefined, null, falsy", () => {
    const arrayValues = ["", null, 0];
    for (const value of arrayValues) {
      expect(utils.isNotEmpty(value)).toBe(false);
    }
  });
});

describe("isDate", () => {
  it("should return true if value can convert to date", () => {
    const validTimestamp = 2451414;
    expect(utils.isDate(validTimestamp)).toBe(true);
  });
});

describe("isNumeric", () => {
  it("should return true if value can convert to number", () => {
    const validValueArray = [2, "5", 0, -1, "-4"];
    for (const value of validValueArray)
      expect(utils.isNumeric(value)).toBe(true);
  });
});

describe("isNumeric", () => {
  it("should return false if not empty obj", () => {
    const validValueArray = [
      { first: 1 },
      { secendProps: "hello", "some props": null },
    ];
    for (const value of validValueArray)
      expect(utils.isEmptyObject(value)).toBe(false);
  });

  it("should return true if empty obj", () => {
    const validValueArray = [{}];
    for (const value of validValueArray)
      expect(utils.isEmptyObject(value)).toBe(true);
  });
});

describe("prepareFieldNameKey", () => {
  it("should delete special chars from passed string", () => {
    const validValueArray = [
      { raw: null, after: "" },
      {
        raw: "Ala ma kota, a jeż nie, ż ą ć",
        after: "ala_ma_kota_a_jez_nie_z_a_c",
      },
      { raw: "ą ć Ć ę ż e k", after: "a_c_c_e_z_e_k" },
    ];
    for (const value of validValueArray)
      expect(utils.prepareFieldNameKey(value.raw)).toBe(value.after);
  });
});

describe("prepareValueToNumeric", () => {
  it("should return null if empty or undefined", () => {
    const arrayValues = [null, undefined, ""];
    for (const value of arrayValues) {
      expect(utils.prepareValueToNumeric(value)).toBe(null);
    }
  });

  it("should return number if value is  type number or correct number as string ", () => {
    const value = Math.round(Math.random() * 100);
    expect(utils.prepareValueToNumeric(value)).toBe(value);
    expect(utils.prepareValueToNumeric(String(value))).toBe(value);
  });
});

describe("prepareValueToDatetime", () => {
  it("should return null if empty or undefined", () => {
    const arrayValues = [null, undefined, ""];
    for (const value of arrayValues) {
      expect(utils.prepareValueToDatetime(value)).toBe(null);
    }
  });

  it("should return dateTime if value is type number or correct string/date ", () => {
    const value = new Date();
    expect(utils.prepareValueToDatetime(value)).toStrictEqual(value);
    const jsonValue = JSON.stringify(value).replace(/"/g, "");
    expect(utils.prepareValueToDatetime(jsonValue)).toStrictEqual(value);
  });
});

describe("prepareValueToDate", () => {
  it("should return null if empty or undefined", () => {
    const arrayValues = [null, undefined, ""];
    for (const value of arrayValues) {
      expect(utils.prepareValueToDate(value)).toBe(null);
    }
  });

  it("should reset hours/minutes/seconds,miliSeconds.. from date", () => {
    const value = new Date();
    const jsonValue = JSON.stringify(value).replace(/"/g, "");
    const preparedValue = utils.prepareValueToDate(jsonValue);
    expect(preparedValue?.getHours()).toStrictEqual(0);
    expect(preparedValue?.getMinutes()).toStrictEqual(0);
    expect(preparedValue?.getSeconds()).toStrictEqual(0);
    expect(preparedValue?.getMilliseconds()).toStrictEqual(0);
  });

  //   it("should return date if value is type number or correct string/date ", () => {
  //     const value = new Date(2021, 10, 10, 17);
  //     expect(utils.prepareValueToDate(value)).toEqual(value);
  //     const jsonValue = JSON.stringify(value).replace(/"/g, "");
  //     const preparedValue = utils.prepareValueToDate(jsonValue);
  //     expect(preparedValue?.getMinutes()).toStrictEqual(0);
  //   });
});
