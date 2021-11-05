import { MementoField } from "../../../service/memento/mementoField";

describe("isEmpty", () => {
  it("should return false if value is not empty", () => {
    const field = new MementoField("name", "fk_string", "Some not empty value");
    expect(field.isEmpty()).toBe(false);
  });

  it("should return true if value is empty", () => {
    const field = new MementoField("name", "fk_string", "");
    expect(field.isEmpty()).toBe(true);
  });
});

describe("prepareValueToDatabase", () => {
  it("should return float value if value is string numeric", () => {
    const value = "1.45";
    const field = new MementoField("name", "ft_real", value);
    expect(field.prepareValueToDatabase("float")).toEqual(Number(value));
  });
  it("should return float value if value is numeric", () => {
    const value = 1.45;
    const field = new MementoField("name", "ft_real", value);
    expect(field.prepareValueToDatabase("float")).toEqual(value);
  });
  it("should return float null if value is null", () => {
    const value = null;
    const field = new MementoField("name", "ft_real", value);
    expect(field.prepareValueToDatabase("float")).toEqual(value);
  });

  it("should return numeric value if value is numeric", () => {
    const value = 2;
    const field = new MementoField("name", "ft_int", value);
    expect(field.prepareValueToDatabase("int")).toEqual(Number(value));
  });
  it("should return numeric value if value is numeric", () => {
    const value = 254543878454;
    const field = new MementoField("name", "ft_int", value);
    expect(field.prepareValueToDatabase("bigint")).toEqual(Number(value));
  });

  it("should return date value if value is date", () => {
    const value = new Date();
    const field = new MementoField("name", "ft_date_time", value);
    expect(field.prepareValueToDatabase("datetime")).toEqual(value);
  });

  it("should return date value if value is string json", () => {
    const value = new Date();
    const jsonValue = JSON.stringify(value).replace(/"/g, "");
    const field = new MementoField("name", "ft_date_time", jsonValue);
    expect(field.prepareValueToDatabase("datetime")).toEqual(value);
  });

  it("should return string if string value", () => {
    const value = "Hello";
    const field = new MementoField("name", "fk_string", value);
    expect(field.prepareValueToDatabase("varchar(100)")).toEqual(value);
  });
  it("should return empty string if null or undefined", () => {
    const value = null;
    const field = new MementoField("name", "fk_string", value);
    expect(field.prepareValueToDatabase("varchar(100)")).toBe(value);
  });
});
