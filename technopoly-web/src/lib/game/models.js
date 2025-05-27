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

    toJSON() {
        /**
         * Serialize product to plain JavaScript object.
         */
        return {
            ownerName: this.ownerName,
            marketName: this.marketName,
            assignedEmployees: { ...this.assignedEmployees },
            effectiveSpend: { ...this.effectiveSpend },
            effectiveness: this.effectiveness,
            revenue: this.revenue,
            recentGrowth: [...this.recentGrowth]
        };
    }

    static fromJSON(data) {
        /**
         * Recreate Product instance from serialized data.
         */
        const product = new Product(data.ownerName, data.marketName);
        
        product.assignedEmployees = data.assignedEmployees || { "r&d": 0, "q&a": 0, "marketing": 0 };
        product.effectiveSpend = data.effectiveSpend || { "r&d": 0.0, "q&a": 0.0, "marketing": 0.0 };
        product.effectiveness = data.effectiveness || 0.0;
        product.revenue = data.revenue || 0.0;
        product.recentGrowth = data.recentGrowth || [];
        
        return product;
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

    toJSON() {
        /**
         * Serialize bond to plain JavaScript object.
         */
        return {
            principal: this.principal,
            annualRate: this.annualRate,
            termRemaining: this.termRemaining,
            originalTerm: this.originalTerm
        };
    }

    static fromJSON(data) {
        /**
         * Recreate Bond instance from serialized data.
         */
        const bond = new Bond(data.principal, data.annualRate, data.originalTerm);
        bond.termRemaining = data.termRemaining || data.originalTerm;
        return bond;
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

    get consecutiveNegativeCashQuarters() {
        return this._negativeCashQuarters;
    }

    toJSON() {
        /**
         * Serialize company to plain JavaScript object.
         */
        return {
            name: this.name,
            tier: this.tier,
            cash: this.cash,
            debt: this.debt,
            debtMonthlyPayment: this.debtMonthlyPayment,
            debtInterestRate: this.debtInterestRate,
            debtRemainingMonths: this.debtRemainingMonths,
            employees: this.employees,
            marketCap: this.marketCap,
            products: Object.fromEntries(
                Object.entries(this.products).map(([name, product]) => [name, product.toJSON()])
            ),
            loans: this.loans.map(loan => loan.toJSON()),
            bonds: this.bonds.map(bond => bond.toJSON()),
            pastQuarterProfits: [...this.pastQuarterProfits],
            campuses: this.campuses.map(campus => [...campus]), // Deep copy arrays
            _negativeCashQuarters: this._negativeCashQuarters,
            pastQuarterRevenues: [...this.pastQuarterRevenues],
            lastAcquisitionQuarter: this.lastAcquisitionQuarter
        };
    }

    static fromJSON(data) {
        /**
         * Recreate Company instance from serialized data.
         */
        const company = new Company(data.name, data.tier);
        
        company.cash = data.cash || 0.0;
        company.debt = data.debt || 0.0;
        company.debtMonthlyPayment = data.debtMonthlyPayment || 0.0;
        company.debtInterestRate = data.debtInterestRate || 0.06;
        company.debtRemainingMonths = data.debtRemainingMonths || 0;
        company.employees = data.employees || 0;
        company.marketCap = data.marketCap || 0.0;
        company.pastQuarterProfits = data.pastQuarterProfits || [0.0, 0.0, 0.0];
        company.campuses = data.campuses || [];
        company._negativeCashQuarters = data._negativeCashQuarters || 0;
        company.pastQuarterRevenues = data.pastQuarterRevenues || [0.0, 0.0, 0.0];
        company.lastAcquisitionQuarter = data.lastAcquisitionQuarter || -100;
        
        // Restore products
        company.products = {};
        if (data.products) {
            Object.entries(data.products).forEach(([name, productData]) => {
                company.products[name] = Product.fromJSON(productData);
            });
        }
        
        // Restore loans
        company.loans = (data.loans || []).map(loanData => Loan.fromJSON(loanData));
        
        // Restore bonds
        company.bonds = (data.bonds || []).map(bondData => Bond.fromJSON(bondData));
        
        return company;
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

    toJSON() {
        /**
         * Serialize market to plain JavaScript object.
         */
        return {
            name: this.name,
            size: this.size,
            baseGrowthRate: this.baseGrowthRate,
            growthRate: this.growthRate,
            quartersElapsed: this.quartersElapsed,
            isInGlobalRecession: this.isInGlobalRecession,
            recessionQuartersLeft: this.recessionQuartersLeft,
            lastQuarterTotalRevenue: this.lastQuarterTotalRevenue,
            // Note: imaginaryProduct is not serialized as it's recreated when needed
        };
    }

    static fromJSON(data) {
        /**
         * Recreate Market instance from serialized data.
         */
        const market = new Market(data.name);
        
        market.size = data.size || 0;
        market.baseGrowthRate = data.baseGrowthRate || 0.05;
        market.growthRate = data.growthRate || data.baseGrowthRate || 0.05;
        market.quartersElapsed = data.quartersElapsed || 0;
        market.isInGlobalRecession = data.isInGlobalRecession || false;
        market.recessionQuartersLeft = data.recessionQuartersLeft || 0;
        market.lastQuarterTotalRevenue = data.lastQuarterTotalRevenue || 0.0;
        
        return market;
    }
} 