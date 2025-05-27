<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let gameEngine;
  export let show = false;
  
  const dispatch = createEventDispatcher();
  
  let selectedCampusType = '';
  
  $: campusTypes = gameEngine?.CAMPUS_TYPES || {};
  $: availableCampusTypes = Object.entries(campusTypes).filter(([name, data]) => {
    // Filter out campus types the player already owns
    return !gameEngine?.player?.campuses?.some(campus => campus[0] === name);
  });
  
  $: selectedCampusData = selectedCampusType ? campusTypes[selectedCampusType] : null;
  $: canAfford = selectedCampusData ? gameEngine?.player?.cash >= selectedCampusData.cost : false;
  $: canBuy = selectedCampusType && canAfford;
  
  function handleBuy() {
    if (!canBuy) return;
    
    dispatch('buyCampus', {
      campusType: selectedCampusType
    });
    
    // Reset form
    selectedCampusType = '';
  }
  
  function handleCancel() {
    dispatch('cancel');
    selectedCampusType = '';
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
        <h2 class="text-2xl font-bold text-tech-green">Buy New Campus</h2>
        <p class="text-gray-400 text-sm mt-1">Expand your operations with a new facility</p>
      </div>
      
      <!-- Modal Body -->
      <div class="p-6 space-y-6">
        <!-- Campus Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Campus Type
          </label>
          <select 
            bind:value={selectedCampusType}
            class="w-full bg-tech-dark border border-tech-blue/30 rounded px-3 py-2 text-white
                   focus:border-tech-blue focus:outline-none"
          >
            <option value="">Select a campus type...</option>
            {#each availableCampusTypes as [name, data]}
              <option value={name}>
                {name} - {data.capacity} employees
              </option>
            {/each}
          </select>
          {#if availableCampusTypes.length === 0}
            <p class="text-tech-yellow text-sm mt-1">
              ⚠️ No available campus types. You already own all campus types.
            </p>
          {/if}
        </div>
        
        <!-- Campus Details -->
        {#if selectedCampusData}
          <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
            <h3 class="text-tech-blue font-bold mb-3">{selectedCampusType} Details</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Employee Capacity:</span>
                <span class="text-white">{selectedCampusData.capacity} employees</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Overhead Rate:</span>
                <span class="text-white">{(selectedCampusData.overhead * 100).toFixed(1)}% of cash</span>
              </div>
              <div class="flex justify-between border-t border-tech-blue/20 pt-2">
                <span class="text-gray-300 font-medium">Purchase Cost:</span>
                <span class="text-tech-green font-bold">{formatMoney(selectedCampusData.cost)}</span>
              </div>
            </div>
          </div>
        {/if}
        
        <!-- Cost Information -->
        {#if selectedCampusData && gameEngine?.player}
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
                  {formatMoney(gameEngine.player.cash - selectedCampusData.cost)}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Quarterly Overhead:</span>
                <span class="text-tech-yellow">
                  {formatMoney(selectedCampusData.overhead * gameEngine.player.cash)}
                </span>
              </div>
            </div>
            
            {#if !canAfford}
              <div class="mt-2 text-tech-red text-sm">
                ⚠️ Insufficient funds to purchase this campus
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
          on:click={handleBuy}
          disabled={!canBuy}
          class="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Buy Campus
        </button>
      </div>
    </div>
  </div>
{/if} 