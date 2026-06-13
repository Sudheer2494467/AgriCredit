# AgriLedger Settlement System - End-to-End Testing Scenarios

## Pre-Testing Setup

### Backend Requirements

- Spring Boot application running on http://localhost:8080
- MySQL database initialized with schema
- Test data loaded (farmers, credits, products)
- CORS enabled for frontend requests

### Frontend Requirements

- Angular application running on http://localhost:4200
- Backend API accessible
- Browser: Chrome, Firefox, or Safari (latest versions)

### Test Users

- **Admin**: username: `admin`, password: `admin123`
- **Farmer 1**: username: `farmer1`, password: `farmer123`
- **Farmer 2**: username: `farmer2`, password: `farmer123`

---

## Test Scenario 1: Login & Navigation

### Objective

Verify that users must login and are routed to appropriate dashboards.

### Steps

1. Open http://localhost:4200
2. ✅ **Expected**: Redirected to /login page
3. Login as admin (admin/admin123)
4. ✅ **Expected**: Navigated to /dashboard (admin dashboard)
5. Verify sidebar shows "ADMIN" role
6. Navigate to /settlement
7. ✅ **Expected**: Settlement creation form loads
8. Logout
9. Open http://localhost:4200 in new tab
10. ✅ **Expected**: Redirected to /login again (no session bleeding)

### Pass Criteria

- ✅ Unauthenticated users redirected to login
- ✅ Admin routed to admin dashboard after login
- ✅ Farmer routed to farmer dashboard after login
- ✅ Logout clears session properly

---

## Test Scenario 2: Settlement - Full Settlement

### Objective

Test settlement when crop value exceeds farmer debt (farmer gets paid).

### Initial Conditions

- Farmer "Rajesh Kumar" with outstanding credit: ₹5,000
- No pending approval vouchers
- Store settings: productInterestRate = 2%, cashInterestRate = 2%

### Steps

1. Login as admin
2. Navigate to /settlement
3. Click on crop purchase form
4. In "Search & Select Farmer" field:
   - Type "Rajesh" or "Kumar"
5. ✅ **Expected**:
   - Dropdown shows "Rajesh Kumar (Village Name)"
   - NOT "undefined"
6. Click on farmer option
7. ✅ **Expected**: Farmer selection shows in input field
8. Fill form:
   - Crop Name: "Cotton"
   - Quantity: 100
   - Price/Kg: ₹60
9. Click "Create Settlement"
10. ✅ **Expected**: Receipt shows:
    - Crop Value: ₹6,000
    - Credit Deducted: ₹5,000
    - Interest Deducted: ₹XX (approximately ₹100 for 2 months × 2%)
    - Net Payout: ₹~870 (6000 - 5000 - 100)
    - Remaining Balance: ₹0
    - Settlement Number: ST-XXXXXXXXX (unique)
11. Click "Print Receipt"
12. ✅ **Expected**: Browser print dialog opens

### Data Verification (via API or Database)

- ✅ Settlement record created
- ✅ CropPurchase linked to settlement
- ✅ Credit voucher marked as SETTLED
- ✅ Farmer balance updated to ₹0
- ✅ InterestRecord created with correct amount

### Pass Criteria

- ✅ Settlement created successfully
- ✅ Dropdown displays correctly (no "undefined")
- ✅ Receipt shows accurate calculations
- ✅ Farmer balance updated immediately
- ✅ Navigation remains responsive

---

## Test Scenario 3: Settlement - Partial Settlement

### Objective

Test settlement when crop value is less than debt (farmer still owes).

### Initial Conditions

- Farmer "Priya Singh" with outstanding credit: ₹8,000
- Store interest rate: 2%

### Steps

1. Login as admin
2. Navigate to /settlement
3. Search and select "Priya Singh"
4. Fill form:
   - Crop Name: "Wheat"
   - Quantity: 50
   - Price/Kg: ₹20
5. Click "Create Settlement"
6. ✅ **Expected**: Receipt shows:
   - Crop Value: ₹1,000
   - Credit Deducted: ~₹750 (after interest)
   - Interest Deducted: ~₹250 (approximately)
   - Net Payout: ₹0 (farmer receives nothing)
   - Remaining Balance: ~₹7,000 (8000 - 1000 crop value + additional interest)
   - Settlement Number: ST-XXXXXXXXX (unique)

### Data Verification

- ✅ Settlement record created
- ✅ Farmer balance updated to ₹~7,000
- ✅ RemainingBalance captured in settlement record
- ✅ Credit voucher marked as SETTLED

### Pass Criteria

- ✅ Partial settlement handled correctly
- ✅ Remaining balance calculated and saved
- ✅ Farmer not given payout (netPayout = 0)
- ✅ No negative balance condition

---

## Test Scenario 4: Multiple Settlements for Same Farmer

### Objective

Verify farmer can settle multiple times and history is maintained.

### Initial Conditions

- Farmer "Hari Patel" with outstanding credit: ₹6,000

### Steps

#### Settlement 1

1. Login as admin
2. Navigate to /settlement
3. Search and select "Hari Patel"
4. Fill form:
   - Crop Name: "Soybean"
   - Quantity: 60
   - Price/Kg: ₹40
5. Click "Create Settlement"
6. ✅ **Expected**:
   - Settlement No: ST-ABC123 (example)
   - Remaining Balance: ~₹2,000
7. Note the settlement number

#### Settlement 2 (Same Farmer)

8. Settlement form clears automatically
9. Search and select "Hari Patel" again
10. Fill form:
    - Crop Name: "Groundnut"
    - Quantity: 80
    - Price/Kg: ₹25
11. Click "Create Settlement"
12. ✅ **Expected**:
    - Settlement No: ST-XYZ789 (DIFFERENT from first)
    - Different settlement number
    - Only unsettled credit vouchers used
13. Form clears

### Verification Steps

14. Login as farmer "Hari Patel"
15. Navigate to /farmer-dashboard
16. Scroll to "Settlement History"
17. ✅ **Expected**: Both settlements visible
    - ST-ABC123 first (or ST-XYZ789 depending on order)
    - ST-XYZ789 second (newest first)
18. Scroll to "Transaction History"
19. ✅ **Expected**: Settlement transactions show:
    - First settlement details
    - Second settlement details
    - Proper description format
20. Verify "Current Balance" shows final amount

### Pass Criteria

- ✅ Both settlements created successfully
- ✅ Settlement numbers are unique
- ✅ Each settlement shows in farmer dashboard
- ✅ Transaction history shows both
- ✅ Farmer balance reflects both settlements

---

## Test Scenario 5: Farmer Dashboard Settlement View

### Objective

Verify farmer can see all settlement details in their dashboard.

### Steps

1. Login as farmer with some settlements
2. Navigate to /farmer-dashboard (automatic or via link)
3. Verify profile card shows:
   - ✅ Current Balance
   - ✅ Farmer name
   - ✅ Village, Phone, Land
4. Check stats row:
   - ✅ Total Credit shows correct amount
   - ✅ Settlements count correct
   - ✅ Pending Approvals count
5. Scroll to "Settlement History" section
6. ✅ **Expected**: Each settlement shows:
   - Settlement Number (ST-XXXXXXXXX)
   - Settlement Date (formatted)
   - Crop Details: "Cotton - 100Kg @ ₹50/Kg"
   - Crop Value: ₹5,000
   - Credit Deducted: ₹4,000
   - Interest: ₹200
   - Payout: ₹800
   - Remaining Balance (if > 0): ₹1,000
7. Scroll to "Transaction History" section
8. ✅ **Expected**: Settlements show as transactions:
   - Type: "SETTLEMENT"
   - Amount: Credit deducted amount
   - Description: "Settlement - Cotton (Crop Value: ₹5000, Payout: ₹800)"

### Pass Criteria

- ✅ All settlement data displays correctly
- ✅ Currency formatting shows ₹ symbol
- ✅ Decimal values show 2 places
- ✅ Transaction descriptions are clear
- ✅ No "undefined" values shown

---

## Test Scenario 6: Admin Viewing Farmer Details

### Objective

Admin can view specific farmer's settlement history.

### Steps

1. Login as admin
2. Navigate to /farmers
3. Click on "Hari Patel" farmer
4. ✅ **Expected**: Redirected to /farmer/3 (farmer detail page)
5. Verify settlement history loads:
   - ✅ All of Hari Patel's settlements visible
   - ✅ Each settlement shows detailed breakdown
   - ✅ Current balance shows farmer's latest amount
6. Click "Back to Dashboard"
7. ✅ **Expected**: Return to admin dashboard

### Pass Criteria

- ✅ Admin can view farmer settlement history
- ✅ Correct data loaded for selected farmer
- ✅ Navigation works properly

---

## Test Scenario 7: Form Validation

### Objective

Verify form validation prevents invalid submissions.

### Steps

1. Login as admin
2. Navigate to /settlement
3. Don't select farmer, fill else:
   - Crop: "Cotton"
   - Qty: 100
   - Price: 50
4. ✅ **Expected**: Submit button disabled (greyed out)
5. Don't enter crop name, select farmer, fill price:
6. ✅ **Expected**: Submit button still disabled
7. Select farmer, enter crop, but quantity = 0:
8. ✅ **Expected**: Submit button disabled
9. Select farmer, crop, qty=100, but price = 0:
10. ✅ **Expected**: Submit button disabled
11. Fill all fields correctly:
12. ✅ **Expected**: Submit button enabled

### Pass Criteria

- ✅ All validations working
- ✅ Button state changes correctly
- ✅ No surprise submissions

---

## Test Scenario 8: Error Handling

### Objective

Verify system handles errors gracefully.

### Steps

1. Login as admin
2. Navigate to /settlement
3. Enter farmer phone instead of searching dropdown
4. Fill settlement details
5. Try to submit
6. ✅ **Expected**: Error message shown (if invalid farmer ID)
7. Try valid settlement, but disable network
8. Click Submit
9. ✅ **Expected**: Loading indicator shows, then error message
10. Reconnect network, retry
11. ✅ **Expected**: Settlement submits successfully

### Pass Criteria

- ✅ Errors displayed clearly
- ✅ No silent failures
- ✅ Retry functionality works

---

## Test Scenario 9: Interest Calculation Verification

### Objective

Verify interest is calculated correctly based on voucher age.

### Prerequisites

- Create credit voucher "exactly 2 months ago"
- Store settings: 2% product interest, 2% cash interest

### Steps

1. Admin creates settlement for farmer:
   - Credit item: ₹1,000 (CASH)
   - Voucher created 2 months ago
   - Settlement crop value: ₹5,000
2. Check receipt:
3. ✅ **Expected**:
   - Interest ≈ ₹1,000 × 2% × 2 months / 100 = ₹40
   - (Allow ±₹5 for rounding differences)

### Pass Criteria

- ✅ Interest calculated correctly
- ✅ Month-based calculation accurate
- ✅ Formula: principal × rate × months / 100

---

## Test Scenario 10: Receipt Print & Download

### Objective

Verify settlement receipt can be printed.

### Steps

1. Create settlement as per Scenario 2
2. After receipt displays, click "Print Receipt"
3. ✅ **Expected**: Browser print dialog opens
4. In print dialog:
   - ✅ Settlement number visible
   - ✅ Crop details visible
   - ✅ Financial breakdown visible
   - ✅ Date/time shown
5. Print to PDF or cancel
6. ✅ **Expected**: Prints correctly formatted

### Pass Criteria

- ✅ Print dialog opens
- ✅ All receipt data included
- ✅ Formatting preserved

---

## Performance Testing Checklist

- ✅ Settlement creation completes within 2 seconds
- ✅ Farmer dashboard loads within 3 seconds
- ✅ Search autocomplete responds within 500ms
- ✅ No console errors or warnings
- ✅ Memory doesn't leak after multiple settlements
- ✅ Page remains responsive during submission

---

## Data Integrity Checklist

After running all tests, verify in database:

### Farmers Table

- ✅ Current balance updated
- ✅ No negative balances (unless intentionally allowed)

### CreditVouchers Table

- ✅ All settled vouchers have `isSettled = true`
- ✅ Status changed to SETTLED for all settled vouchers

### Settlements Table

- ✅ All settlements have unique `settlementNo`
- ✅ `settlementDate` populated correctly
- ✅ Credit deducted, interest, payout values logical
- ✅ Remaining balance ≥ 0
- ✅ Credit deducted ≤ original credit

### CropPurchases Table

- ✅ All have foreign key to settlement
- ✅ Total value = quantity × pricePerKg

### InterestRecords Table

- ✅ Recorded for each settlement
- ✅ Amount > 0 for old credits
- ✅ Amount ≥ 0 for new credits

### TransactionHistory View

- ✅ Settlements appear as entries
- ✅ Correct descriptions
- ✅ Accurate amounts

---

## Cleanup After Testing

1. Delete test settlements (optional, for fresh state):

   ```sql
   DELETE FROM settlements WHERE farmer_id IN (SELECT id FROM farmers WHERE name LIKE '%Test%');
   ```

2. Reset farmer balances (if needed):

   ```sql
   UPDATE farmers SET current_balance = 5000 WHERE name LIKE '%Test%';
   ```

3. Clear browser cache:
   - Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Select "All time"

---

## Rollback Instructions

If tests fail catastrophically:

1. Stop backend service
2. Restore database backup
3. Clear browser cache
4. Restart backend
5. Restart frontend
6. Run tests again

---

## Sign-Off

**Test Date**: ******\_\_\_******
**Tester Name**: ******\_\_\_******
**All Scenarios Passed**: ☐ Yes ☐ No ☐ Partial
**Issues Found**:

```
[List any issues discovered]
```

**Approved By**: ******\_\_\_******
**Sign-Off Date**: ******\_\_\_******

---

**Document Version**: 1.0
**Last Updated**: 2024
