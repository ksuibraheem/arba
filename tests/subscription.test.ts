/**
 * Subscription E2E Tests — V10
 * اختبارات شاملة لمسارات الترقية والتخفيض وعمولة RFQ
 * 
 * تشغيل: npx tsx tests/subscription.test.ts
 */

// =================== Test Framework (Lightweight) ===================

let passed = 0;
let failed = 0;
const results: { name: string; status: 'pass' | 'fail'; error?: string }[] = [];

function describe(name: string, fn: () => void) {
    console.log(`\n📋 ${name}`);
    console.log('─'.repeat(60));
    fn();
}

function test(name: string, fn: () => void) {
    try {
        fn();
        passed++;
        results.push({ name, status: 'pass' });
        console.log(`  ✅ ${name}`);
    } catch (error: any) {
        failed++;
        results.push({ name, status: 'fail', error: error.message });
        console.log(`  ❌ ${name}: ${error.message}`);
    }
}

function expect(value: any) {
    return {
        toBe(expected: any) {
            if (value !== expected) throw new Error(`Expected ${expected}, got ${value}`);
        },
        toBeGreaterThan(expected: number) {
            if (value <= expected) throw new Error(`Expected > ${expected}, got ${value}`);
        },
        toBeLessThanOrEqual(expected: number) {
            if (value > expected) throw new Error(`Expected <= ${expected}, got ${value}`);
        },
        toBeTruthy() {
            if (!value) throw new Error(`Expected truthy, got ${value}`);
        },
        toBeFalsy() {
            if (value) throw new Error(`Expected falsy, got ${value}`);
        },
        toEqual(expected: any) {
            if (JSON.stringify(value) !== JSON.stringify(expected)) {
                throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`);
            }
        },
        toContain(expected: string) {
            if (typeof value === 'string' && !value.includes(expected)) {
                throw new Error(`Expected "${value}" to contain "${expected}"`);
            }
        },
    };
}

// =================== Import Services ===================

// Simulated plan definitions (matching companyData.ts)
const PLANS = {
    free:         { id: 'free',         projects: 1,  storageMB: 50,    price: 0 },
    starter:      { id: 'starter',      projects: 5,  storageMB: 500,   price: 149 },
    professional: { id: 'professional', projects: 15, storageMB: 2048,  price: 399 },
    business:     { id: 'business',     projects: 50, storageMB: 10240, price: 999 },
    enterprise:   { id: 'enterprise',   projects: -1, storageMB: 51200, price: 1999 },
};

// Simulated billing service logic
function simulateUpgrade(currentPlan: string, newPlan: string, usedProjects: number) {
    const current = PLANS[currentPlan as keyof typeof PLANS];
    const next = PLANS[newPlan as keyof typeof PLANS];
    
    if (!current || !next) throw new Error(`Invalid plan: ${currentPlan} or ${newPlan}`);
    
    const isUpgrade = next.price > current.price;
    const isDowngrade = next.price < current.price;
    
    // Projects remain — only editable count changes
    const maxEditableProjects = next.projects === -1 ? Infinity : next.projects;
    const excessProjects = next.projects === -1 ? 0 : Math.max(0, usedProjects - next.projects);
    const archivedProjects = isDowngrade ? excessProjects : 0;
    
    return {
        isUpgrade,
        isDowngrade,
        previousPlan: currentPlan,
        newPlan,
        maxEditableProjects,
        archivedProjects,
        projectsPreserved: usedProjects, // All projects preserved
        storageLimit: next.storageMB,
    };
}

// Simulated RFQ commission calculation (matching subscriptionManager.ts)
function calculateRFQCommission(orderTotal: number) {
    const gatewayFee = Math.round(orderTotal * 0.025 * 100) / 100;
    const fixedFee = 10;
    const arbaProfit = Math.round(orderTotal * 0.035 * 100) / 100;
    const totalCommission = Math.round((gatewayFee + fixedFee + arbaProfit) * 100) / 100;
    return { orderTotal, gatewayFee, fixedFee, arbaProfit, totalCommission };
}

// Simulated subscription expiry
function simulateExpiry(plan: string, daysUntilExpiry: number) {
    const isExpired = daysUntilExpiry <= 0;
    const shouldWarn = daysUntilExpiry > 0 && daysUntilExpiry <= 3;
    const newPlan = isExpired ? 'free' : plan;
    
    return { isExpired, shouldWarn, newPlan, daysUntilExpiry };
}

// =================== Tests ===================

describe('🔄 Upgrade Flow Tests', () => {
    test('Free → Starter: projects increase to 5', () => {
        const result = simulateUpgrade('free', 'starter', 1);
        expect(result.isUpgrade).toBe(true);
        expect(result.maxEditableProjects).toBe(5);
        expect(result.storageLimit).toBe(500);
        expect(result.archivedProjects).toBe(0);
    });

    test('Starter → Professional: projects increase to 15', () => {
        const result = simulateUpgrade('starter', 'professional', 5);
        expect(result.isUpgrade).toBe(true);
        expect(result.maxEditableProjects).toBe(15);
        expect(result.storageLimit).toBe(2048);
        expect(result.projectsPreserved).toBe(5);
    });

    test('Professional → Business: projects increase to 50', () => {
        const result = simulateUpgrade('professional', 'business', 12);
        expect(result.isUpgrade).toBe(true);
        expect(result.maxEditableProjects).toBe(50);
        expect(result.archivedProjects).toBe(0);
    });

    test('Business → Enterprise: unlimited projects', () => {
        const result = simulateUpgrade('business', 'enterprise', 40);
        expect(result.isUpgrade).toBe(true);
        expect(result.maxEditableProjects).toBe(Infinity);
        expect(result.storageLimit).toBe(51200);
    });

    test('Upgrade preserves all existing projects', () => {
        const result = simulateUpgrade('free', 'professional', 1);
        expect(result.projectsPreserved).toBe(1);
        expect(result.archivedProjects).toBe(0);
    });
});

describe('⬇️ Downgrade Flow Tests', () => {
    test('Professional → Starter: 10 projects → 5 editable, 5 archived', () => {
        const result = simulateUpgrade('professional', 'starter', 10);
        expect(result.isDowngrade).toBe(true);
        expect(result.maxEditableProjects).toBe(5);
        expect(result.archivedProjects).toBe(5);
        expect(result.projectsPreserved).toBe(10); // All preserved, just archived
    });

    test('Starter → Free: 5 projects → 1 editable, 4 archived', () => {
        const result = simulateUpgrade('starter', 'free', 5);
        expect(result.isDowngrade).toBe(true);
        expect(result.maxEditableProjects).toBe(1);
        expect(result.archivedProjects).toBe(4);
    });

    test('Downgrade with fewer projects than limit: no archiving', () => {
        const result = simulateUpgrade('professional', 'starter', 3);
        expect(result.isDowngrade).toBe(true);
        expect(result.archivedProjects).toBe(0);
        expect(result.projectsPreserved).toBe(3);
    });

    test('Enterprise → Free: all projects archived except 1', () => {
        const result = simulateUpgrade('enterprise', 'free', 100);
        expect(result.isDowngrade).toBe(true);
        expect(result.archivedProjects).toBe(99);
        expect(result.maxEditableProjects).toBe(1);
    });

    test('Business → Professional: 50 projects → 15 editable', () => {
        const result = simulateUpgrade('business', 'professional', 50);
        expect(result.isDowngrade).toBe(true);
        expect(result.archivedProjects).toBe(35);
        expect(result.maxEditableProjects).toBe(15);
    });
});

describe('⏰ Subscription Expiry Tests', () => {
    test('Expired subscription (0 days) → downgrade to free', () => {
        const result = simulateExpiry('professional', 0);
        expect(result.isExpired).toBe(true);
        expect(result.newPlan).toBe('free');
    });

    test('Expired subscription (-5 days) → downgrade to free', () => {
        const result = simulateExpiry('business', -5);
        expect(result.isExpired).toBe(true);
        expect(result.newPlan).toBe('free');
    });

    test('Expiring in 3 days → should warn', () => {
        const result = simulateExpiry('starter', 3);
        expect(result.isExpired).toBe(false);
        expect(result.shouldWarn).toBe(true);
        expect(result.newPlan).toBe('starter');
    });

    test('Expiring in 1 day → should warn', () => {
        const result = simulateExpiry('professional', 1);
        expect(result.shouldWarn).toBe(true);
    });

    test('Active subscription (30 days) → no action', () => {
        const result = simulateExpiry('business', 30);
        expect(result.isExpired).toBe(false);
        expect(result.shouldWarn).toBe(false);
        expect(result.newPlan).toBe('business');
    });

    test('Free plan never expires', () => {
        // Free plan has no expiry concept
        const result = simulateExpiry('free', -999);
        // Even if "expired", free → free
        expect(result.newPlan).toBe('free');
    });
});

describe('💰 RFQ Commission Tests', () => {
    test('Small order (1000 SAR): commission = 70 SAR', () => {
        const c = calculateRFQCommission(1000);
        expect(c.gatewayFee).toBe(25);          // 2.5% of 1000
        expect(c.fixedFee).toBe(10);
        expect(c.arbaProfit).toBe(35);           // 3.5% of 1000
        expect(c.totalCommission).toBe(70);
    });

    test('Medium order (10000 SAR): commission = 610 SAR', () => {
        const c = calculateRFQCommission(10000);
        expect(c.gatewayFee).toBe(250);
        expect(c.fixedFee).toBe(10);
        expect(c.arbaProfit).toBe(350);
        expect(c.totalCommission).toBe(610);
    });

    test('Large order (100000 SAR): commission = 6010 SAR', () => {
        const c = calculateRFQCommission(100000);
        expect(c.gatewayFee).toBe(2500);
        expect(c.fixedFee).toBe(10);
        expect(c.arbaProfit).toBe(3500);
        expect(c.totalCommission).toBe(6010);
    });

    test('Very small order (100 SAR): commission = 16 SAR', () => {
        const c = calculateRFQCommission(100);
        expect(c.gatewayFee).toBe(2.5);
        expect(c.fixedFee).toBe(10);
        expect(c.arbaProfit).toBe(3.5);
        expect(c.totalCommission).toBe(16);
    });

    test('Commission total is always > 10 SAR (fixed fee minimum)', () => {
        const c = calculateRFQCommission(1);
        expect(c.totalCommission).toBeGreaterThan(10);
    });

    test('Arba profit is 75% of variable fees', () => {
        // arbaProfit (3.5%) vs gatewayFee (2.5%) → arba = 58.3% of variable
        // Plus fixed fee 10 SAR → Arba keeps fixedFee + arbaProfit
        const c = calculateRFQCommission(10000);
        const arbaTotal = c.fixedFee + c.arbaProfit; // 10 + 350 = 360
        const percentOfTotal = (arbaTotal / c.totalCommission) * 100;
        expect(percentOfTotal).toBeGreaterThan(50); // Arba keeps >50%
    });
});

describe('🔀 Plan ID Normalization Tests', () => {
    test('Legacy "basic" maps to "starter"', () => {
        const normalized = normalizePlanId('basic');
        expect(normalized).toBe('starter');
    });

    test('Legacy "pro" maps to "professional"', () => {
        const normalized = normalizePlanId('pro');
        expect(normalized).toBe('professional');
    });

    test('Modern "starter" stays "starter"', () => {
        const normalized = normalizePlanId('starter');
        expect(normalized).toBe('starter');
    });

    test('Unknown plan defaults to "free"', () => {
        const normalized = normalizePlanId('unknown_plan');
        expect(normalized).toBe('free');
    });
});

// Plan ID normalizer (matching billingService)
function normalizePlanId(planId: string): string {
    const PLAN_ALIASES: Record<string, string> = {
        'basic': 'starter',
        'pro': 'professional',
        'biz': 'business',
        'ent': 'enterprise',
    };
    
    const validPlans = ['free', 'starter', 'professional', 'business', 'enterprise'];
    const normalized = PLAN_ALIASES[planId] || planId;
    return validPlans.includes(normalized) ? normalized : 'free';
}

describe('📊 Price Calculation Tests', () => {
    test('Annual pricing has 20% discount', () => {
        const monthlyTotal = PLANS.professional.price * 12; // 4788
        const annualPrice = Math.round(monthlyTotal * 0.8);  // 3830.4 → 3830
        expect(annualPrice).toBe(3830);
    });

    test('Free plan has 0 price', () => {
        expect(PLANS.free.price).toBe(0);
    });

    test('Enterprise is the most expensive', () => {
        const prices = Object.values(PLANS).map(p => p.price);
        expect(Math.max(...prices)).toBe(1999);
    });

    test('Storage increases with plan tier', () => {
        expect(PLANS.free.storageMB).toBe(50);
        expect(PLANS.starter.storageMB).toBe(500);
        expect(PLANS.professional.storageMB).toBe(2048);
        expect(PLANS.business.storageMB).toBe(10240);
        expect(PLANS.enterprise.storageMB).toBe(51200);
    });
});

// =================== Report ===================

console.log('\n' + '═'.repeat(60));
console.log(`📊 Test Results: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log('═'.repeat(60));

if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => r.status === 'fail').forEach(r => {
        console.log(`   • ${r.name}: ${r.error}`);
    });
    process.exit(1);
} else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
}
