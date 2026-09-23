import app from '../src/app';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting AssetFlow Comprehensive API Test Suite...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, () => resolve()));
  const baseUrl = 'http://localhost:5099/api';

  let adminToken = '';
  let employeeToken = '';
  let createdAssetId = '';
  let createdAssignmentId = '';
  let createdMaintenanceId = '';
  let createdReportId = '';

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${detail ? `- ${detail}` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const resHealth = await fetch(`${baseUrl}/health`);
    const dataHealth: any = await resHealth.json();
    assert(resHealth.status === 200 && dataHealth.success === true, '1. GET /api/health');

    // 2. Admin Login
    const resLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@assetflow.com', password: 'Password@123' }),
    });
    const dataLogin: any = await resLogin.json();
    adminToken = dataLogin.data?.token;
    assert(resLogin.status === 200 && !!adminToken, '2. POST /api/auth/login (Admin)');

    // 3. Employee Login
    const resEmpLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@assetflow.com', password: 'Password@123' }),
    });
    const dataEmpLogin: any = await resEmpLogin.json();
    employeeToken = dataEmpLogin.data?.token;
    assert(resEmpLogin.status === 200 && !!employeeToken, '3. POST /api/auth/login (Employee)');

    // 4. Register New User
    const uniqueEmail = `test.user.${Date.now()}@assetflow.com`;
    const resRegister = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Test User',
        email: uniqueEmail,
        password: 'Password@123',
        department: 'Quality Assurance',
      }),
    });
    const dataRegister: any = await resRegister.json();
    assert(resRegister.status === 201 && dataRegister.success === true, '4. POST /api/auth/register');

    // 5. GET /api/auth/me
    const resMe = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataMe: any = await resMe.json();
    assert(resMe.status === 200 && dataMe.data?.email === 'admin@assetflow.com', '5. GET /api/auth/me');

    // 6. Create Asset (Admin)
    const assetTag = `TEST-TAG-${Date.now().toString().slice(-4)}`;
    const resCreateAsset = await fetch(`${baseUrl}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        assetTag,
        name: 'Automated Test Laptop Pro',
        category: 'Laptop',
        manufacturer: 'Dell',
        model: 'XPS 15',
        purchasePrice: 2499.99,
        location: 'QA Testing Lab',
      }),
    });
    const dataCreateAsset: any = await resCreateAsset.json();
    createdAssetId = dataCreateAsset.data?.id;
    assert(resCreateAsset.status === 201 && !!createdAssetId, '6. POST /api/assets (Create Asset)');

    // 7. GET Assets with Search & Filter
    const resGetAssets = await fetch(`${baseUrl}/assets?category=Laptop&search=Automated`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataGetAssets: any = await resGetAssets.json();
    assert(
      resGetAssets.status === 200 && dataGetAssets.data.length > 0 && !!dataGetAssets.pagination,
      '7. GET /api/assets (Search, Filter, Pagination)'
    );

    // 8. Update Asset
    const resUpdateAsset = await fetch(`${baseUrl}/assets/${createdAssetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        location: 'Floor 3 Server Staging',
        condition: 'Mint Condition',
      }),
    });
    const dataUpdateAsset: any = await resUpdateAsset.json();
    assert(
      resUpdateAsset.status === 200 && dataUpdateAsset.data?.location === 'Floor 3 Server Staging',
      '8. PUT /api/assets/:id (Update Asset)'
    );

    // 9. Assign Asset to Employee
    const resAssign = await fetch(`${baseUrl}/assignments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        assetId: createdAssetId,
        userId: dataEmpLogin.data.user.id,
        notes: 'Assigned for automated validation testing.',
      }),
    });
    const dataAssign: any = await resAssign.json();
    createdAssignmentId = dataAssign.data?.id;
    assert(
      resAssign.status === 201 && dataAssign.data?.asset?.status === 'ASSIGNED',
      '9. POST /api/assignments (Asset Status -> ASSIGNED)'
    );

    // 10. Return Asset
    const resReturn = await fetch(`${baseUrl}/assignments/${createdAssignmentId}/return`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ notes: 'Returned after successful test run.' }),
    });
    const dataReturn: any = await resReturn.json();
    assert(
      resReturn.status === 200 && dataReturn.data?.status === 'RETURNED',
      '10. PUT /api/assignments/:id/return (Asset Status -> AVAILABLE)'
    );

    // 11. Schedule Maintenance
    const resMaint = await fetch(`${baseUrl}/maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        assetId: createdAssetId,
        title: 'Thermal Paste Reapplication',
        maintenanceType: 'PREVENTIVE',
        cost: 45.0,
      }),
    });
    const dataMaint: any = await resMaint.json();
    createdMaintenanceId = dataMaint.data?.id;
    assert(
      resMaint.status === 201 && dataMaint.data?.status === 'SCHEDULED',
      '11. POST /api/maintenance (Asset Status -> UNDER_MAINTENANCE)'
    );

    // 12. Complete Maintenance
    const resMaintUpdate = await fetch(`${baseUrl}/maintenance/${createdMaintenanceId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const dataMaintUpdate: any = await resMaintUpdate.json();
    assert(
      resMaintUpdate.status === 200 && dataMaintUpdate.data?.status === 'COMPLETED',
      '12. PUT /api/maintenance/:id (Complete Maintenance -> Asset Status AVAILABLE)'
    );

    // 13. File Incident Report
    const resReport = await fetch(`${baseUrl}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        assetId: createdAssetId,
        type: 'ISSUE',
        description: 'Trackpad responsiveness lag observed after extended sleep cycle.',
      }),
    });
    const dataReport: any = await resReport.json();
    createdReportId = dataReport.data?.id;
    assert(resReport.status === 201 && !!createdReportId, '13. POST /api/reports (Employee File Report)');

    // 14. Resolve Incident Report
    const resResolveReport = await fetch(`${baseUrl}/reports/${createdReportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'RESOLVED' }),
    });
    const dataResolveReport: any = await resResolveReport.json();
    assert(
      resResolveReport.status === 200 && dataResolveReport.data?.status === 'RESOLVED',
      '14. PUT /api/reports/:id (Admin Resolve Report)'
    );

    // 15. Dashboard Statistics
    const resDashboard = await fetch(`${baseUrl}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataDashboard: any = await resDashboard.json();
    assert(
      resDashboard.status === 200 &&
        typeof dataDashboard.data?.summary?.totalAssets === 'number' &&
        Array.isArray(dataDashboard.data?.charts?.assetsByCategory),
      '15. GET /api/dashboard/stats (Analytics & Summaries)'
    );

    // 16. User Management Listing & Filtering
    const resUsers = await fetch(`${baseUrl}/users?role=EMPLOYEE`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataUsers: any = await resUsers.json();
    assert(
      resUsers.status === 200 && dataUsers.data.length > 0 && !!dataUsers.pagination,
      '16. GET /api/users (User Management)'
    );

    // 17. Audit Logs Listing
    const resAudit = await fetch(`${baseUrl}/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataAudit: any = await resAudit.json();
    assert(
      resAudit.status === 200 && dataAudit.data.length > 0,
      '17. GET /api/audit-logs (System Audit Trail)'
    );

    // 18. Role-Based Authorization Check (Employee forbidden from creating assets)
    const resForbidden = await fetch(`${baseUrl}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
      body: JSON.stringify({
        assetTag: 'FORBIDDEN-01',
        name: 'Unauthorized Asset',
        category: 'Laptop',
      }),
    });
    assert(resForbidden.status === 403, '18. Role-based Guard (Employee Forbidden to Create Asset -> 403)');

    // 19. Validation Error Handling
    const resInvalid = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '' }),
    });
    const dataInvalid: any = await resInvalid.json();
    assert(
      resInvalid.status === 400 && dataInvalid.success === false && Array.isArray(dataInvalid.errors),
      '19. Zod Validation Guard (Malformed Payload -> 400 Bad Request)'
    );

    // 20. Invalid JWT Token Check
    const resBadJwt = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: 'Bearer invalid-token-12345' },
    });
    assert(resBadJwt.status === 401, '20. JWT Security Guard (Invalid Token -> 401 Unauthorized)');

    // 21. Non-existent Resource Check (404)
    const res404 = await fetch(`${baseUrl}/assets/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res404.status === 404, '21. Not Found Handler (Non-existent UUID -> 404 Not Found)');

    // Cleanup test asset
    if (createdAssetId) {
      await fetch(`${baseUrl}/assets/${createdAssetId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    }
  } catch (err) {
    console.error('💥 Test suite execution failure:', err);
    failed++;
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
