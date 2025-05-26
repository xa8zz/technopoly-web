<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../game/utils.js';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  $: player = gameEngine?.player;
  $: isVictory = gameEngine?.newsFeed?.some(news => news.includes('Technopoly!')) || false;
  
  function restart() {
    dispatch('restart');
  }
</script>

<div class="min-h-screen bg-tech-dark flex items-center justify-center p-8">
  <div class="max-w-2xl mx-auto text-center">
    <!-- Game Over Header -->
    <div class="mb-12">
      {#if isVictory}
        <h1 class="text-6xl font-black text-tech-green mb-4">🏆 VICTORY! 🏆</h1>
        <h2 class="text-3xl text-tech-blue mb-6">TECHNOPOLY ACHIEVED!</h2>
        <p class="text-xl text-gray-300">
          Congratulations! You've dominated the tech industry and achieved market supremacy.
        </p>
      {:else}
        <h1 class="text-6xl font-black text-tech-red mb-4">💸 GAME OVER 💸</h1>
        <h2 class="text-3xl text-gray-400 mb-6">Your company has failed</h2>
        <p class="text-xl text-gray-300">
          Your investors have shut you down due to poor financial performance.
        </p>
      {/if}
    </div>

    <!-- Final Stats -->
    {#if player}
      <div class="bg-tech-accent/20 rounded-lg p-8 border border-tech-blue/20 mb-8">
        <h3 class="text-2xl font-bold text-tech-blue mb-6">Final Company Stats</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <div class="bg-tech-dark p-4 rounded-lg">
              <h4 class="text-tech-green font-bold mb-2">Financial Performance</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Final Cash:</span>
                  <span class="{player.cash >= 0 ? 'text-tech-green' : 'text-tech-red'}">{formatMoney(player.cash)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Market Cap:</span>
                  <span class="text-tech-blue">{formatMoney(player.marketCap)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Final Revenue:</span>
                  <span class="text-white">{formatMoney(player.totalRevenueThisQuarter())}</span>
                </div>
                <div class="flex justify-between">
                  <span>Final Profit:</span>
                  <span class="{player.quarterlyProfit() >= 0 ? 'text-tech-green' : 'text-tech-red'}">{formatMoney(player.quarterlyProfit())}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="space-y-4">
            <div class="bg-tech-dark p-4 rounded-lg">
              <h4 class="text-tech-green font-bold mb-2">Company Scale</h4>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span>Employees:</span>
                  <span class="text-white">{player.employees}</span>
                </div>
                <div class="flex justify-between">
                  <span>Products:</span>
                  <span class="text-white">{Object.keys(player.products).length}</span>
                </div>
                <div class="flex justify-between">
                  <span>Campuses:</span>
                  <span class="text-white">{player.campuses.length}</span>
                </div>
                <div class="flex justify-between">
                  <span>Active Loans:</span>
                  <span class="text-tech-red">{player.loans.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Summary -->
        {#if Object.keys(player.products).length > 0}
          <div class="mt-6">
            <h4 class="text-tech-green font-bold mb-4">Your Products</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {#each Object.entries(player.products) as [productName, product]}
                <div class="bg-tech-dark p-3 rounded text-left">
                  <div class="font-medium text-tech-blue">{productName}</div>
                  <div class="text-sm text-gray-400">{product.marketName}</div>
                  <div class="text-sm">Revenue: <span class="text-tech-green">{formatMoney(product.revenue)}</span></div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Game Duration -->
    {#if gameEngine}
      <div class="mb-8">
        <div class="text-lg text-gray-400">
          Game Duration: <span class="text-white font-bold">{Math.floor(gameEngine.turnIndex / 4)} years, {gameEngine.turnIndex % 4} quarters</span>
        </div>
        <div class="text-sm text-gray-500">
          ({gameEngine.turnIndex} total turns played)
        </div>
      </div>
    {/if}

    <!-- Action Buttons -->
    <div class="space-y-4">
      <button 
        on:click={restart}
        class="btn-primary text-xl px-12 py-4 transform hover:scale-105 transition-all duration-200"
      >
        Play Again
      </button>
      
      <div class="text-sm text-gray-500">
        <p>Thank you for playing Technopoly!</p>
        {#if isVictory}
          <p class="mt-2 text-tech-green">🎉 You've mastered the art of tech entrepreneurship! 🎉</p>
        {:else}
          <p class="mt-2">Better luck next time! The tech industry is unforgiving.</p>
        {/if}
      </div>
    </div>
  </div>
</div> 