export function prepareFieldNameKey(fieldName: any): string {
  if (!fieldName) return "";
  fieldName = String(fieldName);
  fieldName = fieldName.toLowerCase();
  fieldName = fieldName.replace(/ą/g, "a");
  fieldName = fieldName.replace(/ó/g, "o");
  fieldName = fieldName.replace(/ę/g, "e");
  fieldName = fieldName.replace(/ć/g, "c");
  fieldName = fieldName.replace(/ł/g, "l");
  fieldName = fieldName.replace(/ń/g, "n");
  fieldName = fieldName.replace(/ś/g, "s");
  fieldName = fieldName.replace(/ż/g, "z");
  fieldName = fieldName.replace(/ź/g, "z");
  fieldName = fieldName.replace(/  /g, "_");
  fieldName = fieldName.replace(/ /g, "_");
  fieldName = fieldName.replace(/\./g, "");
  fieldName = fieldName.replace(/,/g, "");
  fieldName = fieldName.replace(/__/g, "_");
  fieldName = fieldName.replace(/\(/g, "_");
  fieldName = fieldName.replace(/\)/g, "_");

  return fieldName;
}

export function isEmptyObject(obj: any) {
  for (const prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  if (JSON.stringify(obj) === JSON.stringify([])) return true;
  return JSON.stringify(obj) === JSON.stringify({});
}

export function isNotEmpty(value: any) {
  if (!value) return false;
  if (value == "") return false;
  if (value === false) return false;
  if (value === null) return false;
  if (value == undefined) return false;
  value = value + " "; // check for a bunch of whitespace
  if (value.replace(/^\s\s*/, "").replace(/\s\s*$/, "") == "") return false;
  return true;
}

export function isDate(date: number) {
  const myDate = new Date(date);
  return myDate instanceof Date;
  //return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
}

export function isNumeric(n: any) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export function prepareValueToNumeric(value: any) {
  if (isNotEmpty(value)) {
    if (isNumeric(value)) return Number(value);
    value = String(value).replace(",", ".");
    if (isNumeric(value)) return Number(value);
  }
  return null;
}

export function prepareValueToDatetime(value: any) {
  if (isNotEmpty(value)) {
    if (isDate(value)) return new Date(value);
  }
  return null;
}

export function prepareValueToDate(value: any) {
  if (isNotEmpty(value)) {
    if (isDate(value)) {
      const dateValue = new Date(value);
      dateValue.setHours(0);
      dateValue.setMinutes(0);
      dateValue.setSeconds(0);
      dateValue.setMilliseconds(0);
      return dateValue;
    }
  }
  return null;
}
