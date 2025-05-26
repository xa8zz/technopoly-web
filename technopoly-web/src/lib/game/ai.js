// ai.js - JavaScript version of Python AI controller

import { Product, Bond } from './models.js';
import { Loan } from './loan.js';
import { randomProductName, formatMoney } from './utils.js';
import { CAMPUS_TYPES } from './configs.js';

export class AIController {
    constructor(gameRef) {
        this.game = gameRef; // reference to main game engine
    }

    aiTakeActions(comp) {
        /**
         * Called each quarter by the game engine for each AI company.
         * This method first checks bankruptcy, then delegates to tier-specific logic.
         */
        // 1) Update negative-cash logic and check bankruptcy.
        comp.updateNegativeCashQuarters();
        if (comp.isBankrupt()) {
            this.handleBankruptcy(comp);
            return;
        }

        // 2) Execute tier-specific strategy.
        if (comp.tier === "Startup") {
            this._logicStartup(comp);
        } else if (comp.tier === "Medium") {
            this._logicMedium(comp);
        } else if (comp.tier === "Large") {
            this._logicLarge(comp);
        } else if (comp.tier === "Big Tech") {
            this._logicBigtech(comp);
        }

        // 3) Final update of negative cash quarters after actions.
        comp.updateNegativeCashQuarters();
        
        // 4) Adjust employee assignments and push news.
        const assignmentChanges = this.adjustEmployeeAssignments(comp);
        for (const [productName, changes] of Object.entries(assignmentChanges)) {
            for (const [dept, change] of Object.entries(changes)) {
                if (change > 0) {
                    this.game._pushCompetitorNews(`${comp.name} assigned ${change} additional employees to ${dept} for product '${productName}'.`);
                } else if (change < 0) {
                    this.game._pushCompetitorNews(`${comp.name} removed ${-change} employees from ${dept} for product '${productName}'.`);
                }
            }
        }
    }

    // =============================
    // Bankruptcy Handler
    // =============================
    handleBankruptcy(comp) {
        /**
         * If the company is bankrupt, give all assets to the biggest MC company (player or AI).
         * Remove from the AI list and push news.
         */
        // Attempt to liquidate bonds as a last-ditch effort to recover cash
        if (comp.cash < 0 && comp.bonds.length > 0) {
            this._liquidateBondsForPrincipal(comp);
        }
        
        // Re-check if the company is still bankrupt after bond liquidation
        if (comp.cash >= 0) {
            // Successfully staved off bankruptcy
            this.game._pushCompetitorNews(`${comp.name} avoided bankruptcy after liquidating bonds!`);
            return;
        }

        let largest = this.game.player;
        let largestMc = largest.marketCap;
        for (const ai of this.game.aiCompanies) {
            if (ai !== comp && ai.marketCap > largestMc) {
                largestMc = ai.marketCap;
                largest = ai;
            }
        }

        this.game._mergeCompanies(largest, comp);
        const index = this.game.aiCompanies.indexOf(comp);
        if (index > -1) {
            this.game.aiCompanies.splice(index, 1);
        }
        this.game._pushCompetitorNews(`${comp.name} has gone BANKRUPT! All assets given to ${largest.name}.`);
    }

    // =============================
    // Helper Functions
    // =============================
    _getLiquidityRatio(comp) {
        /**Return ratio of cash to quarterly revenue (avoid division by zero).*/
        const rev = comp.totalRevenueThisQuarter();
        return rev > 0 ? comp.cash / rev : 10.0;
    }

    _targetEmployeeCount(comp, targetCostRatio) {
        /**
         * Given a target employee cost ratio (employee cost as fraction of revenue),
         * return the ideal number of employees.
         * (Each employee costs $25K per quarter.)
         */
        const revenue = comp.totalRevenueThisQuarter();
        const targetCost = targetCostRatio * revenue;
        return Math.floor(targetCost / 25000);
    }

    _liquidateBondsForPrincipal(comp) {
        /**
         * Sells all bonds for their principal amounts (no interest).
         */
        if (comp.bonds.length === 0) {
            return;
        }
        const totalGained = comp.bonds.reduce((sum, b) => sum + b.principal, 0);
        comp.cash += totalGained;
        comp.bonds = [];
        this.game._pushCompetitorNews(`${comp.name} sold all bonds for ${formatMoney(totalGained)} to raise emergency funds.`);
    }

    fireExcessEmployees(comp, targetEmployees) {
        /**Fires employees down to the target, handling severance, and unassigning first.*/
        let toFire = Math.max(0, comp.employees - targetEmployees);
        if (toFire === 0) {
            return; // Nothing to do
        }

        // 1. Unassign from worst-performing products first.
        const productsSorted = Object.entries(comp.products).sort((a, b) => a[1].effectiveness - b[1].effectiveness);
        
        for (const [pname, product] of productsSorted) {
            if (toFire <= 0) break;

            // Fire from the lowest rank of employees first
            if (product.assignedEmployees["marketing"] > 0) {
                const fireFromMarketing = Math.min(product.assignedEmployees["marketing"], toFire);
                product.assignedEmployees["marketing"] -= fireFromMarketing;
                toFire -= fireFromMarketing;
            }
            if (toFire > 0 && product.assignedEmployees["q&a"] > 0) {
                const fireFromQA = Math.min(product.assignedEmployees["q&a"], toFire);
                product.assignedEmployees["q&a"] -= fireFromQA;
                toFire -= fireFromQA;
            }
            if (toFire > 0 && product.assignedEmployees["r&d"] > 0) {
                const fireFromRD = Math.min(product.assignedEmployees["r&d"], toFire);
                product.assignedEmployees["r&d"] -= fireFromRD;
                toFire -= fireFromRD;
            }
        }

        // 2. Now, actually reduce the employee count and handle severance.
        const actualToFire = Math.max(0, comp.employees - targetEmployees);
        const severanceCost = actualToFire * 20000; // $20k per fired employee
        
        if (comp.cash >= severanceCost) {
            comp.cash -= severanceCost;
            comp.employees -= actualToFire;
            this.game._pushCompetitorNews(`${comp.name} fired ${actualToFire} employees, incurring ${formatMoney(severanceCost)} in severance costs.`);
        } else {
            // Not enough cash to cover severance. Fire as many as possible.
            const affordableToFire = Math.floor(comp.cash / 20000);
            if (affordableToFire > 0) {
                comp.cash -= affordableToFire * 20000;
                comp.employees -= affordableToFire;
                this.game._pushCompetitorNews(`${comp.name} fired ${affordableToFire} employees, incurring ${formatMoney(affordableToFire * 20000)} in severance costs (limited by cash).`);
            }
            
            // Handle over capacity
            const overCapacity = Math.max(0, comp.employees - comp.employeeCapacity());
            if (overCapacity > 0) {
                comp.employees -= overCapacity; // No severance paid
                this.game._pushCompetitorNews(`${comp.name} released ${overCapacity} employees due to campus capacity limits.`);
            }
        }
    }

    // =============================
    // Tier-Specific Logic
    // =============================
    _logicStartup(comp) {
        /**
         * Startup Strategy (Aggressive growth):
         * - Prioritize raising product effectiveness.
         * - Aim for a high employee spending ratio (~80% of revenue).
         * - Take loans aggressively if liquidity is low.
         * - Open new products when excess cash is available.
         * - Invest a small fraction in bonds if surplus cash exists.
         */
        const revenue = comp.totalRevenueThisQuarter();
        const profit = comp.quarterlyProfit();
        const liquidity = this._getLiquidityRatio(comp);
        const targetRatio = 0.8;
        const targetEmp = this._targetEmployeeCount(comp, targetRatio);

        // (B) HIRING / FIRING:
        if (comp.employees < targetEmp) {
            // Hire only if campus capacity allows and if liquidity is reasonable.
            const hires = Math.min(targetEmp - comp.employees, comp.employeeCapacity() - comp.employees);
            // Ensure that hiring does not push liquidity below a safety margin. Require 1x quarterly revenue.
            if (comp.cash > revenue * 1 && hires > 0) {
                comp.employees += hires;
                this.game._pushCompetitorNews(`${comp.name} hires ${hires} new employees.`);
            }
        } else if (profit < 0 && comp.employees > Math.floor(targetEmp * 1.2)) {
            // fires if employees are 20% greater than target employees AND comp is losing money
            this.fireExcessEmployees(comp, targetEmp);
        }

        // (C) CAMPUS EXPANSION:
        const remainingCapacity = comp.employeeCapacity() - comp.employees;
        if (comp.employeeCapacity() > 0 && remainingCapacity < 0.15 * comp.employeeCapacity() && comp.cash > 250000) {
            this.buildCampus(comp, "startup");
        }

        // (D) LIQUIDITY MANAGEMENT:
        if (liquidity < 0.5) {
            this.takeLoanIfNeeded(comp, true);
        }

        // (E) NEW PRODUCT:
        // Use a threshold based on the market's entry cost.
        // (For startups, require cash > 1.75× entry cost.)
        const potentialMarkets = this.game.markets.filter(m => 
            !this.game._companyHasProductInMarket(comp, m.name)
        );
        if (potentialMarkets.length > 0) {
            // Pick one market to evaluate (could be randomized).
            const chosenMarket = potentialMarkets[Math.floor(Math.random() * potentialMarkets.length)];
            const entryCost = chosenMarket.size * 0.05 * 4;
            if (comp.cash > entryCost * 1.75 && profit > 0) {
                this.openNewProduct(comp, 0.25);
            }
        }

        // (F) BOND INVESTMENT:
        // If surplus cash exists (cash > 1.5× revenue), invest ~10% in short-term bonds.
        if (comp.cash > revenue * 1.5 && comp.cash > 500000 && Math.random() < 0.05) {
            this.buyBond(comp, 2, 0.06);
        }
    }

    _logicMedium(comp) {
        /**
         * Medium Company Strategy (Balanced growth):
         * - Moderately invest in product improvement (aim for ~60% employee cost ratio).
         * - Hire/firing decisions are a bit more conservative.
         * - New product expansion if cash exceeds 2× entry cost.
         * - Consider acquisitions when underperforming products persist.
         * - Invest in bonds if cash is in excess.
         */
        const revenue = comp.totalRevenueThisQuarter();
        const profit = comp.quarterlyProfit();
        const liquidity = this._getLiquidityRatio(comp);
        const targetRatio = 0.6; // Target employee cost as a fraction of revenue
        const targetEmp = this._targetEmployeeCount(comp, targetRatio);

        // (B) HIRING / FIRING:
        if (comp.employees < targetEmp) {
            const hires = Math.min(targetEmp - comp.employees, comp.employeeCapacity() - comp.employees);
            // Medium companies require a bit more cash buffer.
            if (comp.cash > revenue * 2 && hires > 0) { // Increased cash buffer
                comp.employees += hires;
                this.game._pushCompetitorNews(`${comp.name} hires ${hires} employees.`);
            }
        } else if (profit < 0 && comp.employees > Math.floor(targetEmp * 1.15)) {
            // fires if employees are 15% greater than target and comp is losing cash
            this.fireExcessEmployees(comp, targetEmp);
        }

        // (C) CAMPUS EXPANSION:
        const remainingCapacity = comp.employeeCapacity() - comp.employees;
        if (comp.employeeCapacity() > 0 && remainingCapacity < 0.20 * comp.employeeCapacity() && comp.cash > 1000000) {
            this.buildCampus(comp, "medium");
        }

        // (D) LIQUIDITY MANAGEMENT:
        if (liquidity < 0.6) { // Slightly tighter liquidity requirement
            this.takeLoanIfNeeded(comp, false);
        }

        // (E) NEW PRODUCT:
        const potentialMarkets = this.game.markets.filter(m => 
            !this.game._companyHasProductInMarket(comp, m.name)
        );
        if (potentialMarkets.length > 0) {
            const chosenMarket = potentialMarkets[Math.floor(Math.random() * potentialMarkets.length)];
            const entryCost = chosenMarket.size * 0.05 * 4;
            if (comp.cash > entryCost * 2 && profit > 0) { // 2x entry cost buffer
                this.openNewProduct(comp, 0.25);
            }
        }

        // (F) ACQUISITIONS:
        // If any product has been underperforming and game turn is mature, try to acquire a competitor.
        for (const [pname, product] of Object.entries(comp.products)) {
            const rank = this.game._getProductQualityRank(product);
            if ((rank === "Very Bad" || rank === "Bad") && 
                this.game.turnIndex >= 12 && 
                this.game.turnIndex - comp.lastAcquisitionQuarter >= 5) {
                
                const marketProducts = this.game._findProductsInMarket(product.marketName);
                for (const otherProduct of marketProducts) {
                    if (otherProduct.ownerName !== comp.name) {
                        const otherRank = this.game._getProductQualityRank(otherProduct);
                        if (otherRank === "Very Good" || otherRank === "Good") { // Only acquire better-ranked products.
                            // Find target company
                            for (const potentialTarget of this.game.aiCompanies) {
                                if (potentialTarget.name === otherProduct.ownerName) {
                                    const price = this.game._calculateAcquisitionPrice(potentialTarget);
                                    if (comp.cash >= price) {
                                        comp.lastAcquisitionQuarter = this.game.turnIndex;
                                        this.game.pendingAcquisitions.push([comp, potentialTarget.name, price, this.game.turnIndex]);
                                        this.game._pushCompetitorNews(`${comp.name} begins acquisition attempt of ${potentialTarget.name}!`);
                                        return; // Only one acquisition attempt per turn
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // (G) BOND INVESTMENT:
        if (comp.cash > revenue * 1.5 && comp.cash > 1000000) {
            if (Math.random() < 0.15) { // Reduced probability
                this.buyBond(comp, 4, 0.07);
            }
        }
    }

    _logicLarge(comp) {
        /**
         * Large Company Strategy (Profit-focused growth):
         * - Aim for a lower employee cost ratio (~50% of revenue).
         * - Be conservative with hiring and only expand staffing modestly.
         * - Open new products only when strategically important.
         * - Use loans primarily for acquisitions.
         * - Invest in bonds if a significant cash surplus exists.
         */
        const revenue = comp.totalRevenueThisQuarter();
        const profit = comp.quarterlyProfit();
        const liquidity = this._getLiquidityRatio(comp);
        const targetRatio = 0.5;
        const targetEmp = this._targetEmployeeCount(comp, targetRatio);

        // (B) HIRING / FIRING:
        if (comp.employees < targetEmp) {
            const hires = Math.min(targetEmp - comp.employees, comp.employeeCapacity() - comp.employees);
            // Large companies are even more conservative. Require 3x quarterly revenue.
            if (comp.cash > revenue * 3 && hires > 0) {
                comp.employees += hires;
                this.game._pushCompetitorNews(`${comp.name} hires ${hires} employees.`);
            }
        } else if (profit < 0 && comp.employees > Math.floor(targetEmp * 1.10)) {
            // fires if employees are 10% greater than target
            this.fireExcessEmployees(comp, targetEmp);
        }

        // (C) CAMPUS EXPANSION:
        const remainingCapacity = comp.employeeCapacity() - comp.employees;
        if (comp.employeeCapacity() > 0 && remainingCapacity < 0.25 * comp.employeeCapacity() && comp.cash > 5000000) {
            this.buildCampus(comp, "large");
        }

        // (D) LIQUIDITY & LOAN MANAGEMENT:
        // Large companies use loans more strategically, mainly for acquisitions.
        if (comp.cash < 0 || (liquidity < 0.7 && comp._negativeCashQuarters >= 2)) {
            this.takeLoanIfNeeded(comp, false);
        }

        // (E) NEW PRODUCT:
        const potentialMarkets = this.game.markets.filter(m => 
            !this.game._companyHasProductInMarket(comp, m.name)
        );
        if (potentialMarkets.length > 0) {
            const chosenMarket = potentialMarkets[Math.floor(Math.random() * potentialMarkets.length)];
            const entryCost = chosenMarket.size * 0.05 * 4;
            if (comp.cash > entryCost * 3 && profit > 0) { // Higher cash buffer for large companies
                this.openNewProduct(comp, 0.20);
            }
        }

        // (F) ACQUISITIONS:
        for (const [pname, product] of Object.entries(comp.products)) {
            const rank = this.game._getProductQualityRank(product);
            if ((rank === "Very Bad" || rank === "Bad") && 
                this.game.turnIndex >= 12 && 
                this.game.turnIndex - comp.lastAcquisitionQuarter >= 5) {
                
                const marketProducts = this.game._findProductsInMarket(product.marketName);
                for (const otherProduct of marketProducts) {
                    if (otherProduct.ownerName !== comp.name) {
                        const otherRank = this.game._getProductQualityRank(otherProduct);
                        if (otherRank === "Very Good" || otherRank === "Good") {
                            for (const potentialTarget of this.game.aiCompanies) {
                                if (potentialTarget.name === otherProduct.ownerName) {
                                    const price = this.game._calculateAcquisitionPrice(potentialTarget);
                                    if (comp.cash >= price) {
                                        comp.lastAcquisitionQuarter = this.game.turnIndex;
                                        this.game.pendingAcquisitions.push([comp, potentialTarget.name, price, this.game.turnIndex]);
                                        this.game._pushCompetitorNews(`${comp.name} initiates acquisition of ${potentialTarget.name}!`);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // (G) BOND INVESTMENT:
        if (comp.cash > revenue * 2 && comp.cash > 5000000) {
            if (Math.random() < 0.20) { // Further Reduced probability
                this.buyBond(comp, 4, 0.07);
            }
        }
    }

    _logicBigtech(comp) {
        /**
         * Big Tech Strategy (Market dominance & strategic acquisitions):
         * - Aim for a very low employee cost ratio (~40% of revenue).
         * - Invest minimally in product improvements—just enough to maintain market position.
         * - Hire only as needed to maintain a set ratio.
         * - Open new products only when strategically important.
         * - Use excess cash to buy bonds.
         * - Aggressively attempt acquisitions when an opportunity arises.
         */
        const revenue = comp.totalRevenueThisQuarter();
        const profit = comp.quarterlyProfit();
        const liquidity = this._getLiquidityRatio(comp);
        const targetRatio = 0.4;
        const targetEmp = this._targetEmployeeCount(comp, targetRatio);

        // (B) HIRING / FIRING:
        if (comp.employees < targetEmp) {
            const hires = Math.min(targetEmp - comp.employees, comp.employeeCapacity() - comp.employees);
            // Big Tech hires sparingly; only hire if cash is very abundant.
            if (comp.cash > revenue * 4 && hires > 0) {
                comp.employees += hires;
                this.game._pushCompetitorNews(`${comp.name} hires ${hires} new employees.`);
            }
        } else if (profit < 0 && comp.employees > Math.floor(targetEmp * 1.05)) {
            // very tight firing threshold, big tech almost never fires
            this.fireExcessEmployees(comp, targetEmp);
        }

        // (C) CAMPUS EXPANSION:
        const remainingCapacity = comp.employeeCapacity() - comp.employees;
        if (comp.employeeCapacity() > 0 && remainingCapacity < 0.30 * comp.employeeCapacity() && comp.cash > 10000000) {
            this.buildCampus(comp, "big");
        }

        // (D) LIQUIDITY & LOAN MANAGEMENT:
        // Big Tech rarely takes loans; only do so if cash is very low relative to market cap.
        if (comp.cash < comp.marketCap * 0.1 && liquidity < 0.8) { // much stricter condition for big tech
            this.takeLoanIfNeeded(comp, false);
        }

        // (E) NEW PRODUCT:
        const potentialMarkets = this.game.markets.filter(m => 
            !this.game._companyHasProductInMarket(comp, m.name)
        );
        if (potentialMarkets.length > 0) {
            const chosenMarket = potentialMarkets[Math.floor(Math.random() * potentialMarkets.length)];
            const entryCost = chosenMarket.size * 0.05 * 4;
            if (comp.cash > entryCost * 4 && profit > 0) { // very high buffer for big tech
                this.openNewProduct(comp, 0.30);
            }
        }

        // (F) ACQUISITIONS:
        // Big Tech aggressively acquires companies when they are smaller.
        for (const [pname, product] of Object.entries(comp.products)) {
            const rank = this.game._getProductQualityRank(product);
            if ((rank === "Very Bad" || rank === "Bad" || rank === "Moderate") && 
                this.game.turnIndex >= 12 && 
                this.game.turnIndex - comp.lastAcquisitionQuarter >= 5) {
                
                const marketProducts = this.game._findProductsInMarket(product.marketName);
                for (const otherProduct of marketProducts) {
                    if (otherProduct.ownerName !== comp.name) {
                        const otherRank = this.game._getProductQualityRank(otherProduct);
                        // Big tech will acquire companies with very good products.
                        if (otherRank === "Very Good" || otherRank === "Good") {
                            for (const potentialTarget of this.game.aiCompanies) {
                                if (potentialTarget.name === otherProduct.ownerName) {
                                    const price = this.game._calculateAcquisitionPrice(potentialTarget);
                                    if (comp.cash >= price) {
                                        comp.lastAcquisitionQuarter = this.game.turnIndex;
                                        this.game.pendingAcquisitions.push([comp, potentialTarget.name, price, this.game.turnIndex]);
                                        this.game._pushCompetitorNews(`${comp.name} initiates acquisition of ${potentialTarget.name}!`);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // (G) BOND INVESTMENT:
        // With surplus cash, invest a large portion (e.g., 50% of excess cash) in long-term bonds.
        if (comp.cash > revenue * 2.5 && comp.cash > 10000000) {
            if (Math.random() < 0.15) { // reduced likelihood 0.5 -> 0.15
                this.buyBond(comp, 8, 0.08);
            }
        }
    }

    // =============================
    // Action Methods
    // =============================
    buildCampus(comp, tier = "small") {
        /**
         * Attempt to build an appropriate campus.
         * Chooses a campus that is affordable.
         */
        const affordable = CAMPUS_TYPES.filter(ctype => ctype[1] < comp.cash);
        if (affordable.length === 0) {
            return;
        }
        
        let campusToBuild;
        if (tier === "startup") {
            campusToBuild = affordable.sort((a, b) => a[1] - b[1])[Math.min(affordable.length - 1, 1)];
        } else if (tier === "medium") {
            campusToBuild = affordable.sort((a, b) => a[1] - b[1])[Math.min(affordable.length - 1, 1)];
        } else if (tier === "large") {
            campusToBuild = affordable.sort((a, b) => a[1] - b[1])[affordable.length > 1 ? affordable.length - 2 : affordable.length - 1];
        } else { // big tech: choose the largest
            campusToBuild = affordable.sort((a, b) => a[1] - b[1])[affordable.length - 1];
        }
        
        comp.cash -= campusToBuild[1];
        comp.campuses.push([...campusToBuild]);
        this.game._pushCompetitorNews(`${comp.name} built a new campus: ${campusToBuild[0]} for ${formatMoney(campusToBuild[1])}.`);
    }

    takeLoanIfNeeded(comp, emergency) {
        /**
         * AI takes a loan if cash flow is poor.
         */
        const revenue = comp.totalRevenueThisQuarter();
        const maxLoan = revenue * 4; // Maximum loan is 4x quarterly revenue
        
        if (maxLoan < 100000) return; // Don't take tiny loans

        const loanAmt = emergency ? maxLoan : maxLoan * 0.5;
        const baseRate = 0.06 * 1.5; // 50% higher than base
        const newRate = baseRate + 0.01 * comp.loans.length;
        
        const newLoan = new Loan(loanAmt, newRate, 60);
        comp.loans.push(newLoan);
        comp.cash += loanAmt;
        this.game._pushCompetitorNews(`${comp.name} took a loan of ${formatMoney(loanAmt)} at ${(newRate * 100).toFixed(1)}% interest.`);
    }

    openNewProduct(comp, costFraction) {
        /**
         * AI creates a new product in a market it is not currently in.
         */
        const mkCandidates = this.game.markets.filter(m => 
            !this.game._companyHasProductInMarket(comp, m.name)
        );
        
        if (mkCandidates.length === 0) return;
        
        const chosenM = mkCandidates[Math.floor(Math.random() * mkCandidates.length)];
        const cost = chosenM.size * 0.05 * 4;
        
        if (cost < comp.cash * costFraction && comp.cash >= cost) {
            comp.cash -= cost;
            const newp = new Product(comp.name, chosenM.name);
            
            // Set initial effectiveness and revenue
            const prods = this.game._findProductsInMarket(chosenM.name);
            if (prods.length > 0) {
                const minEff = Math.min(...prods.map(p => p.effectiveness));
                newp.effectiveness = Math.max(0, minEff - (minEff * 0.4));
                const biggest = prods.reduce((max, p) => p.revenue > max.revenue ? p : max);
                if (biggest.revenue > 10000) {
                    biggest.revenue -= 10000;
                    newp.revenue = 10000;
                }
            }

            // Initial employee assignments
            newp.assignedEmployees = { "r&d": 2, "q&a": 1, "marketing": 2 };
            const pname = randomProductName(this.game.usedProductNames);
            comp.products[pname] = newp;
            this.game._pushCompetitorNews(`${comp.name} opened a new product in ${chosenM.name} for ${formatMoney(cost)}.`);
        }
    }

    buyBond(comp, term, annualRate) {
        /**
         * AI invests a portion of cash into a bond.
         */
        const invest = comp.cash * 0.25; // invest 25% of available cash
        if (invest < 100000) return;
        
        comp.cash -= invest;
        const b = new Bond(invest, annualRate, term);
        comp.bonds.push(b);
        this.game._pushCompetitorNews(`${comp.name} purchased a ${term}-quarter bond at ${(annualRate * 100).toFixed(1)}% for ${formatMoney(invest)}.`);
    }

    adjustEmployeeAssignments(comp) {
        /**
         * Simplified version of employee assignment logic.
         * Adjusts employee assignments for all of a company's products based on their 
         * effectiveness ranking in their respective markets.
         */
        const totalEmployees = comp.employees;
        const numProducts = Object.keys(comp.products).length;
        const assignmentChanges = {};

        if (numProducts === 0) {
            return assignmentChanges;
        }

        // Reset each product's assigned_employees
        for (const product of Object.values(comp.products)) {
            product.assignedEmployees = { "r&d": 0, "q&a": 0, "marketing": 0 };
        }

        // Simple even distribution with slight adjustments based on effectiveness
        const baselinePerProduct = Math.floor(totalEmployees / numProducts);
        let remainingEmployees = totalEmployees - (baselinePerProduct * numProducts);

        const sortedProducts = Object.entries(comp.products).sort((a, b) => b[1].effectiveness - a[1].effectiveness);

        for (const [pname, product] of sortedProducts) {
            assignmentChanges[pname] = {};
            
            let productTotal = baselinePerProduct;
            if (remainingEmployees > 0) {
                productTotal += 1;
                remainingEmployees -= 1;
            }

            // Get quality rank (simplified)
            const qualityRank = this.game._getProductQualityRank(product);
            
            let rdPct, qaPct, marketingPct;
            if (qualityRank === "Very Bad" || qualityRank === "Bad") {
                rdPct = 0.6; qaPct = 0.1; marketingPct = 0.3;
            } else if (qualityRank === "Moderate") {
                rdPct = 0.4; qaPct = 0.3; marketingPct = 0.3;
            } else {
                rdPct = 0.2; qaPct = 0.4; marketingPct = 0.4;
            }

            const rdEmployees = Math.floor(productTotal * rdPct);
            const qaEmployees = Math.floor(productTotal * qaPct);
            const marketingEmployees = productTotal - rdEmployees - qaEmployees;

            product.assignedEmployees["r&d"] = rdEmployees;
            product.assignedEmployees["q&a"] = qaEmployees;
            product.assignedEmployees["marketing"] = marketingEmployees;

            assignmentChanges[pname]["r&d"] = rdEmployees;
            assignmentChanges[pname]["q&a"] = qaEmployees;
            assignmentChanges[pname]["marketing"] = marketingEmployees;
        }

        return assignmentChanges;
    }
} 