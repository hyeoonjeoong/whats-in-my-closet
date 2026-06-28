import { test, expect } from "@playwright/test";

// 데모 모달 닫기 헬퍼
const dismissDemoModal = async (page: import("@playwright/test").Page) => {
  const exploreButton = page.getByRole("button", { name: "구경하기" });
  if (await exploreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await exploreButton.click();
  }
};

test.describe("Closet Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/closet");
    await dismissDemoModal(page);
  });

  // 옷장 페이지 로드 테스트
  test("should load closet page", async ({ page }) => {
    await expect(page).toHaveURL("/closet");
    // 필터바 또는 옷장 컨텐츠가 표시되는지 확인
    await expect(page.locator("main")).toBeVisible();
  });

  // 하단 네비게이션 표시 테스트
  test("should display bottom navigation", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  // 탭 네비게이션 테스트
  test("should navigate between tabs", async ({ page }) => {
    // 코디 탭으로 이동
    await page.getByRole("link", { name: /코디/ }).click();
    await expect(page).toHaveURL("/outfits");

    // 다시 옷장 탭으로 이동
    await page.getByRole("link", { name: /옷장/ }).click();
    await expect(page).toHaveURL("/closet");
  });

  // FAB 버튼 표시 테스트
  test("should display FAB button", async ({ page }) => {
    const fab = page.getByRole("button", { name: /옷 추가/ });
    await expect(fab).toBeVisible();
  });
});

test.describe("Demo Mode", () => {
  // 데모 모드에서 모달 표시 테스트
  test("should show demo welcome modal", async ({ page }) => {
    await page.goto("/closet");
    // 데모 모달이 표시되는지 확인
    await expect(page.getByText("데모 모드입니다")).toBeVisible();
    await expect(page.getByRole("button", { name: "구경하기" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "로그인", exact: true })
    ).toBeVisible();
  });

  // 구경하기 버튼 클릭 시 모달 닫힘 테스트
  test("should close modal when clicking explore button", async ({ page }) => {
    await page.goto("/closet");
    await page.getByRole("button", { name: "구경하기" }).click();
    await expect(page.getByText("데모 모드입니다")).not.toBeVisible();
  });
});
