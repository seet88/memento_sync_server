import { DatabaseField } from "../../../service/database/databaseField";

describe("isEmpty", () => {
  it("should return false if not empty", () => {
    const field = new DatabaseField("Some Machine name");

    expect(field.isEmpty()).toBe(false);
  });

  it("should return true if empty", () => {
    const field = new DatabaseField(null);

    expect(field.isEmpty()).toBe(true);
  });
});
