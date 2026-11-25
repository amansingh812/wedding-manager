import { expect, test } from "@playwright/test";

const SHARMA = "/invite/sharma-parivar-9k4m2x";
const OFFICE = "/invite/office-tech-team-c3n8vr";
const shots = process.env.E2E_SCREENSHOTS; // folder to save walkthrough screenshots

async function shot(page: import("@playwright/test").Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}

test.describe("guest invitation", () => {
  test("full journey: doors → Ganesh → invitation card → ceremonies (no RSVP)", async ({ page }) => {
    await page.goto(SHARMA);
    await expect(page.getByText("A warm invitation for")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dr. R.K. Sharma & Family" })).toBeVisible();
    await shot(page, "1-sealed");

    await page.getByRole("button", { name: "Open your invitation" }).click();
    // Doors open onto Lord Ganesh…
    await expect(page.getByAltText(/Lord Ganesh inside the temple courtyard/)).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1800);
    await shot(page, "2a-ganesh-reveal");
    // …then the invitation card rises over him.
    await expect(page.getByRole("button", { name: "See your ceremonies" })).toBeVisible({ timeout: 8_000 });
    await page.waitForTimeout(1600);
    await shot(page, "2b-welcome-card");

    await page.getByRole("button", { name: "See your ceremonies" }).click();
    await expect(page.getByRole("heading", { name: "Your ceremonies" })).toBeVisible();

    // Sharma family is invited to 4 ceremonies, not Tilak or Baraat.
    const cards = page.locator("ul > li");
    await expect(cards).toHaveCount(4);
    await expect(page.getByRole("heading", { name: /Tilak/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Baraat/ })).toHaveCount(0);
    await shot(page, "3-ceremonies");

    // RSVP is switched off for now (site.rsvpEnabled = false).
    await expect(page.getByRole("button", { name: "Send RSVP" })).toHaveCount(0);
    await expect(page.getByText("Will you join us?")).toHaveCount(0);
    await page.getByText(/वक्रतुण्ड महाकाय/).scrollIntoViewIfNeeded();
    await shot(page, "7-closing-blessing");
  });

  test("first visit has no skip link; replay button brings the doors back", async ({ page }) => {
    await page.goto("/invite/jha-family-p7q2wd");
    await expect(page.getByText("A warm invitation for")).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip to my ceremonies" })).toHaveCount(0);
    await page.getByRole("button", { name: "Open your invitation" }).click();
    await page.getByRole("button", { name: "See your ceremonies" }).click({ timeout: 15_000 });
    await page.getByRole("button", { name: "Watch the invitation again" }).click();
    await expect(page.getByText("A warm invitation for")).toBeVisible();
  });

  test("office colleagues only see the Reception", async ({ page }) => {
    await page.goto(OFFICE);
    await page.getByRole("button", { name: "Open your invitation" }).click();
    await page.getByRole("button", { name: "See your ceremonies" }).click({ timeout: 15_000 });
    await expect(page.locator("ul > li")).toHaveCount(1);
    await expect(page.locator("ul > li h2")).toContainText("Reception");
  });

  test("an unknown link shows the friendly not-found page", async ({ page }) => {
    const res = await page.goto("/invite/someone-elses-name");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /isn.t valid/ })).toBeVisible();
    await shot(page, "6-invalid-link");
  });

  test("link preview has the household name", async ({ request }) => {
    const html = await (await request.get(SHARMA, { headers: { "user-agent": "WhatsApp/2.23" } })).text();
    expect(html).toContain('property="og:title" content="Special invitation for Dr. R.K. Sharma &amp; Family"');
    expect(html).toContain("/images/og.jpg");
  });

  test("calendar file lists only invited ceremonies", async ({ request }) => {
    const ics = await (await request.get(`${OFFICE}/calendar.ics`)).text();
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(1);
    expect(ics).toContain("Reception");
  });
});
