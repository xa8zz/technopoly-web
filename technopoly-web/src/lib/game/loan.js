// loan.js - JavaScript version of Python Loan class

export class Loan {
    /**
     * Represents a loan taken by a company.
     * Each loan has a principal amount, an annual interest rate,
     * and a remaining term in months.
     * The monthly payment is calculated using the standard amortization formula.
     */
    constructor(principal, annualRate, termMonths) {
        this.principal = principal;
        this.annualRate = annualRate; // e.g. 0.06 for 6%
        this.termRemainingMonths = termMonths; // e.g. 120 months for 10 years
        this.monthlyPayment = this.calculateMonthlyPayment();
    }

    calculateMonthlyPayment() {
        const monthlyR = this.annualRate / 12;
        const n = this.termRemainingMonths;
        if (n <= 0) {
            return 0;
        }
        return (monthlyR * this.principal) / (1 - Math.pow(1 + monthlyR, -n));
    }

    toJSON() {
        /**
         * Serialize loan to plain JavaScript object.
         */
        return {
            principal: this.principal,
            annualRate: this.annualRate,
            termRemainingMonths: this.termRemainingMonths,
            monthlyPayment: this.monthlyPayment
        };
    }

    static fromJSON(data) {
        /**
         * Recreate Loan instance from serialized data.
         */
        const loan = new Loan(data.principal, data.annualRate, data.termRemainingMonths);
        
        // The constructor already calculates monthlyPayment, but we can override if needed
        if (data.monthlyPayment !== undefined) {
            loan.monthlyPayment = data.monthlyPayment;
        }
        
        return loan;
    }
} 