<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  import MarketRankingsModal from '../modals/MarketRankingsModal.svelte';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let showMarketRankingsModal = false;
  let sortBy = 'marketCap'; // marketCap, revenue, cash, employees, products
  let sortOrder = 'desc'; // asc, desc
  
  $: player = gameEngine?.player;
  $: aiCompanies = gameEngine?.aiCompanies || [];
  $: allCompanies = player ? [player, ...aiCompanies] : aiCompanies;
  
  // Calculate market dominance
  $: totalMarketCap = allCompanies.reduce((sum, c) => sum + c.marketCap, 0);
  $: playerMarketShare = player && totalMarketCap > 0 ? (player.marketCap / totalMarketCap) * 100 : 0;
  
  // Sort companies
  $: sortedCompanies = [...allCompanies].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'marketCap':
        aValue = a.marketCap;
        bValue = b.marketCap;
        break;
      case 'revenue':
        aValue = a.totalRevenueThisQuarter();
        bValue = b.totalRevenueThisQuarter();
        break;
      case 'cash':
        aValue = a.cash;
        bValue = b.cash;
        break;
      case 'employees':
        aValue = a.employees;
        bValue = b.employees;
        break;
      case 'products':
        aValue = Object.keys(a.products).length;
        bValue = Object.keys(b.products).length;
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      default:
        aValue = a.marketCap;
        bValue = b.marketCap;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  function handleSort(column) {
    if (sortBy === column) {
      sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      sortBy = column;
      sortOrder = 'desc';
    }
  }
  
  function getSortIcon(column) {
    if (sortBy !== column) return '↕️';
    return sortOrder === 'asc' ? '⬆️' : '⬇️';
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
  
  function openMarketRankingsModal() {
    showMarketRankingsModal = true;
  }
  
  function closeMarketRankingsModal() {
    showMarketRankingsModal = false;
  }
</script>

<div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-tech-green">Stock Market Overview</h2>
      <p class="text-gray-400 text-sm mt-1">Track all companies and market performance</p>
    </div>
    <button 
      on:click={openMarketRankingsModal}
      class="btn-primary px-4 py-2"
    >
      📊 Market Rankings
    </button>
  </div>
  
  {#if player}
    <!-- Market Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Total Market Cap</h3>
        <div class="text-2xl font-bold text-white mb-1">{formatMoney(totalMarketCap)}</div>
        <div class="text-gray-400 text-sm">All Companies</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Your Market Share</h3>
        <div class="text-2xl font-bold text-tech-green mb-1">{playerMarketShare.toFixed(1)}%</div>
        <div class="text-gray-400 text-sm">Market Dominance</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Active Companies</h3>
        <div class="text-2xl font-bold text-white mb-1">{allCompanies.length}</div>
        <div class="text-gray-400 text-sm">Including You</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Your Rank</h3>
        <div class="text-2xl font-bold text-tech-yellow mb-1">
          #{sortedCompanies.findIndex(c => c.name === player.name) + 1}
        </div>
        <div class="text-gray-400 text-sm">By Market Cap</div>
      </div>
    </div>
    
    <!-- Companies Table -->
    <div class="bg-tech-dark rounded-lg border border-tech-blue/20 overflow-hidden">
      <div class="p-4 border-b border-tech-blue/20">
        <h3 class="text-tech-green font-bold">Company Rankings</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-tech-accent/30">
            <tr>
              <th class="text-left p-4 text-gray-300 font-medium">Rank</th>
              <th 
                class="text-left p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                on:click={() => handleSort('name')}
              >
                Company {getSortIcon('name')}
              </th>
              <th class="text-left p-4 text-gray-300 font-medium">Tier</th>
              <th 
                class="text-right p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                on:click={() => handleSort('marketCap')}
              >
                Market Cap {getSortIcon('marketCap')}
              </th>
              <th 
                class="text-right p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                on:click={() => handleSort('revenue')}
              >
                Revenue {getSortIcon('revenue')}
              </th>
              <th 
                class="text-right p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                on:click={() => handleSort('cash')}
              >
                Cash {getSortIcon('cash')}
              </th>
              <th 
                class="text-right p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                on:click={() => handleSort('employees')}
              >
                Employees {getSortIcon('employees')}
              </th>
              <th 
                class="text-right p-4 text-gray-300 font-medium cursor-pointer hover:text-white transition-colors"
                on:click={() => handleSort('products')}
              >
                Products {getSortIcon('products')}
              </th>
            </tr>
          </thead>
          <tbody>
            {#each sortedCompanies as company, index}
              <tr class="border-b border-tech-blue/10 hover:bg-tech-accent/10 transition-colors
                         {company.name === player.name ? 'bg-tech-blue/10' : ''}">
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
                  <div class="flex items-center space-x-2">
                    <span class="font-bold {company.name === player.name ? 'text-tech-green' : 'text-white'}">
                      {company.name}
                    </span>
                    {#if company.name === player.name}
                      <span class="text-tech-green text-sm">(You)</span>
                    {/if}
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 rounded text-xs font-medium border {getTierBadgeColor(company.tier || 'Player')}">
                    {company.tier || 'Player'}
                  </span>
                </td>
                <td class="p-4 text-right">
                  <span class="font-bold text-tech-blue">{formatMoney(company.marketCap)}</span>
                </td>
                <td class="p-4 text-right">
                  <span class="text-white">{formatMoney(company.totalRevenueThisQuarter())}</span>
                </td>
                <td class="p-4 text-right">
                  <span class="text-tech-green">{formatMoney(company.cash)}</span>
                </td>
                <td class="p-4 text-right">
                  <span class="text-white">{company.employees}</span>
                </td>
                <td class="p-4 text-right">
                  <span class="text-white">{Object.keys(company.products).length}</span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Market Insights -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-4">Market Insights</h3>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Largest Company:</span>
            <span class="text-white font-medium">{sortedCompanies[0]?.name || 'N/A'}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Most Revenue:</span>
            <span class="text-white font-medium">
              {(() => {
                const topRevenue = [...allCompanies].sort((a, b) => b.totalRevenueThisQuarter() - a.totalRevenueThisQuarter())[0];
                return topRevenue?.name || 'N/A';
              })()}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Most Cash:</span>
            <span class="text-white font-medium">
              {(() => {
                const topCash = [...allCompanies].sort((a, b) => b.cash - a.cash)[0];
                return topCash?.name || 'N/A';
              })()}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Most Employees:</span>
            <span class="text-white font-medium">
              {(() => {
                const topEmployees = [...allCompanies].sort((a, b) => b.employees - a.employees)[0];
                return topEmployees?.name || 'N/A';
              })()}
            </span>
          </div>
        </div>
      </div>
      
      <div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-4">Victory Conditions</h3>
        <div class="space-y-3 text-sm">
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-400">Market Dominance:</span>
              <span class="text-white font-medium">{playerMarketShare.toFixed(1)}% / 70%</span>
            </div>
            <div class="w-full bg-tech-accent/30 rounded-full h-2">
              <div 
                class="bg-tech-green h-2 rounded-full transition-all duration-300"
                style="width: {Math.min(playerMarketShare, 70) / 70 * 100}%"
              ></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between mb-1">
              <span class="text-gray-400">Competitors Remaining:</span>
              <span class="text-white font-medium">{aiCompanies.length}</span>
            </div>
            <div class="text-gray-400 text-xs">Acquire all competitors to win</div>
          </div>
          {#if playerMarketShare >= 70}
            <div class="bg-tech-green/20 border border-tech-green/50 rounded p-3">
              <div class="text-tech-green font-bold">🎉 Victory Achieved!</div>
              <div class="text-tech-green text-xs">You control 70% of the market!</div>
            </div>
          {:else if aiCompanies.length === 0}
            <div class="bg-tech-green/20 border border-tech-green/50 rounded p-3">
              <div class="text-tech-green font-bold">🎉 Technopoly!</div>
              <div class="text-tech-green text-xs">You acquired all competitors!</div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-tech-blue mx-auto mb-4"></div>
      <p>Loading market data...</p>
    </div>
  {/if}
</div>

<!-- Market Rankings Modal -->
<MarketRankingsModal 
  {gameEngine}
  show={showMarketRankingsModal}
  on:close={closeMarketRankingsModal}
/> 