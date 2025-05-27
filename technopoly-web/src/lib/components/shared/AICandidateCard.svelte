<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let company;
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  $: acquisitionPrice = gameEngine ? gameEngine._calculateAcquisitionPrice(company) : 0;
  $: canAfford = gameEngine?.player ? gameEngine.player.cash >= acquisitionPrice : false;
  $: isTopGrowth = gameEngine ? gameEngine._isTargetInTop2Growth(company) : false;
  
  function handleInitiateAcquisition() {
    dispatch('initiateAcquisition', {
      targetCompany: company
    });
  }
  
  function getTierColor(tier) {
    switch (tier) {
      case 'Startup': return 'text-tech-green';
      case 'Medium': return 'text-tech-blue';
      case 'Large': return 'text-tech-yellow';
      case 'Big Tech': return 'text-tech-red';
      default: return 'text-white';
    }
  }
  
  function getTierBadgeColor(tier) {
    switch (tier) {
      case 'Startup': return 'bg-tech-green/20 border-tech-green/50 text-tech-green';
      case 'Medium': return 'bg-tech-blue/20 border-tech-blue/50 text-tech-blue';
      case 'Large': return 'bg-tech-yellow/20 border-tech-yellow/50 text-tech-yellow';
      case 'Big Tech': return 'bg-tech-red/20 border-tech-red/50 text-tech-red';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  }
</script>

<div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20 hover:border-tech-blue/40 transition-colors">
  <!-- Company Header -->
  <div class="flex justify-between items-start mb-4">
    <div>
      <h3 class="text-xl font-bold text-white mb-1">{company.name}</h3>
      <div class="flex items-center space-x-2">
        <span class="px-2 py-1 rounded text-xs font-medium border {getTierBadgeColor(company.tier)}">
          {company.tier}
        </span>
        {#if isTopGrowth}
          <span class="px-2 py-1 rounded text-xs font-medium border bg-tech-green/20 border-tech-green/50 text-tech-green">
            🚀 High Growth
          </span>
        {/if}
      </div>
    </div>
    <div class="text-right">
      <div class="text-tech-blue font-bold text-lg">{formatMoney(company.marketCap)}</div>
      <div class="text-gray-400 text-sm">Market Cap</div>
    </div>
  </div>
  
  <!-- Company Stats -->
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="bg-tech-accent/20 p-3 rounded">
      <div class="text-gray-400 text-sm">Revenue</div>
      <div class="text-white font-bold">{formatMoney(company.totalRevenueThisQuarter())}</div>
    </div>
    <div class="bg-tech-accent/20 p-3 rounded">
      <div class="text-gray-400 text-sm">Cash</div>
      <div class="text-tech-green font-bold">{formatMoney(company.cash)}</div>
    </div>
    <div class="bg-tech-accent/20 p-3 rounded">
      <div class="text-gray-400 text-sm">Employees</div>
      <div class="text-white font-bold">{company.employees}</div>
    </div>
    <div class="bg-tech-accent/20 p-3 rounded">
      <div class="text-gray-400 text-sm">Products</div>
      <div class="text-white font-bold">{Object.keys(company.products).length}</div>
    </div>
  </div>
  
  <!-- Products Overview -->
  <div class="mb-6">
    <h4 class="text-tech-green font-bold mb-2">Product Portfolio</h4>
    {#if Object.keys(company.products).length > 0}
      <div class="space-y-2">
        {#each Object.entries(company.products).slice(0, 3) as [productName, product]}
          <div class="flex justify-between items-center text-sm">
            <div>
              <span class="text-white font-medium">{productName}</span>
              <span class="text-gray-400 ml-2">({product.marketName})</span>
            </div>
            <div class="text-tech-green">{formatMoney(product.revenue)}</div>
          </div>
        {/each}
        {#if Object.keys(company.products).length > 3}
          <div class="text-gray-400 text-sm">
            +{Object.keys(company.products).length - 3} more products...
          </div>
        {/if}
      </div>
    {:else}
      <div class="text-gray-400 text-sm">No products</div>
    {/if}
  </div>
  
  <!-- Acquisition Details -->
  <div class="bg-tech-accent/20 p-4 rounded border border-tech-blue/20 mb-4">
    <h4 class="text-tech-blue font-bold mb-2">Acquisition Details</h4>
    <div class="space-y-1 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-400">Estimated Price:</span>
        <span class="text-white font-bold">{formatMoney(acquisitionPrice)}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Assets Value:</span>
        <span class="text-white">
          {formatMoney(Math.max(0, company.cash + company.bonds.reduce((sum, b) => sum + b.principal, 0) - company.loans.reduce((sum, l) => sum + l.principal, 0)))}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">Annual Revenue:</span>
        <span class="text-white">{formatMoney(company.totalRevenueThisQuarter() * 4)}</span>
      </div>
    </div>
  </div>
  
  <!-- Action Button -->
  <div class="space-y-2">
    {#if isTopGrowth}
      <div class="text-center p-3 bg-tech-yellow/20 border border-tech-yellow/50 rounded text-tech-yellow text-sm">
        ⚠️ Company protected by high growth - acquisition will be rejected
      </div>
    {:else if !canAfford}
      <div class="text-center p-3 bg-tech-red/20 border border-tech-red/50 rounded text-tech-red text-sm">
        💰 Insufficient funds for acquisition
      </div>
    {/if}
    
    <button 
      on:click={handleInitiateAcquisition}
      disabled={isTopGrowth || !canAfford}
      class="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if isTopGrowth}
        🚫 Protected by Growth
      {:else if !canAfford}
        💸 Cannot Afford
      {:else}
        🏢 Initiate Acquisition
      {/if}
    </button>
  </div>
</div> 