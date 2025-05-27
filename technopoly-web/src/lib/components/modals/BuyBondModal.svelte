<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let gameEngine;
  export let show = false;
  
  const dispatch = createEventDispatcher();
  
  let bondAmount = 50000;
  let bondTerm = 8; // quarters
  let selectedYield = 0.04; // 4% annual yield
  
  // Available bond terms and yields
  const bondTerms = [
    { quarters: 4, label: '1 Year' },
    { quarters: 8, label: '2 Years' },
    { quarters: 12, label: '3 Years' },
    { quarters: 16, label: '4 Years' },
    { quarters: 20, label: '5 Years' }
  ];
  
  const bondYields = [
    { rate: 0.02, label: '2.0% Annual (Government Bonds)' },
    { rate: 0.04, label: '4.0% Annual (Corporate Bonds)' },
    { rate: 0.06, label: '6.0% Annual (High-Grade Corporate)' },
    { rate: 0.08, label: '8.0% Annual (High-Yield Bonds)' },
    { rate: 0.10, label: '10.0% Annual (Junk Bonds)' }
  ];
  
  $: quarterlyInterest = (bondAmount * selectedYield) / 4;
  $: totalInterest = quarterlyInterest * bondTerm;
  $: totalReturn = bondAmount + totalInterest;
  $: canAfford = gameEngine?.player ? bondAmount <= gameEngine.player.cash : false;
  $: canBuyBond = bondAmount > 0 && bondTerm > 0 && selectedYield > 0 && canAfford;
  
  function handleBuyBond() {
    if (!canBuyBond) return;
    
    dispatch('buyBond', {
      amount: bondAmount,
      term: bondTerm,
      rate: selectedYield
    });
    
    // Reset form
    bondAmount = 50000;
    bondTerm = 8;
    selectedYield = 0.04;
  }
  
  function handleCancel() {
    dispatch('cancel');
    bondAmount = 50000;
    bondTerm = 8;
    selectedYield = 0.04;
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
        <h2 class="text-2xl font-bold text-tech-green">Buy Bond</h2>
        <p class="text-gray-400 text-sm mt-1">Invest in bonds for steady quarterly income</p>
      </div>
      
      <!-- Modal Body -->
      <div class="p-6 space-y-6">
        <!-- Bond Amount -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Investment Amount
          </label>
          <input 
            type="number" 
            min="5000" 
            max="5000000"
            step="5000"
            bind:value={bondAmount}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          />
          <div class="text-sm text-gray-400 mt-1">
            Minimum: {formatMoney(5000)} • Maximum: {formatMoney(5000000)}
          </div>
        </div>
        
        <!-- Bond Term -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Investment Term
          </label>
          <select 
            bind:value={bondTerm}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          >
            {#each bondTerms as term}
              <option value={term.quarters}>
                {term.label} ({term.quarters} quarters)
              </option>
            {/each}
          </select>
        </div>
        
        <!-- Bond Yield -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Annual Yield
          </label>
          <select 
            bind:value={selectedYield}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          >
            {#each bondYields as bondYield}
              <option value={bondYield.rate}>
                {bondYield.label}
              </option>
            {/each}
          </select>
        </div>
        
        <!-- Bond Details -->
        <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
          <h3 class="text-tech-blue font-bold mb-3">Investment Details</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Principal Amount:</span>
              <span class="text-white">{formatMoney(bondAmount)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Quarterly Interest:</span>
              <span class="text-tech-green font-medium">{formatMoney(quarterlyInterest)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Total Interest:</span>
              <span class="text-tech-blue">{formatMoney(totalInterest)}</span>
            </div>
            <div class="flex justify-between border-t border-tech-blue/20 pt-2">
              <span class="text-gray-300 font-medium">Total Return:</span>
              <span class="text-tech-green font-bold">{formatMoney(totalReturn)}</span>
            </div>
          </div>
          
          <div class="mt-3 pt-3 border-t border-tech-blue/20">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Effective Annual Return:</span>
              <span class="text-tech-blue font-medium">
                {((totalInterest / bondAmount) * (4 / bondTerm) * 100).toFixed(2)}%
              </span>
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
                <span class="text-gray-400">After Purchase:</span>
                <span class="{canAfford ? 'text-tech-green' : 'text-tech-red'}">
                  {formatMoney(gameEngine.player.cash - bondAmount)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Portfolio Allocation:</span>
                <span class="text-white">
                  {((bondAmount / gameEngine.player.cash) * 100).toFixed(1)}% of cash
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Quarterly Income:</span>
                <span class="text-tech-green">{formatMoney(quarterlyInterest)}</span>
              </div>
            </div>
            
            {#if !canAfford}
              <div class="mt-2 text-tech-red text-sm">
                ⚠️ Insufficient funds to purchase this bond
              </div>
            {:else if bondAmount > gameEngine.player.cash * 0.5}
              <div class="mt-2 text-tech-yellow text-sm">
                ⚠️ This investment represents a large portion of your cash reserves
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
          on:click={handleBuyBond}
          disabled={!canBuyBond}
          class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Bond
        </button>
      </div>
    </div>
  </div>
{/if} 