<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  import TakeLoanModal from '../modals/TakeLoanModal.svelte';
  import BuyBondModal from '../modals/BuyBondModal.svelte';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let showTakeLoanModal = false;
  let showBuyBondModal = false;
  let notification = null;
  
  $: player = gameEngine?.player;
  $: totalLoanPayments = player ? player.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0) : 0;
  $: totalBondInterest = player ? player.bonds.reduce((sum, bond) => sum + (bond.principal * bond.rate / 4), 0) : 0;
  $: netCashFlow = totalBondInterest - totalLoanPayments;
  
  function handleTakeLoan(event) {
    const { amount, term, rate } = event.detail;
    
    const result = gameEngine.playerTakeLoan(amount, term, rate);
    
    if (result.success) {
      showNotification(`Successfully took out loan of ${formatMoney(amount)}!`, 'success');
      showTakeLoanModal = false;
      gameEngine = gameEngine; // Force reactivity
    } else {
      showNotification(result.error, 'error');
    }
  }
  
  function handleBuyBond(event) {
    const { amount, term, rate } = event.detail;
    
    const result = gameEngine.playerBuyBond(amount, term, rate);
    
    if (result.success) {
      showNotification(`Successfully purchased bond worth ${formatMoney(amount)}!`, 'success');
      showBuyBondModal = false;
      gameEngine = gameEngine; // Force reactivity
    } else {
      showNotification(result.error, 'error');
    }
  }
  
  function showNotification(message, type = 'info') {
    notification = { message, type };
    setTimeout(() => {
      notification = null;
    }, 3000);
  }
  
  function openTakeLoanModal() {
    showTakeLoanModal = true;
  }
  
  function closeTakeLoanModal() {
    showTakeLoanModal = false;
  }
  
  function openBuyBondModal() {
    showBuyBondModal = true;
  }
  
  function closeBuyBondModal() {
    showBuyBondModal = false;
  }
</script>

<div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-tech-green">Financial Management</h2>
      <p class="text-gray-400 text-sm mt-1">Manage loans, bonds, and cash flow</p>
    </div>
  </div>
  
  {#if player}
    <!-- Financial Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Cash Position</h3>
        <div class="text-2xl font-bold text-tech-green mb-1">{formatMoney(player.cash)}</div>
        <div class="text-gray-400 text-sm">Available Cash</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Loan Payments</h3>
        <div class="text-2xl font-bold text-tech-red mb-1">{formatMoney(totalLoanPayments)}</div>
        <div class="text-gray-400 text-sm">Monthly Debt Service</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Bond Income</h3>
        <div class="text-2xl font-bold text-tech-green mb-1">{formatMoney(totalBondInterest)}</div>
        <div class="text-gray-400 text-sm">Quarterly Interest</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Net Cash Flow</h3>
        <div class="text-2xl font-bold {netCashFlow >= 0 ? 'text-tech-green' : 'text-tech-red'} mb-1">
          {formatMoney(netCashFlow)}
        </div>
        <div class="text-gray-400 text-sm">Per Quarter</div>
      </div>
    </div>
    
    <!-- Loans and Bonds Management -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Loans Section -->
      <div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-tech-red font-bold">Outstanding Loans</h3>
          <button 
            on:click={openTakeLoanModal}
            class="btn-secondary px-4 py-2"
          >
            💰 Take Loan
          </button>
        </div>
        
        {#if player.loans.length > 0}
          <div class="space-y-3">
            {#each player.loans as loan, index}
              <div class="bg-tech-accent/20 p-4 rounded border border-tech-red/20">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-bold text-white">Loan #{index + 1}</h4>
                    <div class="text-sm text-gray-400">
                      {(loan.rate * 100).toFixed(1)}% APR • {loan.termMonths} months
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-tech-red font-bold">{formatMoney(loan.principal)}</div>
                    <div class="text-gray-400 text-sm">Principal</div>
                  </div>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Monthly Payment:</span>
                  <span class="text-tech-red font-medium">{formatMoney(loan.monthlyPayment)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Remaining:</span>
                  <span class="text-white">{loan.termMonths} months</span>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-2">💳</div>
            <p>No outstanding loans</p>
            <p class="text-sm mt-1">Take a loan to fund expansion</p>
          </div>
        {/if}
      </div>
      
      <!-- Bonds Section -->
      <div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-tech-green font-bold">Bond Portfolio</h3>
          <button 
            on:click={openBuyBondModal}
            class="btn-primary px-4 py-2"
          >
            📈 Buy Bond
          </button>
        </div>
        
        {#if player.bonds.length > 0}
          <div class="space-y-3">
            {#each player.bonds as bond, index}
              <div class="bg-tech-accent/20 p-4 rounded border border-tech-green/20">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <h4 class="font-bold text-white">Bond #{index + 1}</h4>
                    <div class="text-sm text-gray-400">
                      {(bond.rate * 100).toFixed(1)}% yield • {bond.termQuarters} quarters
                    </div>
                  </div>
                  <div class="text-right">
                    <div class="text-tech-green font-bold">{formatMoney(bond.principal)}</div>
                    <div class="text-gray-400 text-sm">Principal</div>
                  </div>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Quarterly Interest:</span>
                  <span class="text-tech-green font-medium">{formatMoney(bond.principal * bond.rate / 4)}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-400">Remaining:</span>
                  <span class="text-white">{bond.termQuarters} quarters</span>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-gray-400">
            <div class="text-4xl mb-2">📊</div>
            <p>No bond investments</p>
            <p class="text-sm mt-1">Buy bonds for steady income</p>
          </div>
        {/if}
      </div>
    </div>
    
    <!-- Financial Health Summary -->
    <div class="mt-8 bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
      <h3 class="text-tech-blue font-bold mb-4">Financial Health Analysis</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        <div>
          <div class="text-gray-400 mb-1">Debt-to-Cash Ratio</div>
          <div class="text-white font-bold">
            {player.cash > 0 ? ((player.loans.reduce((sum, l) => sum + l.principal, 0) / player.cash) * 100).toFixed(1) : 0}%
          </div>
        </div>
        <div>
          <div class="text-gray-400 mb-1">Investment Portfolio</div>
          <div class="text-white font-bold">
            {formatMoney(player.bonds.reduce((sum, b) => sum + b.principal, 0))}
          </div>
        </div>
        <div>
          <div class="text-gray-400 mb-1">Credit Rating</div>
          <div class="text-white font-bold">
            {#if player.loans.length === 0}
              <span class="text-tech-green">Excellent</span>
            {:else if totalLoanPayments < player.cash * 0.1}
              <span class="text-tech-blue">Good</span>
            {:else if totalLoanPayments < player.cash * 0.2}
              <span class="text-tech-yellow">Fair</span>
            {:else}
              <span class="text-tech-red">Poor</span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-tech-blue mx-auto mb-4"></div>
      <p>Loading financial data...</p>
    </div>
  {/if}
</div>

<!-- Notification -->
{#if notification}
  <div class="fixed top-4 right-4 z-50 p-4 rounded-lg border max-w-sm
              {notification.type === 'success' 
                ? 'bg-tech-green/20 border-tech-green text-tech-green' 
                : notification.type === 'error'
                ? 'bg-tech-red/20 border-tech-red text-tech-red'
                : 'bg-tech-blue/20 border-tech-blue text-tech-blue'}"
  >
    <div class="flex items-center space-x-2">
      <div class="text-lg">
        {#if notification.type === 'success'}✅
        {:else if notification.type === 'error'}❌
        {:else}ℹ️
        {/if}
      </div>
      <div class="text-sm">{notification.message}</div>
    </div>
  </div>
{/if}

<!-- Take Loan Modal -->
<TakeLoanModal 
  {gameEngine}
  show={showTakeLoanModal}
  on:takeLoan={handleTakeLoan}
  on:cancel={closeTakeLoanModal}
/>

<!-- Buy Bond Modal -->
<BuyBondModal 
  {gameEngine}
  show={showBuyBondModal}
  on:buyBond={handleBuyBond}
  on:cancel={closeBuyBondModal}
/> 