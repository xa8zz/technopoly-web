// finances.js - JavaScript version of Python finances module

/**
 * Handles routines for:
 * - Updating each company's finances
 * - Paying out bond interest
 * - New Market Cap formula:
 *   MarketCap = avg_profit_3q * (20 + (margin_last_q*0.1) + rnd(1..3)) + (net_assets).
 */

export function updateFinances(companies) {
    /**
     * Each quarter:
     * - Pay out bond interest.
     * - Compute profit and update cash.
     * - Update market cap.
     * - Process outstanding loans.
     * 
     * We perform the updates in two main passes:
     *   1) Process bonds.
     *   2) Process profit and loans.
     */
    
    // 1) Pay bond interest
    for (const c of companies) {
        let totalBondInterest = 0.0;
        const removeBonds = [];
        
        for (const b of c.bonds) {
            // Compute interest for this quarter.
            const interest = b.quarterlyInterest();
            totalBondInterest += interest;

            // Reduce the bond's term.
            b.termRemaining -= 1;
            if (b.termRemaining <= 0) {
                // When the bond expires, add back its principal.
                c.cash += b.principal;
                removeBonds.push(b);
            }
        }

        // Remove expired bonds.
        for (const bb of removeBonds) {
            const index = c.bonds.indexOf(bb);
            if (index > -1) {
                c.bonds.splice(index, 1);
            }
        }

        // Add total bond interest to cash.
        c.cash += totalBondInterest;
    }

    // 2) Profit calculation and market cap update
    for (const c of companies) {
        // Calculate this quarter's profit.
        const qProfit = c.quarterlyProfit();
        c.cash += qProfit;  // Update cash with profit.
        c.pastQuarterProfits.push(qProfit);
        if (c.pastQuarterProfits.length > 3) {
            c.pastQuarterProfits.shift();
        }
        
        const revThisQ = c.totalRevenueThisQuarter();
        c.pastQuarterRevenues.push(revThisQ);
        if (c.pastQuarterRevenues.length > 3) {
            c.pastQuarterRevenues.shift();
        }

        // (a) Compute the average quarterly revenue from the past three quarters.
        let avgRevenue;
        if (c.pastQuarterRevenues.length > 0) {
            avgRevenue = c.pastQuarterRevenues.reduce((sum, rev) => sum + rev, 0) / c.pastQuarterRevenues.length;
        } else {
            avgRevenue = c.totalRevenueThisQuarter();
        }
        const annualizedRevenue = avgRevenue * 4;

        // (b) Compute the total campus value.
        // (Assuming each campus is stored as a tuple and that index 1 holds its value.)
        const campusValue = c.campuses.reduce((sum, campus) => sum + campus[1], 0);

        // (c) Compute the total bonds value.
        const bondsValue = c.bonds.reduce((sum, b) => sum + b.principal, 0);

        // (d) Compute the total debt (sum of loan principals).
        const debt = c.loans.reduce((sum, loan) => sum + loan.principal, 0);

        // (e) Compute net assets: cash + campus_value + bonds_value - debt.
        const netAssets = c.cash + campusValue + bondsValue - debt;

        // (f) New market cap is the sum of net assets and annualized revenue.
        const newMarketCap = netAssets + annualizedRevenue;

        // Ensure market cap does not fall below zero.
        c.marketCap = Math.max(0, newMarketCap);
    }

    // 3) Process loans for each company
    for (const c of companies) {
        let totalLoanPayment = 0.0;
        const removeLoans = [];
        
        for (const loan of c.loans) {
            const monthlyR = loan.annualRate / 12;
            // Calculate interest for one month.
            const interestPayment = loan.principal * monthlyR;
            // Calculate principal portion for one month.
            let principalPortion = loan.monthlyPayment - interestPayment;
            if (principalPortion < 0) {
                principalPortion = 0;
            }
            // For the quarter (3 months):
            const totalInterest = interestPayment * 3;
            const principalPaymentTotal = principalPortion * 3;
            // Reduce the loan principal.
            loan.principal = Math.max(0, loan.principal - principalPaymentTotal);
            loan.termRemainingMonths -= 3;
            totalLoanPayment += loan.monthlyPayment * 3;
            
            if (loan.termRemainingMonths <= 0 || loan.principal <= 0) {
                removeLoans.push(loan);
            }
        }
        
        for (const loan of removeLoans) {
            const index = c.loans.indexOf(loan);
            if (index > -1) {
                c.loans.splice(index, 1);
            }
        }
        
        // Subtract the total loan payment from cash.
        c.cash -= totalLoanPayment;
    }
} 