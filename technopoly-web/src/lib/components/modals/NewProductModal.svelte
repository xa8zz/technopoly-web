<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let gameEngine;
  export let show = false;
  
  const dispatch = createEventDispatcher();
  
  let selectedMarket = '';
  let productName = '';
  let nameError = '';
  
  $: availableMarkets = gameEngine?.markets?.filter(market => 
    !gameEngine.player.products[productName] && 
    !Object.values(gameEngine.player.products).some(p => p.marketName === market.name)
  ) || [];
  
  $: launchCost = selectedMarket ? 50000 : 0; // Base cost for launching a product
  $: canAfford = gameEngine?.player?.cash >= launchCost;
  $: canLaunch = selectedMarket && productName.trim() && canAfford && !nameError;
  
  function validateProductName() {
    const trimmedName = productName.trim();
    if (!trimmedName) {
      nameError = '';
      return;
    }
    
    if (gameEngine.player.products[trimmedName]) {
      nameError = 'Product name already exists';
    } else if (trimmedName.length < 2) {
      nameError = 'Product name too short';
    } else if (trimmedName.length > 30) {
      nameError = 'Product name too long';
    } else {
      nameError = '';
    }
  }
  
  function handleLaunch() {
    if (!canLaunch) return;
    
    dispatch('launch', {
      marketName: selectedMarket,
      productName: productName.trim()
    });
    
    // Reset form
    selectedMarket = '';
    productName = '';
    nameError = '';
  }
  
  function handleCancel() {
    dispatch('cancel');
    selectedMarket = '';
    productName = '';
    nameError = '';
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
    <div class="bg-tech-accent rounded-lg border border-tech-blue/30 w-full max-w-md">
      <!-- Modal Header -->
      <div class="p-6 border-b border-tech-blue/20">
        <h2 class="text-2xl font-bold text-tech-green">Launch New Product</h2>
        <p class="text-gray-400 text-sm mt-1">Enter a new market with your innovative product</p>
      </div>
      
      <!-- Modal Body -->
      <div class="p-6 space-y-6">
        <!-- Market Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Target Market
          </label>
          <select 
            bind:value={selectedMarket}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          >
            <option value="">Select a market...</option>
            {#each availableMarkets as market}
              <option value={market.name}>
                {market.name} - {formatMoney(market.size)}
              </option>
            {/each}
          </select>
          {#if availableMarkets.length === 0}
            <p class="text-tech-yellow text-sm mt-1">
              ⚠️ No available markets. You already have products in all markets.
            </p>
          {/if}
        </div>
        
        <!-- Product Name -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Product Name
          </label>
          <input 
            type="text" 
            bind:value={productName}
            on:input={validateProductName}
            placeholder="Enter product name..."
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none
                   {nameError ? 'border-tech-red' : ''}"
          />
          {#if nameError}
            <p class="text-tech-red text-sm mt-1">{nameError}</p>
          {/if}
        </div>
        
        <!-- Cost Information -->
        <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
          <h3 class="text-tech-blue font-bold mb-2">Launch Costs</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Development & Setup:</span>
              <span class="text-white">{formatMoney(launchCost)}</span>
            </div>
            <div class="flex justify-between border-t border-tech-blue/20 pt-1">
              <span class="text-gray-300 font-medium">Total Cost:</span>
              <span class="text-tech-green font-bold">{formatMoney(launchCost)}</span>
            </div>
          </div>
          
          {#if gameEngine?.player}
            <div class="mt-3 pt-3 border-t border-tech-blue/20">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Current Cash:</span>
                <span class="text-white">{formatMoney(gameEngine.player.cash)}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">After Launch:</span>
                <span class="{canAfford ? 'text-tech-green' : 'text-tech-red'}">
                  {formatMoney(gameEngine.player.cash - launchCost)}
                </span>
              </div>
            </div>
          {/if}
          
          {#if !canAfford}
            <div class="mt-2 text-tech-red text-sm">
              ⚠️ Insufficient funds to launch this product
            </div>
          {/if}
        </div>
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
          on:click={handleLaunch}
          disabled={!canLaunch}
          class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Launch Product
        </button>
      </div>
    </div>
  </div>
{/if} 