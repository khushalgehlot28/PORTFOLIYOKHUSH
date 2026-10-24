import assert from "node:assert/strict";
import test from "node:test";
import { validateTaskInput } from "../src/utils/validateTask.js";

test("accepts a trimmed task title", () => {
  assert.deepEqual(validateTaskInput({ title: "  Plan the week  " }), {
    value: { title: "Plan the week" },
  });
});

test("rejects a missing or oversized title", () => {
  assert.equal(validateTaskInput({}).error, "Title is required.");
  assert.equal(validateTaskInput({ title: " " }).error, "Title must be between 1 and 120 characters.");
  assert.equal(
    validateTaskInput({ title: "x".repeat(121) }).error,
    "Title must be between 1 and 120 characters.",
  );
});

test("accepts a partial completion update", () => {
  assert.deepEqual(validateTaskInput({ completed: true }, { partial: true }), {
    value: { completed: true },
  });
});

test("rejects empty partial updates and unknown fields", () => {
  assert.equal(
    validateTaskInput({}, { partial: true }).error,
    "Provide a title or completed value to update.",
  );
  assert.equal(
    validateTaskInput({ title: "Task", owner: "someone" }).error,
    "Only title and completed fields are allowed.",
  );
});
