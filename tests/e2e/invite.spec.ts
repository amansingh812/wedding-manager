import { expect, test } from "@playwright/test";

const SHARMA = "/invite/sharma-parivar-9k4m2x";
const OFFICE = "/invite/office-tech-team-c3n8vr";
const shots = process.env.E2E_SCREENSHOTS; // folder to save walkthrough screenshots

async function shot(page: import("@playwright/test").Page, name: string) {
  if (shots) await page.screenshot({ path: `${shots}/${name}.png`, fullPage: true });
}

test.describe("guest invitation", () => {
  test("full journey: doors → welcome → ceremonies → RSVP → thank you → return visit", async ({ page }) => {
    await page.goto(SHARMA);
    await expect(page.getByText("A warm invitation for")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dr. R.K. Sharma & Family" })).toBeVisible();
    await shot(page, "1-sealed");

    await page.getByRole("button", { name: "Open your invitation" }).click();
    // Doors clip plays (or the safety timer fires), then the welcome card shows.
    await expect(page.getByRole("button", { name: "See your ceremonies" })).toBeVisible({ timeout: 15_000 });
    await page.waitForTimeout(1200);
    await shot(page, "2-welcome");

    await page.getByRole("button", { name: "See your ceremonies" }).click();
    await expect(page.getByRole("heading", { name: "Your ceremonies" })).toBeVisible();

    // Sharma family is invited to 4 ceremonies, not Tilak or Baraat.
    const cards = page.locator("ul > li");
    await expect(cards).toHaveCount(4);
    await expect(page.getByRole("heading", { name: /Tilak/ })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: /Baraat/ })).toHaveCount(0);
    await shot(page, "3-ceremonies");

    // Submitting without answers shows a friendly error.
    await page.getByRole("button", { name: "Send RSVP" }).click();
    await expect(page.locator("#rsvp-error")).toContainText("Please choose for");

    const fieldsets = page.locator("fieldset");
    await fieldsets.nth(0).getByRole("button", { name: "Will attend" }).click();
    await fieldsets.nth(1).getByRole("button", { name: "Will attend" }).click();
    await fieldsets.nth(2).getByRole("button", { name: "Will attend" }).click();
    await fieldsets.nth(3).getByRole("button", { name: "Can't make it" }).click();

    // Headcount can't pass the household limit of 4.
    const more = fieldsets.nth(2).getByRole("button", { name: /More: People coming/ });
    for (let i = 0; i < 5; i++) if (await more.isEnabled()) await more.click();
    await expect(fieldsets.nth(2)).toContainText("4 / 4");

    await page.getByRole("button", { name: "More: Vegetarian meals" }).click();
    await page.getByLabel(/A blessing for the couple/).fill("Sukhi dampatya jiwan ko shubhakamana!");
    await shot(page, "4-rsvp-filled");

    await page.getByRole("button", { name: "Send RSVP" }).click();
    await expect(page.getByRole("heading", { name: /celebrate with you/ })).toBeVisible();
    await expect(page.getByText("Can't make it")).toBeVisible();
    await shot(page, "5-thanks");

    // Coming back: no doors, answers kept.
    await page.reload();
    await expect(page.getByRole("heading", { name: "Your ceremonies" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Update RSVP" })).toBeVisible();
    await expect(fieldsets.nth(3).getByRole("button", { name: "Can't make it" })).toHaveAttribute("aria-pressed", "true");
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
