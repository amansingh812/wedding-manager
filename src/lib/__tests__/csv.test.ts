import { describe, expect, it } from "vitest";
import { toCsv } from "../csv";

describe("toCsv", () => {
  it("quotes commas, quotes and newlines; keeps Devanagari", () => {
    const out = toCsv(["Name", "Note"], [["Jha, Family", 'say "hi"'], ["राम", "a\nb"]]);
    expect(out).toBe('﻿Name,Note\r\n"Jha, Family","say ""hi"""\r\nराम,"a\nb"\r\n');
  });
  it("neutralises spreadsheet formulas", () => {
    expect(toCsv(["x"], [["=HYPERLINK(1)"], ["+1"], [-5]])).toBe("﻿x\r\n'=HYPERLINK(1)\r\n'+1\r\n'-5\r\n");
  });
});
