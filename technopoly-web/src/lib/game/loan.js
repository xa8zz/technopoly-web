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
} 