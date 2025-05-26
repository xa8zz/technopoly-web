// data_store.js - JavaScript version of Python data storage module

/**
 * Implements a DataStorage class that captures all changing values
 * each quarter: 
 * - Company finances (cash, debt, market cap, profit)
 * - Product data (employee assignments, effectiveness, revenue)
 * - Market data (size, growth rate)
 * and so on.
 * 
 * We'll store them in a dictionary structure each turn.
 */

export class DataStorage {
    /**
     * Maintains a list of snapshots, one per quarter, for historical analysis.
     */
    constructor() {
        this.history = []; // list of dict snapshots
        this.maxHistoryLength = 10; // Limit history to 10 snapshots to avoid memory issues
    }

    recordState(turnIndex, companies, markets) {
        /**
         * Create a big dictionary capturing everything. Then append to this.history.
         */
        const snapshot = {
            turn: turnIndex,
            companies: [],
            markets: []
        };

        for (const c of companies) {
            const companyData = {
                name: c.name,
                tier: c.tier,
                cash: c.cash,
                debt: c.debt,
                marketCap: c.marketCap,
                employees: c.employees,
                products: {},
                bonds: []
            };
            
            for (const [pname, prod] of Object.entries(c.products)) {
                companyData.products[pname] = {
                    marketName: prod.marketName,
                    rdEmployees: prod.assignedEmployees["r&d"],
                    qaEmployees: prod.assignedEmployees["q&a"],
                    marketingEmployees: prod.assignedEmployees["marketing"],
                    revenue: prod.revenue,
                    effectiveness: prod.effectiveness
                };
            }
            
            // bonds
            for (const b of c.bonds) {
                companyData.bonds.push({
                    principal: b.principal,
                    annualRate: b.annualRate,
                    termRemaining: b.termRemaining
                });
            }

            snapshot.companies.push(companyData);
        }

        for (const m of markets) {
            const marketData = {
                name: m.name,
                size: m.size,
                growthRate: m.growthRate,
                isInGlobalRecession: m.isInGlobalRecession,
                lastQuarterRevenue: m.lastQuarterTotalRevenue
            };
            snapshot.markets.push(marketData);
        }

        this.history.push(snapshot);
        
        // Limit history size to prevent memory issues
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift(); // Remove the oldest snapshot
        }
    }

    getLatestSnapshot() {
        return this.history.length > 0 ? this.history[this.history.length - 1] : null;
    }

    getHistoryLength() {
        return this.history.length;
    }

    // Save to localStorage
    saveToLocalStorage(gameId = 'technopoly_save') {
        try {
            localStorage.setItem(gameId, JSON.stringify(this.history));
            return true;
        } catch (error) {
            console.error('Failed to save game data:', error);
            return false;
        }
    }

    // Load from localStorage
    loadFromLocalStorage(gameId = 'technopoly_save') {
        try {
            const saved = localStorage.getItem(gameId);
            if (saved) {
                this.history = JSON.parse(saved);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to load game data:', error);
            return false;
        }
    }
} 