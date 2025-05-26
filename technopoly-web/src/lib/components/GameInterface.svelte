<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../game/utils.js';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let activeTab = 'summary';
  let processingTurn = false;
  
  $: player = gameEngine?.player;
  $: currentDate = gameEngine ? gameEngine._getDate() : [2000, 1];
  
  async function nextTurn() {
    if (processingTurn || gameEngine.gameOver) return;
    
    processingTurn = true;
    await gameEngine.processTurn();
    processingTurn = false;
    
    if (gameEngine.gameOver) {
      dispatch('gameOver');
    }
  }
  
  function setActiveTab(tab) {
    activeTab = tab;
  }
</script>

<div class="min-h-screen bg-tech-dark text-white">
  <!-- Header -->
  <header class="bg-tech-accent border-b border-tech-blue/30 p-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-6">
        <h1 class="text-2xl font-bold text-tech-blue">TECHNOPOLY</h1>
        <div class="text-sm">
          <span class="text-tech-green">{player?.name || 'Loading...'}</span>
          <span class="text-gray-400 ml-4">Q{currentDate[1]} {currentDate[0]}</span>
        </div>
      </div>
      
      <div class="flex items-center space-x-6">
        {#if player}
          <div class="flex items-center space-x-4 text-sm">
            <div class="text-center">
              <div class="text-gray-400">Cash</div>
              <div class="text-tech-green font-bold">{formatMoney(player.cash)}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400">Market Cap</div>
              <div class="text-tech-blue font-bold">{formatMoney(player.marketCap)}</div>
            </div>
            <div class="text-center">
              <div class="text-gray-400">Employees</div>
              <div class="text-white font-bold">{player.employees}/{player.employeeCapacity()}</div>
            </div>
          </div>
        {/if}
        
        <button 
          on:click={nextTurn}
          disabled={processingTurn}
          class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {#if processingTurn}
            Processing...
          {:else}
            Next Turn
          {/if}
        </button>
      </div>
    </div>
  </header>

  <!-- Tab Navigation -->
  <nav class="bg-tech-accent/50 border-b border-tech-blue/20">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex space-x-8">
        {#each [
          ['summary', 'Summary'],
          ['products', 'Products'],
          ['finances', 'Finances'],
          ['operations', 'Operations'],
          ['market', 'Stock Market'],
          ['acquisitions', 'M&A']
        ] as [tabId, tabName]}
          <button
            on:click={() => setActiveTab(tabId)}
            class="py-4 px-2 border-b-2 text-sm font-medium transition-colors
                   {activeTab === tabId 
                     ? 'border-tech-blue text-tech-blue' 
                     : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'}"
          >
            {tabName}
          </button>
        {/each}
      </div>
    </div>
  </nav>

  <!-- Main Content Area -->
  <main class="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Main Tab Content -->
    <div class="lg:col-span-3">
      {#if activeTab === 'summary'}
        <div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
          <h2 class="text-2xl font-bold text-tech-green mb-6">Company Summary</h2>
          
          {#if player}
            <!-- Company Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div class="bg-tech-dark p-4 rounded-lg">
                <h3 class="text-tech-blue font-bold mb-2">Financial Health</h3>
                <div class="space-y-1 text-sm">
                  <div>Cash: <span class="text-tech-green">{formatMoney(player.cash)}</span></div>
                  <div>Market Cap: <span class="text-tech-blue">{formatMoney(player.marketCap)}</span></div>
                  <div>Revenue: <span class="text-white">{formatMoney(player.totalRevenueThisQuarter())}</span></div>
                  <div>Profit: <span class="{player.quarterlyProfit() >= 0 ? 'text-tech-green' : 'text-tech-red'}">{formatMoney(player.quarterlyProfit())}</span></div>
                </div>
              </div>
              
              <div class="bg-tech-dark p-4 rounded-lg">
                <h3 class="text-tech-blue font-bold mb-2">Operations</h3>
                <div class="space-y-1 text-sm">
                  <div>Employees: <span class="text-white">{player.employees}</span></div>
                  <div>Capacity: <span class="text-gray-400">{player.employeeCapacity()}</span></div>
                  <div>Products: <span class="text-white">{Object.keys(player.products).length}</span></div>
                  <div>Campuses: <span class="text-white">{player.campuses.length}</span></div>
                </div>
              </div>
              
              <div class="bg-tech-dark p-4 rounded-lg">
                <h3 class="text-tech-blue font-bold mb-2">Debt & Investments</h3>
                <div class="space-y-1 text-sm">
                  <div>Loans: <span class="text-tech-red">{player.loans.length}</span></div>
                  <div>Bonds: <span class="text-tech-green">{player.bonds.length}</span></div>
                  <div>Debt Payment: <span class="text-tech-red">{formatMoney(player.loans.reduce((sum, l) => sum + l.monthlyPayment, 0))}</span></div>
                </div>
              </div>
            </div>

            <!-- Products Overview -->
            <div class="mb-8">
              <h3 class="text-xl font-bold text-tech-green mb-4">Your Products</h3>
              {#if Object.keys(player.products).length > 0}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {#each Object.entries(player.products) as [productName, product]}
                    <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/10">
                      <h4 class="font-bold text-tech-blue mb-2">{productName}</h4>
                      <div class="text-sm space-y-1">
                        <div>Market: <span class="text-gray-300">{product.marketName}</span></div>
                        <div>Revenue: <span class="text-tech-green">{formatMoney(product.revenue)}</span></div>
                        <div>Effectiveness: <span class="text-white">{product.effectiveness.toFixed(2)}</span></div>
                        <div class="flex space-x-2 text-xs mt-2">
                          <span>R&D: {product.assignedEmployees['r&d']}</span>
                          <span>Q&A: {product.assignedEmployees['q&a']}</span>
                          <span>Marketing: {product.assignedEmployees['marketing']}</span>
                        </div>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-center py-8 text-gray-400">
                  <p>No products yet. Consider entering a new market!</p>
                </div>
              {/if}
            </div>
          {:else}
            <div class="text-center py-8">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-tech-blue mx-auto mb-4"></div>
              <p>Loading game data...</p>
            </div>
          {/if}
        </div>
        
      {:else}
        <!-- Placeholder for other tabs -->
        <div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
          <h2 class="text-2xl font-bold text-tech-green mb-6">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div class="text-center py-16 text-gray-400">
            <p>This tab is under development.</p>
            <p class="text-sm mt-2">Coming soon in the next update!</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Sidebar -->
    <div class="lg:col-span-1 space-y-6">
      <!-- News Feed -->
      <div class="bg-tech-accent/20 rounded-lg p-4 border border-tech-blue/20">
        <h3 class="text-lg font-bold text-tech-green mb-4">📰 News Feed</h3>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          {#if gameEngine?.newsFeed?.length > 0}
            {#each gameEngine.newsFeed.slice(-10).reverse() as news}
              <div class="text-sm p-2 bg-tech-dark rounded border-l-2 border-tech-blue">
                {news}
              </div>
            {/each}
          {:else}
            <div class="text-gray-400 text-sm italic">No news yet...</div>
          {/if}
        </div>
      </div>

      <!-- Competitor Activity -->
      <div class="bg-tech-accent/20 rounded-lg p-4 border border-tech-blue/20">
        <h3 class="text-lg font-bold text-tech-green mb-4">🏢 Competitor Moves</h3>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          {#if gameEngine?.competitorNewsFeed?.length > 0}
            {#each gameEngine.competitorNewsFeed.slice(-10).reverse() as news}
              <div class="text-sm p-2 bg-tech-dark rounded border-l-2 border-tech-yellow">
                {news}
              </div>
            {/each}
          {:else}
            <div class="text-gray-400 text-sm italic">No competitor activity yet...</div>
          {/if}
        </div>
      </div>

      <!-- Market Overview -->
      <div class="bg-tech-accent/20 rounded-lg p-4 border border-tech-blue/20">
        <h3 class="text-lg font-bold text-tech-green mb-4">📊 Markets</h3>
        <div class="space-y-2 max-h-64 overflow-y-auto">
          {#if gameEngine?.markets}
            {#each gameEngine.markets.slice(0, 8) as market}
              <div class="text-xs p-2 bg-tech-dark rounded">
                <div class="font-medium text-tech-blue">{market.name}</div>
                <div class="text-gray-400">
                  Size: {formatMoney(market.size)} 
                  {#if market.isInGlobalRecession}
                    <span class="text-tech-red">📉</span>
                  {:else}
                    <span class="text-tech-green">+{(market.growthRate * 100).toFixed(1)}%</span>
                  {/if}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </main>
</div> 