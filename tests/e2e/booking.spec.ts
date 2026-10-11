import { expect, test } from "@playwright/test";

test("visitor books an open trip and sees a booking code", async ({ page }) => {
  await page.goto("/");

  // Ambil kartu open trip pertama yang masih punya jadwal (tombol Book aktif dan ada badge slot).
  const card = page
    .locator("#trips article")
    .filter({ hasText: /slot/ })
    .filter({ has: page.locator("button:enabled") })
    .first();
  const tripName = (await card.getByRole("heading", { level: 3 }).textContent())!;
  await card.getByRole("button").click();

  const form = page.locator("#booking form");
  await expect(form.getByLabel("Trip")).toHaveValue(/.+/);
  await expect(form.getByLabel("Trip").locator("option:checked")).toContainText(tripName);

  await form.getByLabel("Tanggal keberangkatan").selectOption({ index: 1 });
  await form.getByLabel("Jumlah peserta").fill("1");
  await form.getByLabel("Nama lengkap").fill("Peserta E2E");
  await form.getByLabel("Email").fill(`e2e+${Date.now()}@example.com`);
  await form.getByLabel("Nomor WhatsApp").fill("081234567890");
  await form.getByRole("button", { name: "Kirim permintaan booking" }).click();

  await expect(page.getByRole("status").filter({ hasText: "Permintaan terkirim" })).toBeVisible();
  await expect(page.getByText(/^TR-[A-HJKMNP-Z2-9]{5}$/)).toBeVisible();
});
