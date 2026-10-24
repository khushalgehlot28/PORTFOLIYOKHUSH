export function validateTaskInput(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Request body must be a JSON object." };
  }

  const updates = {};
  const hasTitle = Object.hasOwn(body, "title");
  const hasCompleted = Object.hasOwn(body, "completed");

  if (hasTitle) {
    if (typeof body.title !== "string") {
      return { error: "Title must be a string." };
    }

    const title = body.title.trim();
    if (title.length < 1 || title.length > 120) {
      return { error: "Title must be between 1 and 120 characters." };
    }
    updates.title = title;
  }

  if (hasCompleted) {
    if (typeof body.completed !== "boolean") {
      return { error: "Completed must be a boolean." };
    }
    updates.completed = body.completed;
  }

  if ((!partial && !hasTitle) || (partial && !hasTitle && !hasCompleted)) {
    return {
      error: partial
        ? "Provide a title or completed value to update."
        : "Title is required.",
    };
  }

  const unexpectedKeys = Object.keys(body).filter(
    (key) => key !== "title" && key !== "completed",
  );
  if (unexpectedKeys.length > 0) {
    return { error: "Only title and completed fields are allowed." };
  }

  return { value: updates };
}
