<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let gameEngine;
  export let show = false;
  
  const dispatch = createEventDispatcher();
  
  let loanAmount = 100000;
  let loanTerm = 24; // months
  let selectedRate = 0.08; // 8% APR
  
  // Available loan terms and rates
  const loanTerms = [
    { months: 12, label: '1 Year' },
    { months: 24, label: '2 Years' },
    { months: 36, label: '3 Years' },
    { months: 48, label: '4 Years' },
    { months: 60, label: '5 Years' }
  ];
  
  const interestRates = [
    { rate: 0.06, label: '6.0% APR (Excellent Credit)' },
    { rate: 0.08, label: '8.0% APR (Good Credit)' },
    { rate: 0.10, label: '10.0% APR (Fair Credit)' },
    { rate: 0.12, label: '12.0% APR (Poor Credit)' },
    { rate: 0.15, label: '15.0% APR (High Risk)' }
  ];
  
  $: monthlyPayment = calculateMonthlyPayment(loanAmount, selectedRate, loanTerm);
  $: totalPayment = monthlyPayment * loanTerm;
  $: totalInterest = totalPayment - loanAmount;
  $: canAfford = gameEngine?.player ? monthlyPayment < gameEngine.player.cash * 0.1 : false;
  $: canTakeLoan = loanAmount > 0 && loanTerm > 0 && selectedRate > 0 && canAfford;
  
  function calculateMonthlyPayment(principal, annualRate, termMonths) {
    if (principal <= 0 || annualRate <= 0 || termMonths <= 0) return 0;
    
    const monthlyRate = annualRate / 12;
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                   (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    return payment;
  }
  
  function handleTakeLoan() {
    if (!canTakeLoan) return;
    
    dispatch('takeLoan', {
      amount: loanAmount,
      term: loanTerm,
      rate: selectedRate
    });
    
    // Reset form
    loanAmount = 100000;
    loanTerm = 24;
    selectedRate = 0.08;
  }
  
  function handleCancel() {
    dispatch('cancel');
    loanAmount = 100000;
    loanTerm = 24;
    selectedRate = 0.08;
  }
  
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleCancel();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <!-- Modal Content -->
    <div class="bg-tech-accent rounded-lg border border-tech-blue/30 w-full max-w-lg">
      <!-- Modal Header -->
      <div class="p-6 border-b border-tech-blue/20">
        <h2 class="text-2xl font-bold text-tech-green">Take Out Loan</h2>
        <p class="text-gray-400 text-sm mt-1">Secure funding for your business expansion</p>
      </div>
      
      <!-- Modal Body -->
      <div class="p-6 space-y-6">
        <!-- Loan Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Loan Amount
          </label>
          <input 
            type="number" 
            min="10000" 
            max="10000000"
            step="10000"
            bind:value={loanAmount}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          />
          <div class="text-sm text-gray-400 mt-1">
            Minimum: {formatMoney(10000)} • Maximum: {formatMoney(10000000)}
          </div>
        </div>
        
        <!-- Loan Term -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Loan Term
          </label>
          <select 
            bind:value={loanTerm}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          >
            {#each loanTerms as term}
              <option value={term.months}>
                {term.label} ({term.months} months)
              </option>
            {/each}
          </select>
        </div>
        
        <!-- Interest Rate -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Interest Rate
          </label>
          <select 
            bind:value={selectedRate}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          >
            {#each interestRates as rate}
              <option value={rate.rate}>
                {rate.label}
              </option>
            {/each}
          </select>
        </div>
        
        <!-- Loan Details -->
        <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
          <h3 class="text-tech-blue font-bold mb-3">Loan Details</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Principal Amount:</span>
              <span class="text-white">{formatMoney(loanAmount)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Monthly Payment:</span>
              <span class="text-tech-red font-medium">{formatMoney(monthlyPayment)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Total Interest:</span>
              <span class="text-tech-yellow">{formatMoney(totalInterest)}</span>
            </div>
            <div class="flex justify-between border-t border-tech-blue/20 pt-2">
              <span class="text-gray-300 font-medium">Total Repayment:</span>
              <span class="text-tech-red font-bold">{formatMoney(totalPayment)}</span>
            </div>
          </div>
        </div>
        
        <!-- Financial Impact -->
        {#if gameEngine?.player}
          <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
            <h3 class="text-tech-blue font-bold mb-2">Financial Impact</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Current Cash:</span>
                <span class="text-white">{formatMoney(gameEngine.player.cash)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">After Loan:</span>
                <span class="text-tech-green">{formatMoney(gameEngine.player.cash + loanAmount)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Monthly Debt Service:</span>
                <span class="text-tech-red">{formatMoney(monthlyPayment)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Debt-to-Cash Ratio:</span>
                <span class="text-white">
                  {((monthlyPayment / gameEngine.player.cash) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            
            {#if !canAfford}
              <div class="mt-2 text-tech-red text-sm">
                ⚠️ Monthly payment exceeds 10% of current cash - high risk!
              </div>
            {:else if monthlyPayment > gameEngine.player.cash * 0.05}
              <div class="mt-2 text-tech-yellow text-sm">
                ⚠️ Monthly payment is significant relative to cash reserves
              </div>
            {/if}
          </div>
        {/if}
      </div>
      
      <!-- Modal Footer -->
      <div class="p-6 border-t border-tech-blue/20 flex justify-end space-x-3">
        <button 
          on:click={handleCancel}
          class="btn-secondary px-4 py-2"
        >
          Cancel
        </button>
        <button 
          on:click={handleTakeLoan}
          disabled={!canTakeLoan}
          class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Take Loan
        </button>
      </div>
    </div>
  </div>
{/if} 