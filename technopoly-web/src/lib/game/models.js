// models.js - JavaScript version of Python models

import { clamp } from './utils.js';
import { Loan } from './loan.js';

// --- Product Class ---
export class Product {
    static DELAYS = { "r&d": 5.0, "q&a": 3.0, "marketing": 1.0 };
    static WEIGHTS = { "r&d": 0.5, "q&a": 0.3, "marketing": 0.2 };

    constructor(ownerName, marketName) {
        this.ownerName = ownerName;
        this.marketName = marketName;
        this.assignedEmployees = { "r&d": 0, "q&a": 0, "marketing": 0 };
        this.effectiveSpend = { "r&d": 0.0, "q&a": 0.0, "marketing": 0.0 };
        this.effectiveness = 0.0;
        this.revenue = 0.0;
        this.recentGrowth = []; // last 4 quarters growth, for M&A checks
    }

    employeesToSpend(category) {
        return this.assignedEmployees[category] * 25000;
    }

    totalSpendThisQuarter() {
        return Object.keys(this.assignedEmployees).reduce((total, key) => {
            return total + this.employeesToSpend(key);
        }, 0);
    }

    calculateEffectiveSpend(category) {
        const delay = Product.DELAYS[category];
        const prev = this.effectiveSpend[category];
        const actual = this.assignedEmployees[category] * 25000;
        return prev + (actual - prev) / delay;
    }

    updateEffectiveSpendEachQuarter() {
        for (const cat in this.effectiveSpend) {
            this.effectiveSpend[cat] = this.calculateEffectiveSpend(cat);
        }
    }

    updateEffectiveness() {
        const W = { "r&d": 0.5, "q&a": 0.3, "marketing": 0.2 };
        const denom = Math.max(this.revenue, 1.0);
        const totalEffSpend = Object.keys(W).reduce((total, t) => {
            return total + W[t] * this.effectiveSpend[t];
        }, 0);
        this.effectiveness = totalEffSpend / denom;
    }
}

// --- Bond Class ---
export class Bond {
    constructor(principal, annualRate, termQuarters) {
        this.principal = principal;
        this.annualRate = annualRate;
        this.termRemaining = termQuarters;
        this.originalTerm = termQuarters;
    }

    quarterlyInterest() {
        return this.principal * (this.annualRate / 4.0);
    }
}

// --- Company Class ---
export class Company {
    constructor(name, tier = null) {
        this.name = name;
        this.tier = tier;
        this.cash = 0.0;
        this.debt = 0.0;
        this.debtMonthlyPayment = 0.0;
        this.debtInterestRate = 0.06;
        this.debtRemainingMonths = 0;
        this.loans = []; // List of Loan objects
        this.bonds = []; // List of Bond objects
        this.employees = 0;
        this.marketCap = 0.0;
        this.products = {}; // key: product name, value: Product
        this.pastQuarterProfits = [0.0, 0.0, 0.0];
        this.campuses = [];
        this._negativeCashQuarters = 0;
        this.pastQuarterRevenues = [0.0, 0.0, 0.0]; // store up to 3 prior quarter revenues
        this.lastAcquisitionQuarter = -100;
    }

    employeeCapacity() {
        return this.campuses.reduce((total, c) => total + c[3], 0);
    }

    overheadPercent() {
        if (this.campuses.length === 0) {
            return 0.0;
        }
        return Math.max(...this.campuses.map(c => c[2]));
    }

    totalRevenueThisQuarter() {
        return Object.values(this.products).reduce((total, p) => total + p.revenue, 0);
    }

    totalProductSpend() {
        return Object.values(this.products).reduce((total, p) => {
            return total + p.totalSpendThisQuarter();
        }, 0);
    }

    totalSpendingThisQuarter() {
        const employeeBase = this.employees * 25000;
        const overhead = employeeBase * this.overheadPercent();
        const debtCost = this.debtMonthlyPayment * 3;
        return employeeBase + overhead + debtCost;
    }

    quarterlyProfit() {
        return this.totalRevenueThisQuarter() - this.totalSpendingThisQuarter();
    }

    updateNegativeCashQuarters() {
        if (this.cash < 0) {
            this._negativeCashQuarters += 1;
        } else {
            this._negativeCashQuarters = 0;
        }
    }

    isBankrupt() {
        return this._negativeCashQuarters >= 4;
    }
}

// --- Market Class ---
export class Market {
    constructor(name) {
        this.name = name;
        this.size = Math.floor(Math.random() * (50000000 - 25000000 + 1)) + 25000000;
        this.baseGrowthRate = Math.random() * (0.15 - 0.05) + 0.05;
        this.growthRate = this.baseGrowthRate;
        this.quartersElapsed = 0;
        this.isInGlobalRecession = false;
        this.recessionQuartersLeft = 0;
        this.lastQuarterTotalRevenue = 0.0;
    }

    applyRecession() {
        if (this.isInGlobalRecession && this.recessionQuartersLeft > 0) {
            this.size *= 0.95;
            this.recessionQuartersLeft -= 1;
            if (this.recessionQuartersLeft <= 0) {
                this.isInGlobalRecession = false;
            }
        }
    }
} 