import { test, expect } from '@playwright/test';

test('TC01 Login สำเร็จ', async ({ page }) => {

  // 1. เปิดหน้า Login
  await page.goto('/');

  // 2. กรอกหมายเลขโทรศัพท์
  await page
    .getByLabel('หมายเลขโทรศัพท์มือถือ')
    .fill('0800000000');

  // 3. กรอกรหัสผ่าน
  await page
    .getByPlaceholder('อย่างน้อย 8 ตัวอักษร')
    .fill('uCrwVaBW39o_0G0Q5QwAVrqr');

  // 4. กดปุ่มเข้าสู่ระบบ
  await page
    .getByRole('button', { name: 'เข้าสู่ระบบ' })
    .click();

  // 5. ตรวจสอบว่า Login สำเร็จ
  await expect(
    page.getByText('ยินดีต้อนรับ')
  ).toBeVisible();

});