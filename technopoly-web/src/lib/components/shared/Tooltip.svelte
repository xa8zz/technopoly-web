<script>
  export let text = '';
  export let position = 'top'; // top, bottom, left, right
  
  let showTooltip = false;
  let tooltipElement;
  
  function handleMouseEnter() {
    showTooltip = true;
  }
  
  function handleMouseLeave() {
    showTooltip = false;
  }
  
  $: positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };
  
  $: arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  };
</script>

<div 
  class="relative inline-block"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  role="tooltip"
>
  <slot />
  
  {#if showTooltip && text}
    <div 
      bind:this={tooltipElement}
      class="absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none {positionClasses[position]}"
      style="max-width: 250px; white-space: normal;"
    >
      {text}
      <div class="absolute w-0 h-0 border-4 {arrowClasses[position]}"></div>
    </div>
  {/if}
</div> 