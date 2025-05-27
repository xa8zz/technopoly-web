<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../../game/utils.js';
  import AICandidateCard from '../shared/AICandidateCard.svelte';
  import ConfirmAcquisitionModal from '../modals/ConfirmAcquisitionModal.svelte';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let showConfirmModal = false;
  let selectedTarget = null;
  let notification = null;
  
  $: player = gameEngine?.player;
  $: aiCompanies = gameEngine?.aiCompanies || [];
  $: pendingAcquisitions = gameEngine?.pendingAcquisitions || [];
  
  // Filter AI companies that can be acquired
  $: acquisitionCandidates = aiCompanies.filter(company => {
    // Can't acquire companies that are already being acquired
    const alreadyPending = pendingAcquisitions.some(acq => acq[1] === company.name);
    return !alreadyPending;
  }).sort((a, b) => a.marketCap - b.marketCap); // Sort by market cap (cheapest first)
  
  function handleInitiateAcquisition(event) {
    const { targetCompany } = event.detail;
    selectedTarget = targetCompany;
    showConfirmModal = true;
  }
  
  function handleConfirmAcquisition(event) {
    const { targetName, price } = event.detail;
    
    const result = gameEngine.playerInitiateAcquisition(targetName, price);
    
    if (result.success) {
      showNotification(`Acquisition offer submitted for ${targetName}!`, 'success');
      showConfirmModal = false;
      selectedTarget = null;
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
  
  function closeConfirmModal() {
    showConfirmModal = false;
    selectedTarget = null;
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
</script>

<div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <div>
      <h2 class="text-2xl font-bold text-tech-green">Mergers & Acquisitions</h2>
      <p class="text-gray-400 text-sm mt-1">Acquire competitors to expand your market presence</p>
    </div>
  </div>
  
  {#if player}
    <!-- M&A Overview -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Available Targets</h3>
        <div class="text-2xl font-bold text-white mb-1">{acquisitionCandidates.length}</div>
        <div class="text-gray-400 text-sm">Companies for Sale</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Pending Deals</h3>
        <div class="text-2xl font-bold text-tech-yellow mb-1">{pendingAcquisitions.length}</div>
        <div class="text-gray-400 text-sm">Awaiting Approval</div>
      </div>
      
      <div class="bg-tech-dark p-4 rounded-lg border border-tech-blue/20">
        <h3 class="text-tech-blue font-bold mb-2">Market Share</h3>
        <div class="text-2xl font-bold text-tech-green mb-1">
          {#if gameEngine}
            {(() => {
              const totalMarketCap = player.marketCap + aiCompanies.reduce((sum, c) => sum + c.marketCap, 0);
              return totalMarketCap > 0 ? ((player.marketCap / totalMarketCap) * 100).toFixed(1) : 0;
            })()}%
          {:else}
            0%
          {/if}
        </div>
        <div class="text-gray-400 text-sm">Your Dominance</div>
      </div>
    </div>
    
    <!-- Pending Acquisitions -->
    {#if pendingAcquisitions.length > 0}
      <div class="mb-8">
        <h3 class="text-xl font-bold text-tech-yellow mb-4">Pending Acquisitions</h3>
        <div class="space-y-3">
          {#each pendingAcquisitions as [buyer, targetName, price, turnSubmitted]}
            <div class="bg-tech-dark p-4 rounded-lg border border-tech-yellow/20">
              <div class="flex justify-between items-center">
                <div>
                  <h4 class="font-bold text-white">Acquiring {targetName}</h4>
                  <div class="text-sm text-gray-400">
                    Submitted Q{((gameEngine.turnIndex - turnSubmitted) + 1)} ago • Resolves next quarter
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-tech-yellow font-bold">{formatMoney(price)}</div>
                  <div class="text-gray-400 text-sm">Offer Price</div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- Acquisition Candidates -->
    <div>
      <h3 class="text-xl font-bold text-tech-green mb-4">Acquisition Targets</h3>
      
      {#if acquisitionCandidates.length > 0}
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {#each acquisitionCandidates as company}
            <AICandidateCard 
              {company}
              {gameEngine}
              on:initiateAcquisition={handleInitiateAcquisition}
            />
          {/each}
        </div>
      {:else}
        <div class="text-center py-16">
          <div class="text-6xl mb-4">🏢</div>
          <h3 class="text-xl font-bold text-gray-300 mb-2">No Available Targets</h3>
          <p class="text-gray-400 mb-4">All companies are either being acquired or protected by growth.</p>
          {#if pendingAcquisitions.length > 0}
            <p class="text-sm text-tech-yellow">Wait for pending acquisitions to complete.</p>
          {/if}
        </div>
      {/if}
    </div>
    
    <!-- M&A Strategy Tips -->
    <div class="mt-8 bg-tech-dark p-6 rounded-lg border border-tech-blue/20">
      <h3 class="text-tech-blue font-bold mb-4">M&A Strategy Guide</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
        <div>
          <h4 class="text-tech-green font-bold mb-2">Acquisition Benefits</h4>
          <ul class="space-y-1 text-gray-300">
            <li>• Gain competitor's products and revenue</li>
            <li>• Acquire employees and campuses</li>
            <li>• Eliminate competition in markets</li>
            <li>• Absorb cash and bond investments</li>
          </ul>
        </div>
        <div>
          <h4 class="text-tech-yellow font-bold mb-2">Acquisition Risks</h4>
          <ul class="space-y-1 text-gray-300">
            <li>• High upfront costs drain cash</li>
            <li>• Top-growth companies reject offers</li>
            <li>• One quarter delay for completion</li>
            <li>• Inherit target's debt obligations</li>
          </ul>
        </div>
      </div>
    </div>
  {:else}
    <div class="text-center py-8">
      <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-tech-blue mx-auto mb-4"></div>
      <p>Loading M&A data...</p>
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

<!-- Confirm Acquisition Modal -->
<ConfirmAcquisitionModal 
  {gameEngine}
  targetCompany={selectedTarget}
  show={showConfirmModal}
  on:confirmAcquisition={handleConfirmAcquisition}
  on:cancel={closeConfirmModal}
/> 