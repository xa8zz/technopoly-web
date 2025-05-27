<script>
  import { createEventDispatcher } from 'svelte';
  import ProductCard from '../shared/ProductCard.svelte';
  import NewProductModal from '../modals/NewProductModal.svelte';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let showNewProductModal = false;
  let notification = null;
  
  $: player = gameEngine?.player;
  $: products = player ? Object.entries(player.products) : [];
  $: availableEmployees = player ? player.employees - getTotalAssignedEmployees() : 0;
  
  function getTotalAssignedEmployees() {
    if (!player) return 0;
    
    return Object.values(player.products).reduce((total, product) => {
      return total + 
        product.assignedEmployees['r&d'] + 
        product.assignedEmployees['q&a'] + 
        product.assignedEmployees['marketing'];
    }, 0);
  }
  
  function handleUpdateEmployees(event) {
    const { productName, assignments } = event.detail;
    
    const result = gameEngine.playerUpdateEmployeeAssignments(productName, assignments);
    
    if (result.success) {
      showNotification('Employee assignments updated successfully!', 'success');
      // Force reactivity update
      gameEngine = gameEngine;
    } else {
      showNotification(result.error, 'error');
    }
  }
  
  function handleLaunchProduct(event) {
    const { marketName, productName } = event.detail;
    
    const result = gameEngine.playerLaunchProduct(marketName, productName);
    
    if (result.success) {
      showNotification(`Successfully launched ${productName}!`, 'success');
      showNewProductModal = false;
      // Force reactivity update
      gameEngine = gameEngine;
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
  
  function openNewProductModal() {
    showNewProductModal = true;
  }
  
  function closeNewProductModal() {
    showNewProductModal = false;
  }
</script>

<div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-tech-green">Product Portfolio</h2>
      <p class="text-gray-400 text-sm mt-1">Manage your products and employee assignments</p>
    </div>
    <button 
      on:click={openNewProductModal}
      class="btn-primary px-4 py-2"
    >
      🚀 Launch New Product
    </button>
  </div>
  
  <!-- Employee Summary -->
  {#if player}
    <div class="bg-tech-dark p-4 rounded-lg mb-6 border border-tech-blue/20">
      <h3 class="text-tech-blue font-bold mb-3">Employee Overview</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div class="text-center">
          <div class="text-gray-400">Total Employees</div>
          <div class="text-white font-bold text-lg">{player.employees}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-400">Assigned</div>
          <div class="text-tech-yellow font-bold text-lg">{getTotalAssignedEmployees()}</div>
        </div>
        <div class="text-center">
          <div class="text-gray-400">Available</div>
          <div class="text-tech-green font-bold text-lg">{availableEmployees}</div>
        </div>
      </div>
      
      {#if availableEmployees < 0}
        <div class="mt-3 p-2 bg-tech-red/20 border border-tech-red/50 rounded text-tech-red text-sm">
          ⚠️ Warning: You have over-assigned employees! Some products may be less effective.
        </div>
      {/if}
    </div>
  {/if}
  
  <!-- Products Grid -->
  {#if products.length > 0}
    <div class="space-y-6">
      {#each products as [productName, product]}
        <ProductCard 
          {product}
          {productName}
          maxEmployees={player.employees}
          on:updateEmployees={handleUpdateEmployees}
        />
      {/each}
    </div>
  {:else}
    <!-- Empty State -->
    <div class="text-center py-16">
      <div class="text-6xl mb-4">📦</div>
      <h3 class="text-xl font-bold text-gray-300 mb-2">No Products Yet</h3>
      <p class="text-gray-400 mb-6">Launch your first product to start competing in the market!</p>
      <button 
        on:click={openNewProductModal}
        class="btn-primary px-6 py-3"
      >
        🚀 Launch Your First Product
      </button>
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

<!-- New Product Modal -->
<NewProductModal 
  {gameEngine}
  show={showNewProductModal}
  on:launch={handleLaunchProduct}
  on:cancel={closeNewProductModal}
/> 