<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  
  export let product;
  export let productName;
  export let maxEmployees;
  
  const dispatch = createEventDispatcher();
  
  let rdEmployees = product.assignedEmployees['r&d'];
  let qaEmployees = product.assignedEmployees['q&a'];
  let marketingEmployees = product.assignedEmployees['marketing'];
  
  $: totalAssigned = rdEmployees + qaEmployees + marketingEmployees;
  $: canUpdate = totalAssigned <= maxEmployees && 
                 rdEmployees >= 0 && qaEmployees >= 0 && marketingEmployees >= 0;
  
  function updateAssignments() {
    if (!canUpdate) return;
    
    dispatch('updateEmployees', {
      productName,
      assignments: {
        'r&d': rdEmployees,
        'q&a': qaEmployees,
        'marketing': marketingEmployees
      }
    });
  }
  
  function resetAssignments() {
    rdEmployees = product.assignedEmployees['r&d'];
    qaEmployees = product.assignedEmployees['q&a'];
    marketingEmployees = product.assignedEmployees['marketing'];
  }
</script>

<div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20 hover:border-tech-blue/40 transition-colors">
  <!-- Product Header -->
  <div class="flex justify-between items-start mb-4">
    <div>
      <h3 class="text-xl font-bold text-tech-blue mb-1">{productName}</h3>
      <p class="text-gray-400 text-sm">Market: {product.marketName}</p>
    </div>
    <div class="text-right">
      <div class="text-tech-green font-bold text-lg">{formatMoney(product.revenue)}</div>
      <div class="text-gray-400 text-sm">Revenue</div>
    </div>
  </div>
  
  <!-- Product Stats -->
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="bg-tech-accent/20 p-3 rounded">
      <div class="text-gray-400 text-sm">Effectiveness</div>
      <div class="text-white font-bold">{product.effectiveness.toFixed(2)}</div>
    </div>
    <div class="bg-tech-accent/20 p-3 rounded">
      <div class="text-gray-400 text-sm">Market Share</div>
      <div class="text-white font-bold">{(product.marketShare * 100).toFixed(1)}%</div>
    </div>
  </div>
  
  <!-- Employee Assignments -->
  <div class="space-y-4">
    <h4 class="text-tech-green font-bold">Employee Assignments</h4>
    
    <div class="grid grid-cols-3 gap-4">
      <!-- R&D -->
      <div>
        <label class="block text-sm text-gray-400 mb-1">R&D</label>
        <input 
          type="number" 
          min="0" 
          max={maxEmployees}
          bind:value={rdEmployees}
          class="w-full bg-tech-accent/30 border border-tech-blue/30 rounded px-3 py-2 text-white
                 focus:border-tech-blue focus:outline-none"
        />
      </div>
      
      <!-- Q&A -->
      <div>
        <label class="block text-sm text-gray-400 mb-1">Q&A</label>
        <input 
          type="number" 
          min="0" 
          max={maxEmployees}
          bind:value={qaEmployees}
          class="w-full bg-tech-accent/30 border border-tech-blue/30 rounded px-3 py-2 text-white
                 focus:border-tech-blue focus:outline-none"
        />
      </div>
      
      <!-- Marketing -->
      <div>
        <label class="block text-sm text-gray-400 mb-1">Marketing</label>
        <input 
          type="number" 
          min="0" 
          max={maxEmployees}
          bind:value={marketingEmployees}
          class="w-full bg-tech-accent/30 border border-tech-blue/30 rounded px-3 py-2 text-white
                 focus:border-tech-blue focus:outline-none"
        />
      </div>
    </div>
    
    <!-- Assignment Summary -->
    <div class="flex justify-between items-center text-sm">
      <div class="text-gray-400">
        Total Assigned: <span class="{totalAssigned > maxEmployees ? 'text-tech-red' : 'text-white'}">{totalAssigned}</span> / {maxEmployees}
      </div>
      {#if totalAssigned > maxEmployees}
        <div class="text-tech-red text-xs">⚠️ Over capacity!</div>
      {/if}
    </div>
    
    <!-- Action Buttons -->
    <div class="flex space-x-3 pt-2">
      <button 
        on:click={updateAssignments}
        disabled={!canUpdate}
        class="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Update Assignments
      </button>
      <button 
        on:click={resetAssignments}
        class="btn-secondary px-4 py-2 text-sm"
      >
        Reset
      </button>
    </div>
  </div>
</div> 