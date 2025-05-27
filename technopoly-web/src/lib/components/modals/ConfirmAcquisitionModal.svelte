<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let gameEngine;
  export let targetCompany;
  export let show = false;
  
  const dispatch = createEventDispatcher();
  
  $: acquisitionPrice = targetCompany && gameEngine ? gameEngine._calculateAcquisitionPrice(targetCompany) : 0;
  $: canAfford = gameEngine?.player && targetCompany ? gameEngine.player.cash >= acquisitionPrice : false;
  $: netAssets = targetCompany ? Math.max(0, 
    targetCompany.cash + 
    targetCompany.bonds.reduce((sum, b) => sum + b.principal, 0) - 
    targetCompany.loans.reduce((sum, l) => sum + l.principal, 0)
  ) : 0;
  
  function handleConfirm() {
    if (!canAfford || !targetCompany) return;
    
    dispatch('confirmAcquisition', {
      targetName: targetCompany.name,
      price: acquisitionPrice
    });
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleCancel();
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

<svelte:window on:keydown={handleKeydown} />

{#if show && targetCompany}
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <!-- Modal Content -->
    <div class="bg-tech-accent rounded-lg border border-tech-blue/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="p-6 border-b border-tech-blue/20">
        <h2 class="text-2xl font-bold text-tech-green">Confirm Acquisition</h2>
        <p class="text-gray-400 text-sm mt-1">Review the details before submitting your offer</p>
      </div>
      
      <!-- Modal Body -->
      <div class="p-6 space-y-6">
        <!-- Target Company Overview -->
        <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-xl font-bold text-white mb-2">{targetCompany.name}</h3>
              <span class="px-2 py-1 rounded text-xs font-medium border {getTierBadgeColor(targetCompany.tier)}">
                {targetCompany.tier}
              </span>
            </div>
            <div class="text-right">
              <div class="text-tech-blue font-bold text-lg">{formatMoney(targetCompany.marketCap)}</div>
              <div class="text-gray-400 text-sm">Market Cap</div>
            </div>
          </div>
          
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-gray-400">Revenue</div>
              <div class="text-white font-bold">{formatMoney(targetCompany.totalRevenueThisQuarter())}</div>
            </div>
            <div>
              <div class="text-gray-400">Cash</div>
              <div class="text-tech-green font-bold">{formatMoney(targetCompany.cash)}</div>
            </div>
            <div>
              <div class="text-gray-400">Employees</div>
              <div class="text-white font-bold">{targetCompany.employees}</div>
            </div>
            <div>
              <div class="text-gray-400">Products</div>
              <div class="text-white font-bold">{Object.keys(targetCompany.products).length}</div>
            </div>
          </div>
        </div>
        
        <!-- Product Portfolio -->
        <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
          <h4 class="text-tech-green font-bold mb-3">Product Portfolio</h4>
          {#if Object.keys(targetCompany.products).length > 0}
            <div class="space-y-2">
              {#each Object.entries(targetCompany.products) as [productName, product]}
                <div class="flex justify-between items-center text-sm">
                  <div>
                    <span class="text-white font-medium">{productName}</span>
                    <span class="text-gray-400 ml-2">({product.marketName})</span>
                  </div>
                  <div class="text-tech-green">{formatMoney(product.revenue)}</div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-gray-400 text-sm">No products</div>
          {/if}
        </div>
        
        <!-- Financial Details -->
        <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
          <h4 class="text-tech-blue font-bold mb-3">Financial Analysis</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-400">Annual Revenue:</span>
              <span class="text-white">{formatMoney(targetCompany.totalRevenueThisQuarter() * 4)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Net Assets:</span>
              <span class="text-white">{formatMoney(netAssets)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Outstanding Loans:</span>
              <span class="text-tech-red">{formatMoney(targetCompany.loans.reduce((sum, l) => sum + l.principal, 0))}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">Bond Investments:</span>
              <span class="text-tech-green">{formatMoney(targetCompany.bonds.reduce((sum, b) => sum + b.principal, 0))}</span>
            </div>
            <div class="flex justify-between border-t border-tech-blue/20 pt-2">
              <span class="text-gray-300 font-medium">Acquisition Price:</span>
              <span class="text-tech-yellow font-bold">{formatMoney(acquisitionPrice)}</span>
            </div>
          </div>
        </div>
        
        <!-- Acquisition Impact -->
        {#if gameEngine?.player}
          <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
            <h4 class="text-tech-blue font-bold mb-3">Impact on Your Company</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <h5 class="text-tech-green font-medium">You Will Gain:</h5>
                <ul class="space-y-1 text-gray-300">
                  <li>• {formatMoney(targetCompany.cash)} in cash</li>
                  <li>• {targetCompany.employees} employees</li>
                  <li>• {Object.keys(targetCompany.products).length} products</li>
                  <li>• {targetCompany.campuses.length} campus{targetCompany.campuses.length === 1 ? '' : 'es'}</li>
                  <li>• {formatMoney(targetCompany.totalRevenueThisQuarter())} quarterly revenue</li>
                </ul>
              </div>
              <div class="space-y-2">
                <h5 class="text-tech-red font-medium">You Will Inherit:</h5>
                <ul class="space-y-1 text-gray-300">
                  <li>• {targetCompany.loans.length} loan{targetCompany.loans.length === 1 ? '' : 's'}</li>
                  <li>• {formatMoney(targetCompany.loans.reduce((sum, l) => sum + l.monthlyPayment, 0))} monthly debt</li>
                  <li>• Employee salary obligations</li>
                  <li>• Campus overhead costs</li>
                </ul>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t border-tech-blue/20">
              <div class="flex justify-between text-sm">
                <span class="text-gray-400">Your Cash After Acquisition:</span>
                <span class="{canAfford ? 'text-tech-green' : 'text-tech-red'} font-bold">
                  {formatMoney(gameEngine.player.cash - acquisitionPrice + targetCompany.cash)}
                </span>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Warning Messages -->
        {#if !canAfford}
          <div class="bg-tech-red/20 border border-tech-red/50 rounded p-4">
            <div class="flex items-center space-x-2">
              <div class="text-tech-red text-lg">⚠️</div>
              <div class="text-tech-red font-medium">Insufficient funds for this acquisition</div>
            </div>
          </div>
        {/if}
        
        <div class="bg-tech-yellow/20 border border-tech-yellow/50 rounded p-4">
          <div class="flex items-center space-x-2">
            <div class="text-tech-yellow text-lg">ℹ️</div>
            <div class="text-tech-yellow text-sm">
              Acquisition offers take one quarter to process. The target company may reject offers if they have high growth (>30% last quarter).
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal Footer -->
      <div class="p-6 border-t border-tech-blue/20 flex justify-end space-x-3">
        <button 
          on:click={handleCancel}
          class="btn-secondary px-6 py-2"
        >
          Cancel
        </button>
        <button 
          on:click={handleConfirm}
          disabled={!canAfford}
          class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Offer ({formatMoney(acquisitionPrice)})
        </button>
      </div>
    </div>
  </div>
{/if} 