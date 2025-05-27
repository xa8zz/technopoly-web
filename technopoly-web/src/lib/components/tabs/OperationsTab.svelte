<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  import BuyCampusModal from '../modals/BuyCampusModal.svelte';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let showBuyCampusModal = false;
  let notification = null;
  let hireCount = 0;
  let fireCount = 0;
  
  $: player = gameEngine?.player;
  $: employeeCost = player ? player.employees * 15000 : 0; // $15k per employee per quarter
  $: campusOverhead = player ? player.campuses.reduce((sum, campus) => sum + campus[2] * player.cash, 0) : 0;
  $: totalOperatingCosts = employeeCost + campusOverhead;
  
  function handleHireEmployees() {
    if (hireCount <= 0) return;
    
    const result = gameEngine.playerHireEmployees(hireCount);
    
    if (result.success) {
      showNotification(`Successfully hired ${hireCount} employees!`, 'success');
      hireCount = 0;
      gameEngine = gameEngine; // Force reactivity
    } else {
      showNotification(result.error, 'error');
    }
  }
  
  function handleFireEmployees() {
    if (fireCount <= 0) return;
    
    const result = gameEngine.playerFireEmployees(fireCount);
    
    if (result.success) {
      showNotification(`Fired ${fireCount} employees. Severance paid: ${formatMoney(result.severancePaid)}`, 'success');
      fireCount = 0;
      gameEngine = gameEngine; // Force reactivity
    } else {
      showNotification(result.error, 'error');
    }
  }
  
  function handleBuyCampus(event) {
    const { campusType } = event.detail;
    
    const result = gameEngine.playerBuyCampus(campusType);
    
    if (result.success) {
      showNotification(`Successfully purchased ${campusType}!`, 'success');
      showBuyCampusModal = false;
      gameEngine = gameEngine; // Force reactivity
    } else {
      showNotification(result.error, 'error');
    }
  }
  
  function showNotification(message, type = 'info') {
    notification = { message, type };
    setTimeout(() => {
      notification = null;
    }, 3000);
  }
  
  function openBuyCampusModal() {
    showBuyCampusModal = true;
  }
  
  function closeBuyCampusModal() {
    showBuyCampusModal = false;
  }
</script>

<div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-tech-green">Operations Management</h2>
      <p class="text-gray-400 text-sm mt-1">Manage employees, campuses, and operational costs</p>
    </div>
  </div>
  
  {#if player}
    <!-- Operations Overview -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Workforce</h3>
        <div class="text-2xl font-bold text-white mb-1">{player.employees}</div>
        <div class="text-gray-400 text-sm">Total Employees</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Capacity</h3>
        <div class="text-2xl font-bold text-tech-green mb-1">{player.employeeCapacity()}</div>
        <div class="text-gray-400 text-sm">Max Employees</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Employee Costs</h3>
        <div class="text-2xl font-bold text-tech-red mb-1">{formatMoney(employeeCost)}</div>
        <div class="text-gray-400 text-sm">Per Quarter</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Campus Overhead</h3>
        <div class="text-2xl font-bold text-tech-yellow mb-1">{formatMoney(campusOverhead)}</div>
        <div class="text-gray-400 text-sm">Per Quarter</div>
      </div>
    </div>
    
    <!-- Employee Management -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <!-- Hire Employees -->
      <div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-green font-bold mb-4">Hire Employees</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">Number to Hire</label>
            <input 
              type="number" 
              min="0" 
              max="50"
              bind:value={hireCount}
              class="w-full bg-tech-accent/30 border border-tech-blue/30 rounded px-3 py-2 text-white
                     focus:border-tech-blue focus:outline-none"
            />
          </div>
          
          {#if hireCount > 0}
            <div class="bg-tech-accent/20 p-3 rounded border border-tech-blue/20">
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-400">Hiring Cost:</span>
                  <span class="text-white">{formatMoney(hireCount * 10000)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Quarterly Salary:</span>
                  <span class="text-white">{formatMoney(hireCount * 15000)}</span>
                </div>
                <div class="flex justify-between border-t border-tech-blue/20 pt-1">
                  <span class="text-gray-300 font-medium">Total Cost:</span>
                  <span class="text-tech-red font-bold">{formatMoney(hireCount * 25000)}</span>
                </div>
              </div>
              
              {#if player.cash < hireCount * 10000}
                <div class="mt-2 text-tech-red text-sm">
                  ⚠️ Insufficient funds for hiring cost
                </div>
              {/if}
            </div>
          {/if}
          
          <button 
            on:click={handleHireEmployees}
            disabled={hireCount <= 0 || player.cash < hireCount * 10000}
            class="w-full btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hire {hireCount || 0} Employee{hireCount === 1 ? '' : 's'}
          </button>
        </div>
      </div>
      
      <!-- Fire Employees -->
      <div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-red font-bold mb-4">Fire Employees</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-400 mb-2">Number to Fire</label>
            <input 
              type="number" 
              min="0" 
              max={player.employees}
              bind:value={fireCount}
              class="w-full bg-tech-accent/30 border border-tech-blue/30 rounded px-3 py-2 text-white
                     focus:border-tech-blue focus:outline-none"
            />
          </div>
          
          {#if fireCount > 0}
            <div class="bg-tech-accent/20 p-3 rounded border border-tech-red/20">
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span class="text-gray-400">Severance Pay:</span>
                  <span class="text-tech-red">{formatMoney(fireCount * 7500)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Quarterly Savings:</span>
                  <span class="text-tech-green">{formatMoney(fireCount * 15000)}</span>
                </div>
              </div>
              
              {#if player.cash < fireCount * 7500}
                <div class="mt-2 text-tech-red text-sm">
                  ⚠️ Insufficient funds for severance pay
                </div>
              {/if}
            </div>
          {/if}
          
          <button 
            on:click={handleFireEmployees}
            disabled={fireCount <= 0 || fireCount > player.employees || player.cash < fireCount * 7500}
            class="w-full btn-secondary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Fire {fireCount || 0} Employee{fireCount === 1 ? '' : 's'}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Campus Management -->
    <div class="bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-tech-green font-bold">Campus Portfolio</h3>
        <button 
          on:click={openBuyCampusModal}
          class="btn-primary px-4 py-2"
        >
          🏢 Buy New Campus
        </button>
      </div>
      
      {#if player.campuses.length > 0}
        <div class="space-y-3">
          {#each player.campuses as campus, index}
            <div class="bg-tech-accent/20 p-4 rounded border border-tech-blue/20">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-bold text-tech-blue">{campus[0]}</h4>
                  <div class="text-sm text-gray-400">
                    Capacity: {campus[3]} employees
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-white font-bold">{formatMoney(campus[1])}</div>
                  <div class="text-gray-400 text-sm">
                    {(campus[2] * 100).toFixed(1)}% overhead
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="text-center py-8 text-gray-400">
          <p>No campuses owned</p>
        </div>
      {/if}
    </div>
  {:else}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-tech-blue mx-auto mb-4"></div>
      <p>Loading operations data...</p>
    </div>
  {/if}
</div>

<!-- Notification -->
{#if notification}
  <div class="fixed top-4 right-4 z-50 p-4 rounded-lg border max-w-sm
              {notification.type === 'success' 
                ? 'bg-tech-green/20 border-tech-green text-tech-green' 
                : notification.type === 'error'
                ? 'bg-tech-red/20 border-tech-red text-tech-red'
                : 'bg-tech-blue/20 border-tech-blue text-tech-blue'}"
  >
    <div class="flex items-center space-x-2">
      <div class="text-lg">
        {#if notification.type === 'success'}✅
        {:else if notification.type === 'error'}❌
        {:else}ℹ️
        {/if}
      </div>
      <div class="text-sm">{notification.message}</div>
    </div>
  </div>
{/if}

<!-- Buy Campus Modal -->
<BuyCampusModal 
  {gameEngine}
  show={showBuyCampusModal}
  on:buyCampus={handleBuyCampus}
  on:cancel={closeBuyCampusModal}
/> 