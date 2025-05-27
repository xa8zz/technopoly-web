<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let gameEngine;
  export let show = false;
  
  const dispatch = createEventDispatcher();
  
  let activeMarket = '';
  
  $: markets = gameEngine?.markets || [];
  $: player = gameEngine?.player;
  $: aiCompanies = gameEngine?.aiCompanies || [];
  $: allCompanies = player ? [player, ...aiCompanies] : aiCompanies;
  
  // Set default active market
  $: if (markets.length > 0 && !activeMarket) {
    activeMarket = markets[0].name;
  }
  
  // Get products for active market
  $: marketProducts = (() => {
    if (!activeMarket) return [];
    
    const products = [];
    
    // Add player products
    if (player) {
      Object.entries(player.products).forEach(([productName, product]) => {
        if (product.marketName === activeMarket) {
          products.push({
            name: productName,
            product,
            owner: player.name,
            ownerTier: 'Player',
            isPlayer: true
          });
        }
      });
    }
    
    // Add AI products
    aiCompanies.forEach(company => {
      Object.entries(company.products).forEach(([productName, product]) => {
        if (product.marketName === activeMarket) {
          products.push({
            name: productName,
            product,
            owner: company.name,
            ownerTier: company.tier,
            isPlayer: false
          });
        }
      });
    });
    
    // Sort by effectiveness (highest first)
    return products.sort((a, b) => b.product.effectiveness - a.product.effectiveness);
  })();
  
  $: activeMarketData = markets.find(m => m.name === activeMarket);
  
  function handleClose() {
    dispatch('close');
  }
  
  function handleKeydown(event) {
    if (event.key === 'Escape') {
      handleClose();
    }
  }
  
  function setActiveMarket(marketName) {
    activeMarket = marketName;
  }
  
  function getTierBadgeColor(tier) {
    switch (tier) {
      case 'Startup': return 'bg-tech-green/20 border-tech-green/50 text-tech-green';
      case 'Medium': return 'bg-tech-blue/20 border-tech-blue/50 text-tech-blue';
      case 'Large': return 'bg-tech-yellow/20 border-tech-yellow/50 text-tech-yellow';
      case 'Big Tech': return 'bg-tech-red/20 border-tech-red/50 text-tech-red';
      case 'Player': return 'bg-tech-green/20 border-tech-green/50 text-tech-green';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  }
  
  function getEffectivenessRating(effectiveness) {
    if (effectiveness >= 8) return { label: 'Excellent', color: 'text-tech-green' };
    if (effectiveness >= 6) return { label: 'Good', color: 'text-tech-blue' };
    if (effectiveness >= 4) return { label: 'Average', color: 'text-tech-yellow' };
    if (effectiveness >= 2) return { label: 'Poor', color: 'text-orange-400' };
    return { label: 'Very Poor', color: 'text-tech-red' };
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if show}
  <!-- Modal Backdrop -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <!-- Modal Content -->
    <div class="bg-tech-accent rounded-lg border border-tech-blue/30 w-full max-w-6xl max-h-[90vh] overflow-hidden">
      <!-- Modal Header -->
      <div class="p-6 border-b border-tech-blue/20">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-2xl font-bold text-tech-green">Market Rankings</h2>
            <p class="text-gray-400 text-sm mt-1">Product performance across all markets</p>
          </div>
          <button 
            on:click={handleClose}
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Market Tabs -->
      <div class="border-b border-tech-blue/20 bg-tech-accent/30">
        <div class="flex overflow-x-auto">
          {#each markets as market}
            <button
              on:click={() => setActiveMarket(market.name)}
                             class="px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                      {activeMarket === market.name 
                        ? 'border-tech-blue text-tech-blue' 
                        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}"
            >
              {market.name}
            </button>
          {/each}
        </div>
      </div>
      
      <!-- Modal Body -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
        {#if activeMarketData}
          <!-- Market Overview -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <div class="text-gray-400 text-sm">Market Size</div>
              <div class="text-white font-bold">{formatMoney(activeMarketData.size)}</div>
            </div>
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <div class="text-gray-400 text-sm">Growth Rate</div>
              <div class="text-white font-bold">
                {activeMarketData.isInGlobalRecession ? 
                  '📉 Recession' : 
                  `+${(activeMarketData.growthRate * 100).toFixed(1)}%`}
              </div>
            </div>
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <div class="text-gray-400 text-sm">Products</div>
              <div class="text-white font-bold">{marketProducts.length}</div>
            </div>
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <div class="text-gray-400 text-sm">Total Revenue</div>
              <div class="text-white font-bold">
                {formatMoney(marketProducts.reduce((sum, p) => sum + p.product.revenue, 0))}
              </div>
            </div>
          </div>
          
          <!-- Product Rankings -->
          {#if marketProducts.length > 0}
            <div class="bg-tech-dark rounded-lg border border-tech-blue/20 overflow-hidden">
              <div class="p-4 border-b border-tech-blue/20">
                <h3 class="text-tech-green font-bold">Product Rankings - {activeMarket}</h3>
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead class="bg-tech-accent/30">
                    <tr>
                      <th class="text-left p-4 text-gray-300 font-medium">Rank</th>
                      <th class="text-left p-4 text-gray-300 font-medium">Product</th>
                      <th class="text-left p-4 text-gray-300 font-medium">Owner</th>
                      <th class="text-right p-4 text-gray-300 font-medium">Revenue</th>
                      <th class="text-right p-4 text-gray-300 font-medium">Effectiveness</th>
                      <th class="text-right p-4 text-gray-300 font-medium">Market Share</th>
                      <th class="text-right p-4 text-gray-300 font-medium">Employees</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each marketProducts as productData, index}
                      {@const effectivenessRating = getEffectivenessRating(productData.product.effectiveness)}
                      {@const marketShare = activeMarketData.size > 0 ? (productData.product.revenue / activeMarketData.size) * 100 : 0}
                      <tr class="border-b border-tech-blue/10 hover:bg-tech-accent/10 transition-colors
                                 {productData.isPlayer ? 'bg-tech-blue/10' : ''}">
                        <td class="p-4">
                          <div class="flex items-center space-x-2">
                            <span class="text-white font-bold">#{index + 1}</span>
                            {#if index === 0}
                              <span class="text-tech-yellow">👑</span>
                            {:else if index === 1}
                              <span class="text-gray-300">🥈</span>
                            {:else if index === 2}
                              <span class="text-orange-400">🥉</span>
                            {/if}
                          </div>
                        </td>
                        <td class="p-4">
                          <span class="font-bold {productData.isPlayer ? 'text-tech-green' : 'text-white'}">
                            {productData.name}
                          </span>
                        </td>
                        <td class="p-4">
                          <div class="flex items-center space-x-2">
                            <span class="text-white">{productData.owner}</span>
                            <span class="px-2 py-1 rounded text-xs font-medium border {getTierBadgeColor(productData.ownerTier)}">
                              {productData.ownerTier}
                            </span>
                            {#if productData.isPlayer}
                              <span class="text-tech-green text-xs">(You)</span>
                            {/if}
                          </div>
                        </td>
                        <td class="p-4 text-right">
                          <span class="text-tech-green font-bold">{formatMoney(productData.product.revenue)}</span>
                        </td>
                        <td class="p-4 text-right">
                          <div class="text-right">
                            <div class="text-white font-bold">{productData.product.effectiveness.toFixed(2)}</div>
                            <div class="{effectivenessRating.color} text-xs">{effectivenessRating.label}</div>
                          </div>
                        </td>
                        <td class="p-4 text-right">
                          <span class="text-tech-blue font-bold">{marketShare.toFixed(1)}%</span>
                        </td>
                        <td class="p-4 text-right">
                          <div class="text-sm">
                            <div>R&D: {productData.product.assignedEmployees['r&d']}</div>
                            <div>Q&A: {productData.product.assignedEmployees['q&a']}</div>
                            <div>Mkt: {productData.product.assignedEmployees['marketing']}</div>
                          </div>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
            
            <!-- Market Analysis -->
            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h4 class="text-tech-blue font-bold mb-3">Market Leaders</h4>
                <div class="space-y-2 text-sm">
                  {#each marketProducts.slice(0, 3) as productData, index}
                    <div class="flex justify-between items-center">
                      <div class="flex items-center space-x-2">
                        <span class="text-gray-400">#{index + 1}</span>
                        <span class="text-white font-medium">{productData.name}</span>
                        {#if productData.isPlayer}
                          <span class="text-tech-green text-xs">(You)</span>
                        {/if}
                      </div>
                      <span class="text-tech-green">{formatMoney(productData.product.revenue)}</span>
                    </div>
                  {/each}
                </div>
              </div>
              
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h4 class="text-tech-blue font-bold mb-3">Your Performance</h4>
                {#if marketProducts.some(p => p.isPlayer)}
                  {@const playerProducts = marketProducts.filter(p => p.isPlayer)}
                  <div class="space-y-2 text-sm">
                    {#each playerProducts as productData}
                      {@const rank = marketProducts.findIndex(p => p.name === productData.name) + 1}
                      <div class="flex justify-between items-center">
                        <span class="text-tech-green font-medium">{productData.name}</span>
                        <span class="text-white">Rank #{rank}</span>
                      </div>
                    {/each}
                    <div class="pt-2 border-t border-tech-blue/20">
                      <div class="flex justify-between">
                        <span class="text-gray-400">Total Revenue:</span>
                        <span class="text-tech-green font-bold">
                          {formatMoney(playerProducts.reduce((sum, p) => sum + p.product.revenue, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                {:else}
                  <div class="text-gray-400 text-sm">
                    You don't have any products in this market yet.
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <div class="text-center py-16">
              <div class="text-6xl mb-4">📊</div>
              <h3 class="text-xl font-bold text-gray-300 mb-2">No Products in Market</h3>
              <p class="text-gray-400">This market doesn't have any products yet.</p>
            </div>
          {/if}
        {:else}
          <div class="text-center py-8">
            <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-tech-blue mx-auto mb-4"></div>
            <p>Loading market data...</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if} 