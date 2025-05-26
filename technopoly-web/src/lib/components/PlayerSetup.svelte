<script>
  import { createEventDispatcher } from 'svelte';
  import { formatMoney } from '../game/utils.js';
  
  export let gameEngine;
  
  const dispatch = createEventDispatcher();
  
  let companyName = '';
  let productName = '';
  let selectedMarket = '';
  let currentStep = 1;
  
  $: availableMarkets = gameEngine ? gameEngine.markets.slice(0, 8) : [];
  
  function nextStep() {
    if (currentStep < 3) {
      currentStep++;
    }
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
  
  function completeSetup() {
    if (companyName && productName && selectedMarket) {
      dispatch('setupComplete', {
        companyName,
        productName,
        marketName: selectedMarket
      });
    }
  }
  
  $: canProceed = currentStep === 1 ? companyName.trim() !== '' :
                  currentStep === 2 ? selectedMarket !== '' :
                  currentStep === 3 ? productName.trim() !== '' : false;
</script>

<div class="min-h-screen bg-tech-dark flex items-center justify-center p-8">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-5xl font-bold text-tech-blue mb-4">Setup Your Company</h1>
      <div class="flex justify-center space-x-4 mb-8">
        {#each [1, 2, 3] as step}
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        {step <= currentStep ? 'bg-tech-blue text-white' : 'bg-gray-600 text-gray-400'}">
              {step}
            </div>
            {#if step < 3}
              <div class="w-12 h-1 mx-2 {step < currentStep ? 'bg-tech-blue' : 'bg-gray-600'}"></div>
            {/if}
          </div>
        {/each}
      </div>
    </div>

    <!-- Step Content -->
    <div class="bg-tech-accent/20 rounded-lg p-8 border border-tech-blue/20">
      {#if currentStep === 1}
        <!-- Company Name -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-tech-green mb-6">Choose Your Company Name</h2>
          <p class="text-gray-400 mb-8">What will you call your tech startup?</p>
          
          <div class="mb-8">
            <input 
              type="text" 
              bind:value={companyName}
              placeholder="Enter company name..."
              class="w-full px-4 py-3 bg-tech-dark border border-tech-blue/30 rounded-lg text-white text-center text-xl
                     focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/50"
              maxlength="30"
            />
            <p class="text-sm text-gray-500 mt-2">{companyName.length}/30 characters</p>
          </div>
          
          <div class="text-sm text-gray-400">
            <p>💡 <strong>Tips:</strong></p>
            <p>• Choose something memorable and tech-oriented</p>
            <p>• Examples: "QuantumSoft", "NeuralDynamics", "CyberForge"</p>
          </div>
        </div>
        
      {:else if currentStep === 2}
        <!-- Market Selection -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-tech-green mb-6">Choose Your Starting Market</h2>
          <p class="text-gray-400 mb-8">Which technology market will you enter first?</p>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {#each availableMarkets as market}
              <button
                on:click={() => selectedMarket = market.name}
                class="p-4 rounded-lg border-2 text-left transition-all duration-200
                       {selectedMarket === market.name 
                         ? 'border-tech-blue bg-tech-blue/20 text-white' 
                         : 'border-gray-600 bg-tech-accent/10 text-gray-300 hover:border-tech-blue/50'}"
              >
                <h3 class="font-bold text-lg mb-2">{market.name}</h3>
                <p class="text-sm text-gray-400">Market Size: {formatMoney(market.size)}</p>
                <p class="text-sm text-gray-400">Growth: {(market.growthRate * 100).toFixed(1)}% per quarter</p>
              </button>
            {/each}
          </div>
          
          <div class="text-sm text-gray-400">
            <p>💡 <strong>Tips:</strong></p>
            <p>• Larger markets offer more opportunity but have more competition</p>
            <p>• Higher growth markets can provide faster expansion</p>
          </div>
        </div>
        
      {:else if currentStep === 3}
        <!-- Product Name -->
        <div class="text-center">
          <h2 class="text-2xl font-bold text-tech-green mb-6">Name Your First Product</h2>
          <p class="text-gray-400 mb-8">What will you call your product in the <span class="text-tech-blue">{selectedMarket}</span> market?</p>
          
          <div class="mb-8">
            <input 
              type="text" 
              bind:value={productName}
              placeholder="Enter product name..."
              class="w-full px-4 py-3 bg-tech-dark border border-tech-blue/30 rounded-lg text-white text-center text-xl
                     focus:border-tech-blue focus:outline-none focus:ring-2 focus:ring-tech-blue/50"
              maxlength="25"
            />
            <p class="text-sm text-gray-500 mt-2">{productName.length}/25 characters</p>
          </div>
          
          <div class="bg-tech-accent/20 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-bold text-tech-blue mb-4">Your Starting Setup:</h3>
            <div class="space-y-2 text-left">
              <p><span class="text-tech-green">Company:</span> {companyName}</p>
              <p><span class="text-tech-green">Market:</span> {selectedMarket}</p>
              <p><span class="text-tech-green">Product:</span> {productName || '[Enter product name]'}</p>
              <p><span class="text-tech-green">Starting Cash:</span> $1,000,000</p>
              <p><span class="text-tech-green">Employees:</span> 5</p>
              <p><span class="text-tech-green">Campus:</span> Garage (10 employee capacity)</p>
            </div>
          </div>
          
          <div class="text-sm text-gray-400">
            <p>💡 <strong>Tips:</strong></p>
            <p>• Product names should be relevant to your chosen market</p>
            <p>• You'll start with 2 R&D, 1 Q&A, and 2 Marketing employees assigned</p>
          </div>
        </div>
      {/if}
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-8">
      <button 
        on:click={prevStep}
        disabled={currentStep === 1}
        class="btn-secondary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Previous
      </button>
      
      {#if currentStep < 3}
        <button 
          on:click={nextStep}
          disabled={!canProceed}
          class="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next →
        </button>
      {:else}
        <button 
          on:click={completeSetup}
          disabled={!canProceed}
          class="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
        >
          Start Game! 🚀
        </button>
      {/if}
    </div>
  </div>
</div> 