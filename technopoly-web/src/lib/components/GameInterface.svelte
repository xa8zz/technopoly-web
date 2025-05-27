<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../game/utils.js';
  import { fade, slide, scale } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import ProductsTab from './tabs/ProductsTab.svelte';
  import OperationsTab from './tabs/OperationsTab.svelte';
  import FinancesTab from './tabs/FinancesTab.svelte';
  import AcquisitionsTab from './tabs/AcquisitionsTab.svelte';
  import StockMarketTab from './tabs/StockMarketTab.svelte';
  import Tooltip from './shared/Tooltip.svelte';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let activeTab = 'summary';
  let processingTurn = false;
  let showSaveNotification = false;
  let showLoadNotification = false;
  let saveError = '';
  let loadError = '';
  let showKeyboardHelp = false;
  
  $: player = gameEngine?.player;
  $: currentDate = gameEngine ? gameEngine._getDate() : [2000, 1];
  
  async function nextTurn() {
    if (processingTurn || gameEngine.gameOver) return;
    
    console.log('Processing turn...', gameEngine.turnIndex);
    processingTurn = true;
    
    try {
      const oldTurnIndex = gameEngine.turnIndex;
      const oldCash = gameEngine.player.cash;
      const oldMarketCap = gameEngine.player.marketCap;
      
      await gameEngine.processTurn();
      
      console.log('Turn processed successfully!');
      console.log('Turn index:', oldTurnIndex, '->', gameEngine.turnIndex);
      console.log('Player cash:', formatMoney(oldCash), '->', formatMoney(gameEngine.player.cash));
      console.log('Player market cap:', formatMoney(oldMarketCap), '->', formatMoney(gameEngine.player.marketCap));
      console.log('News feed length:', gameEngine.newsFeed.length);
      console.log('AI companies:', gameEngine.aiCompanies.length);
      
      // Force Svelte reactivity by reassigning variables
      gameEngine = gameEngine;
      
      // Manually trigger reactive updates for key variables
      player = gameEngine.player;
      currentDate = gameEngine._getDate();
      
    } catch (error) {
      console.error('Error processing turn:', error);
      console.error('Error stack:', error.stack);
    } finally {
      processingTurn = false;
    }
    
    if (gameEngine.gameOver) {
      dispatch('gameOver');
    }
  }
  
  function setActiveTab(tab) {
    activeTab = tab;
  }

  function saveGame() {
    try {
      const gameData = gameEngine.toJSON();
      localStorage.setItem('technopoly_save', JSON.stringify(gameData));
      
      showSaveNotification = true;
      saveError = '';
      setTimeout(() => {
        showSaveNotification = false;
      }, 3000);
    } catch (error) {
      console.error('Failed to save game:', error);
      saveError = 'Failed to save game. Please try again.';
      setTimeout(() => {
        saveError = '';
      }, 5000);
    }
  }

  function loadGame() {
    try {
      const savedData = localStorage.getItem('technopoly_save');
      if (!savedData) {
        loadError = 'No saved game found.';
        setTimeout(() => {
          loadError = '';
        }, 5000);
        return;
      }

      const gameData = JSON.parse(savedData);
      
      // Import the necessary classes for fromJSON
      import('../game/engine.js').then(({ BusinessGameEngine }) => {
        import('../game/events.js').then(({ EventManager }) => {
          import('../game/ai.js').then(({ AIController }) => {
            try {
              // Create new instances of managers
              const eventManager = new EventManager([]);
              const aiController = new AIController(null);
              
              // Restore the game engine
              const restoredEngine = BusinessGameEngine.fromJSON(gameData, eventManager, aiController);
              
              // Update the reference in aiController
              aiController.engine = restoredEngine;
              
              // Replace the current game engine
              gameEngine = restoredEngine;
              
              showLoadNotification = true;
              loadError = '';
              setTimeout(() => {
                showLoadNotification = false;
              }, 3000);
              
              // Force Svelte to re-render everything
              activeTab = 'summary';
            } catch (error) {
              console.error('Failed to restore game:', error);
              loadError = 'Failed to load game. Save file may be corrupted.';
              setTimeout(() => {
                loadError = '';
              }, 5000);
            }
          });
        });
      });
    } catch (error) {
      console.error('Failed to load game:', error);
      loadError = 'Failed to load game. Save file may be corrupted.';
      setTimeout(() => {
        loadError = '';
      }, 5000);
    }
  }

  function hasSavedGame() {
    return localStorage.getItem('technopoly_save') !== null;
  }

  // Keyboard navigation support
  function handleKeydown(event) {
    // Ctrl/Cmd + S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      saveGame();
    }
    
    // Ctrl/Cmd + L to load
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault();
      if (hasSavedGame()) {
        loadGame();
      }
    }
    
    // Space or Enter to process next turn
    if ((event.key === ' ' || event.key === 'Enter') && !processingTurn && !gameEngine.gameOver) {
      event.preventDefault();
      nextTurn();
    }
    
    // Number keys to switch tabs
    const tabKeys = {
      '1': 'summary',
      '2': 'products', 
      '3': 'finances',
      '4': 'operations',
      '5': 'market',
      '6': 'acquisitions'
    };
    
    if (tabKeys[event.key]) {
      event.preventDefault();
      setActiveTab(tabKeys[event.key]);
    }
    
    // F1 or ? to show keyboard help
    if (event.key === 'F1' || event.key === '?') {
      event.preventDefault();
      showKeyboardHelp = !showKeyboardHelp;
    }
    
    // Escape to close help
    if (event.key === 'Escape' && showKeyboardHelp) {
      showKeyboardHelp = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

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
              <Tooltip text="Available cash for operations, hiring, and investments">
                <div class="text-gray-400">Cash</div>
                <div class="text-tech-green font-bold">{formatMoney(player.cash)}</div>
              </Tooltip>
            </div>
            <div class="text-center">
              <Tooltip text="Company valuation based on revenue, assets, and debt">
                <div class="text-gray-400">Market Cap</div>
                <div class="text-tech-blue font-bold">{formatMoney(player.marketCap)}</div>
              </Tooltip>
            </div>
            <div class="text-center">
              <Tooltip text="Current employees / Total capacity from all campuses">
                <div class="text-gray-400">Employees</div>
                <div class="text-white font-bold">{player.employees}/{player.employeeCapacity()}</div>
              </Tooltip>
            </div>
          </div>
        {/if}
        
        <div class="flex items-center space-x-3">
          <button 
            on:click={saveGame}
            class="btn-secondary px-4 py-2 text-sm transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
            title="Save Game"
          >
            💾 Save
          </button>
          
          <button 
            on:click={loadGame}
            disabled={!hasSavedGame()}
            class="btn-secondary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 hover:shadow-lg disabled:hover:scale-100"
            title="Load Game"
          >
            📁 Load
          </button>
          
          <button 
            on:click={() => showKeyboardHelp = !showKeyboardHelp}
            class="btn-secondary px-3 py-2 text-sm transform hover:scale-105 transition-all duration-200 hover:shadow-lg"
            title="Keyboard Shortcuts (F1)"
          >
            ❓
          </button>
          
          <button 
            on:click={nextTurn}
            disabled={processingTurn}
            class="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 hover:shadow-lg disabled:hover:scale-100"
          >
            {#if processingTurn}
              <span class="flex items-center space-x-2">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </span>
            {:else}
              Next Turn
            {/if}
          </button>
        </div>
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
        <div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20" 
             in:fade={{ duration: 300, easing: quintOut }}>
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
        
      {:else if activeTab === 'products'}
        <div in:fade={{ duration: 300, easing: quintOut }}>
          <ProductsTab {gameEngine} />
        </div>
        
      {:else if activeTab === 'operations'}
        <div in:fade={{ duration: 300, easing: quintOut }}>
          <OperationsTab {gameEngine} />
        </div>
        
      {:else if activeTab === 'finances'}
        <div in:fade={{ duration: 300, easing: quintOut }}>
          <FinancesTab {gameEngine} />
        </div>
        
      {:else if activeTab === 'acquisitions'}
        <div in:fade={{ duration: 300, easing: quintOut }}>
          <AcquisitionsTab {gameEngine} />
        </div>
        
      {:else if activeTab === 'market'}
        <div in:fade={{ duration: 300, easing: quintOut }}>
          <StockMarketTab {gameEngine} />
        </div>
        
              {:else}
        <!-- Placeholder for other tabs -->
        <div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20"
             in:fade={{ duration: 300, easing: quintOut }}>
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

  <!-- Notification Toasts -->
  {#if showSaveNotification}
    <div class="fixed top-4 right-4 bg-tech-green text-tech-dark px-6 py-3 rounded-lg shadow-lg z-50"
         in:scale={{ duration: 300, easing: quintOut }}
         out:fade={{ duration: 200 }}>
      <div class="flex items-center space-x-2">
        <span class="text-lg">✅</span>
        <span class="font-bold">Game Saved Successfully!</span>
      </div>
    </div>
  {/if}

  {#if showLoadNotification}
    <div class="fixed top-4 right-4 bg-tech-blue text-white px-6 py-3 rounded-lg shadow-lg z-50"
         in:scale={{ duration: 300, easing: quintOut }}
         out:fade={{ duration: 200 }}>
      <div class="flex items-center space-x-2">
        <span class="text-lg">📁</span>
        <span class="font-bold">Game Loaded Successfully!</span>
      </div>
    </div>
  {/if}

  {#if saveError}
    <div class="fixed top-4 right-4 bg-tech-red text-white px-6 py-3 rounded-lg shadow-lg z-50"
         in:scale={{ duration: 300, easing: quintOut }}
         out:fade={{ duration: 200 }}>
      <div class="flex items-center space-x-2">
        <span class="text-lg">❌</span>
        <span class="font-bold">{saveError}</span>
      </div>
    </div>
  {/if}

  {#if loadError}
    <div class="fixed top-4 right-4 bg-tech-red text-white px-6 py-3 rounded-lg shadow-lg z-50"
         in:scale={{ duration: 300, easing: quintOut }}
         out:fade={{ duration: 200 }}>
      <div class="flex items-center space-x-2">
        <span class="text-lg">❌</span>
        <span class="font-bold">{loadError}</span>
      </div>
    </div>
  {/if}

  <!-- Keyboard Help Modal -->
  {#if showKeyboardHelp}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
         in:fade={{ duration: 200 }}
         out:fade={{ duration: 200 }}>
      <div class="bg-tech-accent rounded-lg border border-tech-blue/30 w-full max-w-md"
           in:scale={{ duration: 300, easing: quintOut }}>
        <div class="p-6 border-b border-tech-blue/20">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold text-tech-green">Keyboard Shortcuts</h2>
            <button 
              on:click={() => showKeyboardHelp = false}
              class="text-gray-400 hover:text-white transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="space-y-2">
              <h3 class="font-bold text-tech-blue">Game Controls</h3>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-400">Next Turn:</span>
                  <span class="text-white font-mono">Space / Enter</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Save Game:</span>
                  <span class="text-white font-mono">Ctrl+S</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Load Game:</span>
                  <span class="text-white font-mono">Ctrl+L</span>
                </div>
              </div>
            </div>
            
            <div class="space-y-2">
              <h3 class="font-bold text-tech-blue">Navigation</h3>
              <div class="space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-400">Summary:</span>
                  <span class="text-white font-mono">1</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Products:</span>
                  <span class="text-white font-mono">2</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Finances:</span>
                  <span class="text-white font-mono">3</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Operations:</span>
                  <span class="text-white font-mono">4</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Stock Market:</span>
                  <span class="text-white font-mono">5</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">M&A:</span>
                  <span class="text-white font-mono">6</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="pt-4 border-t border-tech-blue/20">
            <div class="flex justify-between text-sm">
              <span class="text-gray-400">Show/Hide Help:</span>
              <span class="text-white font-mono">F1 / ?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div> 