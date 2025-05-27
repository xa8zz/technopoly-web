<script>
  import { onMount } from 'svelte';
  import { BusinessGameEngine } from './lib/game/engine.js';
  import SplashScreen from './lib/components/SplashScreen.svelte';
  import PlayerSetup from './lib/components/PlayerSetup.svelte';
  import GameInterface from './lib/components/GameInterface.svelte';
  import GameOver from './lib/components/GameOver.svelte';

  let gameEngine = null;
  let gameState = 'splash'; // 'splash', 'setup', 'playing', 'gameover'
  let isLoading = false;

  onMount(() => {
    // Initialize the game engine
    gameEngine = new BusinessGameEngine();
    gameEngine.setupGame();
  });

  function startNewGame() {
    gameState = 'setup';
  }

  async function loadSavedGame() {
    try {
      isLoading = true;
      
      const savedData = localStorage.getItem('technopoly_save');
      if (!savedData) {
        console.error('No saved game found');
        isLoading = false;
        return;
      }

      const gameData = JSON.parse(savedData);
      
      // Import the necessary classes for fromJSON
      const { BusinessGameEngine } = await import('./lib/game/engine.js');
      const { EventManager } = await import('./lib/game/events.js');
      const { AIController } = await import('./lib/game/ai.js');
      
      // Create new instances of managers
      const eventManager = new EventManager([]);
      const aiController = new AIController(null);
      
      // Restore the game engine
      gameEngine = BusinessGameEngine.fromJSON(gameData, eventManager, aiController);
      
      // Update the reference in aiController
      aiController.engine = gameEngine;
      
      gameState = 'playing';
      isLoading = false;
    } catch (error) {
      console.error('Failed to load saved game:', error);
      isLoading = false;
      // Fall back to splash screen
      gameState = 'splash';
    }
  }

  function onPlayerSetupComplete(playerData) {
    isLoading = true;
    
    // Set up the player's company
    gameEngine.playerSetupCompany(
      playerData.companyName,
      playerData.marketName,
      playerData.productName
    );
    
    gameState = 'playing';
    isLoading = false;
  }

  function onGameOver() {
    gameState = 'gameover';
  }

  function restartGame() {
    // Create a new game engine
    gameEngine = new BusinessGameEngine();
    gameEngine.setupGame();
    gameState = 'splash';
  }
</script>

<main class="min-h-screen bg-tech-dark text-white">
  {#if isLoading}
    <div class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-tech-blue mx-auto mb-4"></div>
        <p class="text-xl">Initializing Technopoly...</p>
      </div>
    </div>
  {:else if gameState === 'splash'}
    <SplashScreen 
      on:startGame={startNewGame} 
      on:loadGame={loadSavedGame}
    />
  {:else if gameState === 'setup'}
    <PlayerSetup 
      {gameEngine} 
      on:setupComplete={(e) => onPlayerSetupComplete(e.detail)} 
    />
  {:else if gameState === 'playing'}
    <GameInterface 
      {gameEngine} 
      on:gameOver={onGameOver}
    />
  {:else if gameState === 'gameover'}
    <GameOver 
      {gameEngine}
      on:restart={restartGame}
    />
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Orbitron', monospace;
    background-color: #1a1a2e;
    color: white;
  }
</style> 