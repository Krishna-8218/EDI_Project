import app from './src/app';
import http from 'http';
import prisma from './src/lib/prisma';
import { Role } from '@prisma/client';

async function runHealthTests() {
  console.log('🧪 Starting AI Asset Health & Risk Prediction Integration Test Suite...\n');

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5098, () => resolve()));
  const baseUrl = 'http://localhost:5098/api';

  let adminToken = '';
  let employeeToken = '';
  let testAssetId = '';

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
    // 1. Admin Login
    const resAdminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@assetflow.com', password: 'Password@123' }),
    });
    const dataAdmin: any = await resAdminLogin.json();
    adminToken = dataAdmin.data?.token;
    assert(resAdminLogin.status === 200 && !!adminToken, '1. Admin Login (Role: ADMIN)');

    // 2. Employee Login
    const resEmpLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@assetflow.com', password: 'Password@123' }),
    });
    const dataEmp: any = await resEmpLogin.json();
    employeeToken = dataEmp.data?.token;
    assert(resEmpLogin.status === 200 && !!employeeToken, '2. Employee Login (Role: EMPLOYEE)');

    // 3. Get or Create a test Asset
    let asset = await prisma.asset.findFirst();
    if (!asset) {
      asset = await prisma.asset.create({
        data: {
          assetTag: `TEST-HEALTH-${Date.now()}`,
          name: 'Precision Test Workstation',
          category: 'Hardware',
          condition: 'Good',
          status: 'AVAILABLE',
          purchasePrice: 2400.0,
          purchaseDate: new Date('2023-01-15'),
          warrantyExpiry: new Date('2025-01-15'),
        },
      });
    }
    testAssetId = asset.id;
    assert(!!testAssetId, '3. Target Asset Identified', `Asset ID: ${testAssetId}`);

    // 4. Security Check: Unauthenticated Prediction Request
    const resUnauth = await fetch(`${baseUrl}/assets/${testAssetId}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert(resUnauth.status === 401, '4. Security: Unauthenticated POST /api/assets/:id/predict blocked (401)');

    // 5. Security Check: Non-Admin (Employee) Prediction Request
    const resForbiddenPredict = await fetch(`${baseUrl}/assets/${testAssetId}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`,
      },
    });
    assert(resForbiddenPredict.status === 403, '5. Security: Non-Admin POST /api/assets/:id/predict forbidden (403)');

    // 6. Security Check: Non-Admin (Employee) Health Overview Request
    const resForbiddenOverview = await fetch(`${baseUrl}/assets/health/overview`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert(resForbiddenOverview.status === 403, '6. Security: Non-Admin GET /api/assets/health/overview forbidden (403)');

    // 7. Security Check: Non-Admin (Employee) Health Details Request
    const resForbiddenHealth = await fetch(`${baseUrl}/assets/${testAssetId}/health`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${employeeToken}` },
    });
    assert(resForbiddenHealth.status === 403, '7. Security: Non-Admin GET /api/assets/:id/health forbidden (403)');

    // 8. Admin Run AI Health Prediction
    const resPredict = await fetch(`${baseUrl}/assets/${testAssetId}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    });
    const dataPredict: any = await resPredict.json();
    const p = dataPredict.data;

    const validStatus = ['HEALTHY', 'MAINTENANCE_REQUIRED', 'REPLACE_SOON'].includes(p?.status);
    const validRisk = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(p?.riskLevel);
    const validScore = typeof p?.healthScore === 'number' && p.healthScore >= 0 && p.healthScore <= 100;
    const hasProbabilities = p?.probabilities && typeof p.probabilities.HEALTHY === 'number';
    const hasFactors = Array.isArray(p?.factors) && p.factors.length > 0;
    const hasRecommendations = Array.isArray(p?.recommendations) && p.recommendations.length > 0;

    assert(
      resPredict.status === 200 && validStatus && validRisk && validScore && hasProbabilities && hasFactors && hasRecommendations,
      '8. Admin POST /api/assets/:id/predict - Returns calibrated probabilities, score & factors',
      `Score: ${p?.healthScore}, Status: ${p?.status}, Risk: ${p?.riskLevel}`
    );

    // 9. Admin GET /api/assets/:id/health
    const resGetHealth = await fetch(`${baseUrl}/assets/${testAssetId}/health`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataGetHealth: any = await resGetHealth.json();
    assert(
      resGetHealth.status === 200 && dataGetHealth.data?.id === p?.id,
      '9. Admin GET /api/assets/:id/health - Retrieves latest persisted prediction'
    );

    // 10. Admin GET /api/assets/:id/health/history
    const resHistory = await fetch(`${baseUrl}/assets/${testAssetId}/health/history`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataHistory: any = await resHistory.json();
    assert(
      resHistory.status === 200 && Array.isArray(dataHistory.data) && dataHistory.data.length >= 1,
      '10. Admin GET /api/assets/:id/health/history - Retrieves prediction history points'
    );

    // 11. Admin GET /api/assets/health/overview (Verifying route precedence before /:id)
    const resOverview = await fetch(`${baseUrl}/assets/health/overview`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const dataOverview: any = await resOverview.json();
    const ov = dataOverview.data;
    assert(
      resOverview.status === 200 &&
        typeof ov?.avgHealthScore === 'number' &&
        typeof ov?.statusCounts?.HEALTHY === 'number' &&
        typeof ov?.riskCounts?.LOW === 'number',
      '11. Admin GET /api/assets/health/overview - Precedes /:id route and aggregates fleet health',
      `Avg Score: ${ov?.avgHealthScore}, Analyzed: ${ov?.analyzedAssets}/${ov?.totalAssets}`
    );

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n==================================================`);
    console.log(`📊 AI Prediction Test Suite Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runHealthTests();
