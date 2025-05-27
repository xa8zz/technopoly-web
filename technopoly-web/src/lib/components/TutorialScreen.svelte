<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  let activeSection = 'overview';
  
  const sections = [
    { id: 'overview', title: 'Game Overview', icon: '🎯' },
    { id: 'products', title: 'Products & Markets', icon: '📱' },
    { id: 'operations', title: 'Operations', icon: '🏢' },
    { id: 'finances', title: 'Finances', icon: '💰' },
    { id: 'acquisitions', title: 'M&A', icon: '🤝' },
    { id: 'strategy', title: 'Strategy Tips', icon: '🧠' }
  ];
  
  function setActiveSection(sectionId) {
    activeSection = sectionId;
  }
  
  function goBack() {
    dispatch('back');
  }
</script>

<div class="min-h-screen bg-tech-dark text-white">
  <!-- Header -->
  <header class="bg-tech-accent border-b border-tech-blue/30 p-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button 
          on:click={goBack}
          class="btn-secondary px-4 py-2"
        >
          ← Back to Menu
        </button>
        <h1 class="text-2xl font-bold text-tech-blue">TECHNOPOLY TUTORIAL</h1>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
    <!-- Sidebar Navigation -->
    <div class="lg:col-span-1">
      <div class="bg-tech-accent/20 rounded-lg p-4 border border-tech-blue/20 sticky top-4">
        <h3 class="text-tech-green font-bold mb-4">Tutorial Sections</h3>
        <nav class="space-y-2">
          {#each sections as section}
            <button
              on:click={() => setActiveSection(section.id)}
              class="w-full text-left p-3 rounded transition-colors
                     {activeSection === section.id 
                       ? 'bg-tech-blue/20 border border-tech-blue/50 text-tech-blue' 
                       : 'hover:bg-tech-accent/30 text-gray-300'}"
            >
              <div class="flex items-center space-x-3">
                <span class="text-lg">{section.icon}</span>
                <span class="font-medium">{section.title}</span>
              </div>
            </button>
          {/each}
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="lg:col-span-3">
      <div class="bg-tech-accent/20 rounded-lg p-6 border border-tech-blue/20">
        
        {#if activeSection === 'overview'}
          <div class="space-y-6">
            <div>
              <h2 class="text-3xl font-bold text-tech-green mb-4">🎯 Welcome to Technopoly</h2>
              <p class="text-gray-300 text-lg leading-relaxed">
                Technopoly is a business simulation game where you build and manage a technology company. 
                Your goal is to dominate the market by developing innovative products, managing operations, 
                and strategically acquiring competitors.
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">🏆 Victory Conditions</h3>
                <ul class="space-y-2 text-gray-300">
                  <li>• Control 70% of total market capitalization</li>
                  <li>• Acquire all competitor companies</li>
                  <li>• Avoid bankruptcy (negative cash for 4 quarters)</li>
                </ul>
              </div>
              
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">⏰ Game Flow</h3>
                <ul class="space-y-2 text-gray-300">
                  <li>• Each turn represents one business quarter</li>
                  <li>• AI competitors act automatically</li>
                  <li>• Markets grow and change over time</li>
                  <li>• New companies and markets spawn periodically</li>
                </ul>
              </div>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">📊 Key Metrics</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 class="text-tech-green font-medium mb-2">Cash</h4>
                  <p class="text-gray-300">Your available funds for operations, hiring, and investments.</p>
                </div>
                <div>
                  <h4 class="text-tech-green font-medium mb-2">Market Cap</h4>
                  <p class="text-gray-300">Your company's total value based on revenue and assets.</p>
                </div>
                <div>
                  <h4 class="text-tech-green font-medium mb-2">Revenue</h4>
                  <p class="text-gray-300">Quarterly income from all your products combined.</p>
                </div>
              </div>
            </div>
          </div>
          
        {:else if activeSection === 'products'}
          <div class="space-y-6">
            <div>
              <h2 class="text-3xl font-bold text-tech-green mb-4">📱 Products & Markets</h2>
              <p class="text-gray-300 text-lg leading-relaxed">
                Products are the core of your business. Each product competes in a specific market 
                and generates revenue based on its effectiveness and market share.
              </p>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">🚀 Launching Products</h3>
              <ul class="space-y-2 text-gray-300">
                <li>• Cost: $50,000 per new product launch</li>
                <li>• You can only have one product per market</li>
                <li>• Choose markets with high growth rates for better returns</li>
                <li>• New products start with zero revenue and effectiveness</li>
              </ul>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">👥 Employee Assignments</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 class="text-tech-green font-medium mb-2">R&D (Research & Development)</h4>
                  <p class="text-gray-300 text-sm">Improves product quality and effectiveness over time.</p>
                </div>
                <div>
                  <h4 class="text-tech-green font-medium mb-2">Q&A (Quality Assurance)</h4>
                  <p class="text-gray-300 text-sm">Ensures product reliability and customer satisfaction.</p>
                </div>
                <div>
                  <h4 class="text-tech-green font-medium mb-2">Marketing</h4>
                  <p class="text-gray-300 text-sm">Increases market awareness and customer acquisition.</p>
                </div>
              </div>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">📈 Market Dynamics</h3>
              <ul class="space-y-2 text-gray-300">
                <li>• Markets grow at different rates (typically 8-15% annually)</li>
                <li>• Revenue is redistributed each quarter based on effectiveness</li>
                <li>• 8% of revenue is lost to churn and redistributed to competitors</li>
                <li>• Economic events can cause market recessions</li>
              </ul>
            </div>
          </div>
          
        {:else if activeSection === 'operations'}
          <div class="space-y-6">
            <div>
              <h2 class="text-3xl font-bold text-tech-green mb-4">🏢 Operations Management</h2>
              <p class="text-gray-300 text-lg leading-relaxed">
                Manage your workforce and facilities to support your growing business operations.
              </p>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">👥 Employee Management</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 class="text-tech-green font-medium mb-2">Hiring</h4>
                  <ul class="space-y-1 text-gray-300 text-sm">
                    <li>• Cost: $10,000 hiring fee + $15,000/quarter salary</li>
                    <li>• Must have sufficient campus capacity</li>
                    <li>• Assign employees to products for maximum effectiveness</li>
                  </ul>
                </div>
                <div>
                  <h4 class="text-tech-green font-medium mb-2">Firing</h4>
                  <ul class="space-y-1 text-gray-300 text-sm">
                    <li>• Cost: $7,500 severance pay per employee</li>
                    <li>• Reduces quarterly salary expenses</li>
                    <li>• May impact product effectiveness</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">🏢 Campus Types</h3>
              <div class="space-y-3">
                <div class="grid grid-cols-4 gap-4 text-sm">
                  <div class="font-medium text-gray-400">Type</div>
                  <div class="font-medium text-gray-400">Cost</div>
                  <div class="font-medium text-gray-400">Capacity</div>
                  <div class="font-medium text-gray-400">Overhead</div>
                </div>
                <div class="grid grid-cols-4 gap-4 text-sm">
                  <div class="text-tech-green">Garage</div>
                  <div class="text-white">Free</div>
                  <div class="text-white">10</div>
                  <div class="text-white">0%</div>
                </div>
                <div class="grid grid-cols-4 gap-4 text-sm">
                  <div class="text-tech-green">Small Office</div>
                  <div class="text-white">$400K</div>
                  <div class="text-white">50</div>
                  <div class="text-white">2%</div>
                </div>
                <div class="grid grid-cols-4 gap-4 text-sm">
                  <div class="text-tech-green">Large Office</div>
                  <div class="text-white">$1M</div>
                  <div class="text-white">150</div>
                  <div class="text-white">4%</div>
                </div>
                <div class="grid grid-cols-4 gap-4 text-sm">
                  <div class="text-tech-green">Large Building</div>
                  <div class="text-white">$1.6M</div>
                  <div class="text-white">275</div>
                  <div class="text-white">8%</div>
                </div>
              </div>
            </div>
          </div>
          
        {:else if activeSection === 'finances'}
          <div class="space-y-6">
            <div>
              <h2 class="text-3xl font-bold text-tech-green mb-4">💰 Financial Management</h2>
              <p class="text-gray-300 text-lg leading-relaxed">
                Manage your company's finances through loans, bonds, and cash flow optimization.
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">🏦 Loans</h3>
                <ul class="space-y-2 text-gray-300 text-sm">
                  <li>• Range: $10K - $10M</li>
                  <li>• Terms: 1-5 years</li>
                  <li>• Interest: 6-15% APR</li>
                  <li>• Monthly payments reduce cash flow</li>
                  <li>• Risk limit: 10% of cash for monthly payment</li>
                </ul>
              </div>
              
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">📈 Bonds</h3>
                <ul class="space-y-2 text-gray-300 text-sm">
                  <li>• Range: $5K - $5M</li>
                  <li>• Terms: 1-5 years</li>
                  <li>• Yield: 2-10% annually</li>
                  <li>• Quarterly interest payments</li>
                  <li>• Safe investment for excess cash</li>
                </ul>
              </div>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">💡 Financial Strategy Tips</h3>
              <ul class="space-y-2 text-gray-300">
                <li>• Maintain sufficient cash reserves for operations</li>
                <li>• Use loans strategically for expansion opportunities</li>
                <li>• Invest excess cash in bonds for steady income</li>
                <li>• Monitor debt-to-cash ratio to maintain good credit</li>
                <li>• Plan for quarterly expenses: salaries, loan payments, overhead</li>
              </ul>
            </div>
          </div>
          
        {:else if activeSection === 'acquisitions'}
          <div class="space-y-6">
            <div>
              <h2 class="text-3xl font-bold text-tech-green mb-4">🤝 Mergers & Acquisitions</h2>
              <p class="text-gray-300 text-lg leading-relaxed">
                Acquire competitor companies to expand your market presence and eliminate competition.
              </p>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">💼 Acquisition Process</h3>
              <ol class="space-y-2 text-gray-300">
                <li>1. Browse available acquisition targets</li>
                <li>2. Review company financials and product portfolio</li>
                <li>3. Submit acquisition offer (takes 1 quarter to process)</li>
                <li>4. If successful, inherit all assets and liabilities</li>
              </ol>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">✅ What You Gain</h3>
                <ul class="space-y-2 text-gray-300 text-sm">
                  <li>• Target's cash and bond investments</li>
                  <li>• All employees and campuses</li>
                  <li>• Complete product portfolio</li>
                  <li>• Quarterly revenue streams</li>
                  <li>• Market share in multiple markets</li>
                </ul>
              </div>
              
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">⚠️ Risks & Costs</h3>
                <ul class="space-y-2 text-gray-300 text-sm">
                  <li>• High upfront acquisition cost</li>
                  <li>• Inherit all outstanding loans</li>
                  <li>• Monthly debt service obligations</li>
                  <li>• Increased employee salary costs</li>
                  <li>• Campus overhead expenses</li>
                </ul>
              </div>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">🛡️ Growth Protection</h3>
              <p class="text-gray-300 mb-2">
                Companies with high growth (>30% last quarter) will reject acquisition offers.
              </p>
              <ul class="space-y-1 text-gray-300 text-sm">
                <li>• Wait for growth to slow down</li>
                <li>• Target companies with stable or declining performance</li>
                <li>• Consider the timing of your acquisition strategy</li>
              </ul>
            </div>
          </div>
          
        {:else if activeSection === 'strategy'}
          <div class="space-y-6">
            <div>
              <h2 class="text-3xl font-bold text-tech-green mb-4">🧠 Strategy & Tips</h2>
              <p class="text-gray-300 text-lg leading-relaxed">
                Master these strategic concepts to dominate the technology market.
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">🚀 Early Game Strategy</h3>
                <ul class="space-y-2 text-gray-300 text-sm">
                  <li>• Focus on high-growth markets (>12% annually)</li>
                  <li>• Assign employees to your initial product immediately</li>
                  <li>• Hire employees as soon as you can afford them</li>
                  <li>• Launch products in 2-3 different markets</li>
                  <li>• Upgrade from Garage to Small Office early</li>
                </ul>
              </div>
              
              <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
                <h3 class="text-tech-blue font-bold mb-3">💪 Mid Game Strategy</h3>
                <ul class="space-y-2 text-gray-300 text-sm">
                  <li>• Take strategic loans for rapid expansion</li>
                  <li>• Target smaller competitors for acquisition</li>
                  <li>• Diversify across multiple markets</li>
                  <li>• Invest excess cash in bonds for stability</li>
                  <li>• Monitor competitor growth rates</li>
                </ul>
              </div>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">🏆 End Game Strategy</h3>
              <ul class="space-y-2 text-gray-300">
                <li>• Focus on acquiring Large and Big Tech companies</li>
                <li>• Use accumulated cash reserves for major acquisitions</li>
                <li>• Target companies in markets where you're weak</li>
                <li>• Monitor your market cap percentage closely</li>
                <li>• Be prepared for economic downturns and recessions</li>
              </ul>
            </div>
            
            <div class="bg-tech-dark p-4 rounded border border-tech-blue/20">
              <h3 class="text-tech-blue font-bold mb-3">⚡ Pro Tips</h3>
              <ul class="space-y-2 text-gray-300">
                <li>• Employee effectiveness compounds over time - invest early</li>
                <li>• New markets spawn every 3 years - be ready to enter them</li>
                <li>• Economic events are random but temporary</li>
                <li>• Cash flow management is more important than total revenue</li>
                <li>• Sometimes it's better to wait than to make a risky acquisition</li>
              </ul>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div> 