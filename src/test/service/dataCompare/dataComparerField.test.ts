import { DatabaseField } from "../../../service/database/databaseField";
import { DataComparerField } from "../../../service/dataCompare/dataComparerField";
import { MementoField } from "../../../service/memento/mementoField";

const sampleObj = {
  memento: {
    name: "Nazwa",
    type: "ft_string",
    value: "SomeMementoValue",
  },
  database: {
    value: "SomeDatabaseValue",
    type: undefined,
    size: undefined,
    name: undefined,
  },
  templateField: {
    ref: 505,
    sheetFieldName: "Nazwa",
    mementoFieldKey: "nazwa",
    mssqlFieldName: "Nazwa",
    typeField: "varchar(500)",
    mssqlFieldLength: 500,
    mssqlUniqueField: true,
    sheetName: "SomeSheetName",
    keyId: "SomeKeyId",
    active: true,
    mssqlTableName: "SomeDbTableName",
    sheetID: "SomeSheetID",
  },
  mode: 1,
  isDbValueNewerThenMemento: false,
};

// const mementoField = new MementoField(
//   sampleObj.memento.name,
//   sampleObj.memento.type,
//   sampleObj.memento.value
// );

// const databaseField = new DatabaseField(sampleObj.database.value);

describe("checkIfBothValueIsEmpty", () => {
  test("should return true if both memento/db obj value is empty", () => {
    const dcf = new DataComparerField();
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      ""
    );
    const databaseField = new DatabaseField("");

    const result = dcf.checkIfBothValueIsEmpty(databaseField, mementoField);

    expect(result).toBe(true);
  });

  test("should return false if one or more memento/db obj value is not empty", () => {
    const dcf = new DataComparerField();
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      "SomeMementoValue"
    );
    const databaseField = new DatabaseField("SomeDatabaseValue");

    const result = dcf.checkIfBothValueIsEmpty(databaseField, mementoField);

    expect(result).toBe(false);
  });
});

describe("checkIfOneValueIsEmptyAndSecendNot", () => {
  test("should return true if one of memento/db obj value is empty and secend not", () => {
    const dcf = new DataComparerField();
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      "SomeText"
    );
    const databaseField = new DatabaseField("");

    const result = dcf.checkIfBothValueIsEmpty(databaseField, mementoField);

    expect(result).toBe(false);
  });

  test("should return false if one memento/db obj value is not empty", () => {
    const dcf = new DataComparerField();
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      "SomeMementoValue"
    );
    const databaseField = new DatabaseField("SomeDatabaseValue");

    const result = dcf.checkIfBothValueIsEmpty(databaseField, mementoField);

    expect(result).toBe(false);
  });
});

describe("checkIfArrayIsDiff", () => {
  test("should return true if values is diffrent", () => {
    const dcf = new DataComparerField();
    const mementoValues = ["value1", "value2", "Value3"];
    const dbValues = ["value1", "value6"].join(",");
    const databaseField = new DatabaseField(dbValues);

    const result = dcf.checkIfArrayIsDiff(databaseField, mementoValues);

    expect(result).toBe(true);
  });

  test("should return false if values is same", () => {
    const dcf = new DataComparerField();
    const mementoValues = ["value1", "value2", "Value3"];
    const dbValues = ["value1", "value2", "Value3"].join(",");
    const databaseField = new DatabaseField(dbValues);

    const result = dcf.checkIfArrayIsDiff(databaseField, mementoValues);

    expect(result).toBe(false);
  });

  test("should return false if values is same but with diffrent order", () => {
    const dcf = new DataComparerField();
    const mementoValues = ["value1", "value2", "Value3"];
    const dbValues = ["value1", "Value3", "value2"].join(",");
    const databaseField = new DatabaseField(dbValues);

    const result = dcf.checkIfArrayIsDiff(databaseField, mementoValues);

    expect(result).toBe(false);
  });
});

describe("checkIfDateDiffIsGreaterThan", () => {
  test("should return true if diff between two dates is greater then diffInMinutes value", () => {
    const dcf = new DataComparerField();
    const someJsonTime1 = "2018-07-26T12:16:04.000Z";
    const date1 = new Date(someJsonTime1);
    const someJsonTime2 = "2018-07-26T12:56:03.000Z";
    const date2 = new Date(someJsonTime2);
    const diffInMinutes = 20;

    const result = dcf.checkIfDateDiffIsGreaterThan(
      date1,
      date2,
      diffInMinutes
    );

    expect(result).toBe(true);
  });

  test("should return false if diff between two dates is lower then diffInMinutes value", () => {
    const dcf = new DataComparerField();
    const someJsonTime1 = "2018-07-26T12:46:04.000Z";
    const date1 = new Date(someJsonTime1);
    const someJsonTime2 = "2018-07-26T12:56:03.000Z";
    const date2 = new Date(someJsonTime2);
    const diffInMinutes = 20;

    const result = dcf.checkIfDateDiffIsGreaterThan(
      date1,
      date2,
      diffInMinutes
    );

    expect(result).toBe(false);
  });
});

describe("checkIfPrimitiveValuesIsDiff", () => {
  test("should return false if both value is same", () => {
    const dcf = new DataComparerField();
    const someValue = "SomeSameValue";
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      someValue
    );
    const databaseField = new DatabaseField(someValue);
    const field = {
      memento: mementoField,
      database: databaseField,
      templateField: sampleObj.templateField,
      mode: sampleObj.mode,
      isDbValueNewerThenMemento: sampleObj.isDbValueNewerThenMemento,
    };

    const result = dcf.checkIfPrimitiveValuesIsDiff(field);

    expect(result).toBe(false);
  });

  test("should return true if values is different", () => {
    const dcf = new DataComparerField();
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      "SomeMementoValue"
    );
    const databaseField = new DatabaseField("someDbValue");
    const field = {
      memento: mementoField,
      database: databaseField,
      templateField: sampleObj.templateField,
      mode: sampleObj.mode,
      isDbValueNewerThenMemento: sampleObj.isDbValueNewerThenMemento,
    };

    const result = dcf.checkIfPrimitiveValuesIsDiff(field);

    expect(result).toBe(true);
  });
});

describe("getValuesDiff", () => {
  test(`should return object with isEmpty prop if value has no difference 
  and dbValue is older`, () => {
    const dcf = new DataComparerField();
    const someValue = "SomeSameValue";
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      someValue
    );
    const databaseField = new DatabaseField(someValue);
    const field = {
      memento: mementoField,
      database: databaseField,
      templateField: sampleObj.templateField,
      mode: sampleObj.mode,
      isDbValueNewerThenMemento: sampleObj.isDbValueNewerThenMemento,
    };

    const result = dcf.getValuesDiff(field);
    const expectObj = {
      memento: {},
      database: {},
      isEmpty: true,
    };

    expect(result).toEqual(expectObj);
  });

  test(`should return diff object(database) if values string is diffrent
  and dbValue is older`, () => {
    const dcf = new DataComparerField();
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      "someMementoValue"
    );
    const databaseField = new DatabaseField("someDatabaseValue");
    const field = {
      memento: mementoField,
      database: databaseField,
      templateField: sampleObj.templateField,
      mode: sampleObj.mode,
      isDbValueNewerThenMemento: sampleObj.isDbValueNewerThenMemento,
    };

    const result = dcf.getValuesDiff(field);
    const expectObj = {
      memento: {},
      database: new DatabaseField(
        "someMementoValue",
        sampleObj.templateField.typeField,
        sampleObj.templateField.mssqlFieldLength,
        sampleObj.templateField.mssqlFieldName
      ),
      isEmpty: false,
    };

    expect(result).toEqual(expectObj);
  });

  test("should return diff object if values dateTime is diffrent more then passed time", () => {
    const dcf = new DataComparerField();
    const template = {
      ref: 2,
      sheetFieldName: "SomeFieldName",
      mssqlFieldName: "SomeFieldName",
      typeField: "datetime",
      mssqlFieldLength: 0,
      mssqlUniqueField: false,
      sheetName: "SomeSheetName",
      keyId: "someKeyId",
      active: true,
      mssqlTableName: "someTableName",
      sheetID: "someSheetId",
      mementoFieldKey: "SomeFieldName",
    };
    const someJsonTime1 = "2018-07-26T19:16:04.000Z";
    const dateMementoValue = new Date(someJsonTime1);
    const someJsonTime2 = "2018-07-26T10:16:04.000Z";
    const dateDatabaseValue = new Date(someJsonTime2);
    const mementoField = new MementoField(
      sampleObj.memento.name,
      sampleObj.memento.type,
      someJsonTime1
    );
    const databaseField = new DatabaseField(dateDatabaseValue);
    const field = {
      memento: mementoField,
      database: databaseField,
      templateField: template,
      mode: sampleObj.mode,
      isDbValueNewerThenMemento: sampleObj.isDbValueNewerThenMemento,
    };

    const result = dcf.getValuesDiff(field);
    const expectObj = {
      memento: {},
      database: new DatabaseField(
        dateMementoValue,
        template.typeField,
        template.mssqlFieldLength,
        template.mssqlFieldName
      ),
      isEmpty: false,
    };

    expect(result).toEqual(expectObj);
  });

  //   test("should return diff object if values date is diffrent more then passed time", () => {
  //     const dcf = new DataComparerField();
  //     const template = {
  //       ref: 2,
  //       sheetFieldName: "SomeFieldName",
  //       mssqlFieldName: "SomeFieldName",
  //       typeField: "date",
  //       mssqlFieldLength: 0,
  //       mssqlUniqueField: false,
  //       sheetName: "SomeSheetName",
  //       keyId: "someKeyId",
  //       active: true,
  //       mssqlTableName: "someTableName",
  //       sheetID: "someSheetId",
  //       mementoFieldKey: "SomeFieldName",
  //     };
  //     const someJsonTime1 = "2018-07-28T19:16:04.000Z";
  //     const dateMementoValue = new Date(someJsonTime1);
  //     const someJsonTime2 = "2018-07-26T10:16:04.000Z";
  //     const dateDatabaseValue = new Date(someJsonTime2);
  //     const mementoField = new MementoField(
  //       sampleObj.memento.name,
  //       sampleObj.memento.type,
  //       someJsonTime1
  //     );
  //     const databaseField = new DatabaseField(dateDatabaseValue);
  //     const field = {
  //       memento: mementoField,
  //       database: databaseField,
  //       templateField: template,
  //       mode: sampleObj.mode,
  //       isDbValueNewerThenMemento: sampleObj.isDbValueNewerThenMemento,
  //     };

  //     const result = dcf.getValuesDiff(field);
  //     const resetedMementoDate = new Date(someJsonTime1.slice(0, 10));
  //     const expectObj = {
  //       memento: {},
  //       database: new DatabaseField(
  //         resetedMementoDate,
  //         template.typeField,
  //         template.mssqlFieldLength,
  //         template.mssqlFieldName
  //       ),
  //       isEmpty: false,
  //     };

  //     expect(result).toEqual(expectObj);
  //   });
});
