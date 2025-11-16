import React from "react";
import { describe, it, expect } from "vitest";

describe("react import", () => {
  it("loads", () => {
    expect(typeof React).toBe("object");
  });
});