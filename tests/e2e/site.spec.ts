import { test, expect } from "@playwright/test";
test("condition to fabric, comparison and product detail flow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "우리 아이에게 맞는 기준",
  );
  await page.getByRole("radio", { name: /아토피가 있어요/ }).check();
  await page.getByRole("button", { name: "우리 아이 원단 살펴보기" }).click();
  await expect(page).toHaveURL(/concern=atopic/);
  await expect(
    page.getByRole("heading", { name: /면부터 차근차근/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: "원단의 근거 읽기" }).click();
  await expect(page).toHaveURL(/fabrics\/cotton/);
  await page.getByRole("link", { name: "비교에 담기" }).click();
  await page.getByRole("checkbox", { name: "모달", exact: true }).check();
  await page.getByRole("button", { name: "비교하기" }).click();
  await expect(page.getByRole("table")).toContainText("모달");
  await page.goto("/products?q=하튜");
  await page.locator(".card a").first().click();
  await expect(
    page.getByRole("heading", { name: "공식 자료·판매처 확인" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("public SSR content, login gate and mobile overflow", async ({
  page,
  browser,
}) => {
  await page.goto("/login");
  await expect(
    page.getByRole("button", { name: "인증 링크 받기" }),
  ).toBeDisabled();
  await page.goto("/community/new");
  await expect(
    page.getByRole("heading", { name: "이야기를 나누려면 로그인해 주세요" }),
  ).toBeVisible();
  await page.goto("/");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto("/fabrics/cotton");
  await expect(
    staticPage.getByRole("heading", { name: "면", exact: true }),
  ).toBeVisible();
  await expect(
    staticPage.getByText(
      "면 100%만으로 아토피 개선·무자극·최고 순위 단정 금지",
      { exact: true },
    ),
  ).toBeVisible();
  await context.close();
});
