<script>
  import { createEventDispatcher } from 'svelte';
  import TutorialScreen from './TutorialScreen.svelte';
  
  const dispatch = createEventDispatcher();
  
  let showTutorial = false;
  
  function startGame() {
    dispatch('startGame');
  }
  
  function showTutorialScreen() {
    showTutorial = true;
  }
  
  function hideTutorialScreen() {
    showTutorial = false;
  }

  function loadGame() {
    dispatch('loadGame');
  }

  function hasSavedGame() {
    return localStorage.getItem('technopoly_save') !== null;
  }
</script>

{#if showTutorial}
  <TutorialScreen on:back={hideTutorialScreen} />
{:else}
<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-tech-dark via-tech-accent to-tech-dark">
  <div class="text-center max-w-4xl mx-auto px-8">
    <!-- Logo/Title -->
    <div class="mb-12">
      <h1 class="text-8xl font-black text-tech-blue mb-4 tracking-wider">
        TECHNOPOLY
      </h1>
      <div class="h-1 w-64 bg-tech-green mx-auto mb-6"></div>
      <p class="text-2xl text-gray-300 font-light">
        Build Your Tech Empire
      </p>
    </div>

    <!-- Game Description -->
    <div class="mb-12 max-w-2xl mx-auto">
      <p class="text-lg text-gray-400 leading-relaxed mb-6">
        Welcome to the ultimate tech market simulation. Start with a garage startup and 
        build your way to becoming the dominant force in the technology industry.
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div class="bg-tech-accent/30 p-6 rounded-lg border border-tech-blue/20">
          <div class="text-tech-green text-3xl mb-2">🚀</div>
          <h3 class="text-tech-blue font-bold mb-2">Innovate</h3>
          <p class="text-sm text-gray-400">Develop cutting-edge products in AI, Cloud Computing, and more</p>
        </div>
        
        <div class="bg-tech-accent/30 p-6 rounded-lg border border-tech-blue/20">
          <div class="text-tech-green text-3xl mb-2">💼</div>
          <h3 class="text-tech-blue font-bold mb-2">Compete</h3>
          <p class="text-sm text-gray-400">Outmaneuver AI competitors in dynamic markets</p>
        </div>
        
        <div class="bg-tech-accent/30 p-6 rounded-lg border border-tech-blue/20">
          <div class="text-tech-green text-3xl mb-2">🏆</div>
          <h3 class="text-tech-blue font-bold mb-2">Dominate</h3>
          <p class="text-sm text-gray-400">Achieve 70% market share or acquire all competitors</p>
        </div>
      </div>
    </div>

    <!-- Start Button -->
    <div class="space-y-4">
      <button 
        on:click={startGame}
        class="btn-primary text-xl px-12 py-4 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-tech-blue/25"
      >
        Start New Game
      </button>
      
      {#if hasSavedGame()}
        <button 
          on:click={loadGame}
          class="btn-secondary text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200 bg-tech-green/20 border-tech-green/50 text-tech-green hover:bg-tech-green/30"
        >
          📁 Continue Game
        </button>
      {/if}
      
      <button 
        on:click={showTutorialScreen}
        class="btn-secondary text-lg px-8 py-3 transform hover:scale-105 transition-all duration-200"
      >
        📚 Tutorial
      </button>
      
      <div class="text-sm text-gray-500">
        <p>Web version of Technopoly v1.5</p>
        <p class="mt-2">Built with Svelte • Powered by JavaScript</p>
      </div>
    </div>
  </div>
</div>
{/if}

<style>
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(0, 102, 204, 0.3);
    }
    50% {
      box-shadow: 0 0 30px rgba(0, 102, 204, 0.6);
    }
  }
  
  .btn-primary {
    animation: pulse-glow 2s infinite;
  }
</style> 