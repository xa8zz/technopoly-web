// engine.js - JavaScript version of the main game engine

import { Company, Market, Product, Bond } from './models.js';
import { Loan } from './loan.js';
import { CAMPUS_TYPES } from './configs.js';
import { DataStorage } from './data_store.js';
import { EventManager } from './events.js';
import { updateFinances } from './finances.js';
import { AIController } from './ai.js';
import { formatMoney, randomCompanyName, randomProductName } from './utils.js';

export class BusinessGameEngine {
    /**
     * Coordinates everything:
     * - Creates markets, AI companies, player
     * - Each turn:
     *   1) AI actions
     *   2) Distribute revenue
     *   3) Events
     *   4) Acquisitions
     *   5) Finances
     *   6) Store data
     *   7) Output summary
     */
    constructor() {
        this.turnIndex = 0;
        this.startYear = 2000;
        this.gameOver = false;

        this.player = null;
        this.aiCompanies = [];

        const marketNames = [
            "Artificial Intelligence", "Cloud Computing", "Cybersecurity", "Enterprise SaaS", 
            "E-Commerce", "Consumer Hardware", "FinTech", "Social Media",
        ];
        this.spawnMarketNames = [
            "Semiconductors", "Autonomous Vehicles", "Blockchain", "Telecommunications",
            "VR Software", "Cloud Gaming", "Quantum Computing", "Smart Home",
            "Streaming Platforms", "GreenTech", "Wearables", "Video Games"
        ];
        this.markets = marketNames.map(n => new Market(n));

        this.dataStore = new DataStorage();
        this.eventManager = new EventManager(this.markets);
        this.aiController = new AIController(this); // pass ref to ourselves

        this.usedCompanyNames = new Set();
        this.usedProductNames = new Set();

        this.pendingAcquisitions = [];
        this.newsFeed = [];
        this.competitorNewsFeed = []; // For AI competitor moves
        
        this.spawnedAiCount = 0;
        this.spawnedMarketCount = 0;
        
        // Make classes available for GUI
        this.Loan = Loan;
        this.Bond = Bond;
        this.CAMPUS_TYPES = CAMPUS_TYPES;
    }

    setupGame() {
        // first, create AI
        this._createAiCompanies();
        // then create player
        this._initializePlayer(); // still creates a default player instance
        // NO initial state storage here; it happens AFTER player setup
    }

    _getDate() {
        /**
         * Calculate the current year and quarter based on the turn index.
         */
        const yOffset = Math.floor(this.turnIndex / 4);
        const q = (this.turnIndex % 4) + 1;
        return [this.startYear + yOffset, q];
    }

    _getProductQualityRank(product) {
        /**
         * Determines the product's effectiveness rank based on its position within the market.
         */
        const productsInMarket = this._findProductsInMarket(product.marketName);
        productsInMarket.sort((a, b) => b.effectiveness - a.effectiveness);

        // Get the index of the product in the sorted list
        const position = productsInMarket.indexOf(product);
        const totalProducts = productsInMarket.length;

        if (position === 0) {
            return "Very Good";
        } else if (position === totalProducts - 1) {
            return "Very Bad";
        } else if (position <= Math.floor(totalProducts / 4)) {
            return "Good";
        } else if (position >= Math.floor(3 * totalProducts / 4)) {
            return "Bad";
        } else {
            return "Moderate";
        }
    }

    // ==================================
    //        SETUP / INITIALIZATION
    // ==================================
    _createAiCompanies() {
        /**
         * Create 20 AI companies with 4 tiers.
         */
        const prefixes = [
            "Neuro", "Quantum", "Cyber", "Hyper", "Vertex", "Nexus", "Strato", "Omicron", "Zenith", "Titan",
            "Echo", "Horizon", "Aether", "Aurora", "Byte", "Nano", "Synth", "Vortex", "Lyric", "Sigma",
            "Meta", "Flux", "Pyro", "Velox", "Inferna", "Nova", "Zylo", "Sol", "Sky", "Celesti",
            "Arc", "Phantom", "Neon", "Axion", "Sentinel", "Helix", "Apollo", "Echelon", "Omni", "Synthetix"
        ];
        const suffixes = [
            "Tech", "AI", "Soft", "Dynamics", "Labs", "Innovations", "Industries", "Solutions", "Cloud", "Systems",
            "Logic", "Cybernetics", "Synapse", "Robotics", "Intelligence", "Analytics", "Works", "Data", "Quantum",
            "Networks", "Ventures", "Enterprises", "Informatics", "Computation", "Ops", "Matrix", "Forge", "Frameworks",
            "Infotech", "Synergy", "Engage", "X", "Next", "Core", "Stream", "Node", "Sphere", "Hub"
        ];

        // The same distribution as the Python code
        // Startup=5(1mkt), Medium=7(2mkt), Large=5(4mkt), BigTech=3(5mkt)
        const tiers = [
            ["Startup", 5, 1],
            ["Medium", 7, 2],
            ["Large", 5, 4],
            ["Big Tech", 3, 5]
        ];

        for (const [tierName, count, mcount] of tiers) {
            for (let i = 0; i < count; i++) {
                const cname = randomCompanyName(prefixes, suffixes, this.usedCompanyNames);
                const c = new Company(cname, tierName);
                
                // Set campus based on tier
                if (tierName === "Startup") {
                    c.campuses.push(["Garage", 0, 0.0, 10]);
                } else if (tierName === "Medium") {
                    c.campuses.push(["Small Office", 250000, 0.02, 50]);
                } else if (tierName === "Large") {
                    c.campuses.push(["Large Office", 2500000, 0.04, 125]);
                } else if (tierName === "Big Tech") {
                    c.campuses.push(["Large Building", 5000000, 0.08, 250]);
                }

                // Set employees/cash based on tier
                if (tierName === "Startup") {
                    c.employees = Math.floor(Math.random() * 11) + 10; // 10-20
                    c.cash = Math.random() * 1500000 + 500000; // 500k-2M
                } else if (tierName === "Medium") {
                    c.employees = Math.floor(Math.random() * 36) + 35; // 35-70
                    c.cash = Math.random() * 3000000 + 3000000; // 3M-6M
                } else if (tierName === "Large") {
                    c.employees = Math.floor(Math.random() * 61) + 80; // 80-140
                    c.cash = Math.random() * 6000000 + 12000000; // 12M-18M
                } else {
                    c.employees = Math.floor(Math.random() * 121) + 180; // 180-300
                    c.cash = Math.random() * 15000000 + 25000000; // 25M-40M
                }

                // Pick markets and create products
                const chosenMkts = this._sampleArray(this.markets, mcount);
                for (const mk of chosenMkts) {
                    const p = new Product(c.name, mk.name);
                    // Random assignment
                    p.assignedEmployees["r&d"] = Math.floor(Math.random() * 3) + 1;
                    p.assignedEmployees["q&a"] = Math.floor(Math.random() * 3) + 1;
                    p.assignedEmployees["marketing"] = Math.floor(Math.random() * 3) + 1;
                    p.revenue = 0.0;
                    
                    const prodKey = randomProductName(this.usedProductNames);
                    c.products[prodKey] = p;
                }

                this.aiCompanies.push(c);
            }
        }

        // Do ratio-based initial share distribution
        this._assignInitialMarketShares();
    }

    _initializePlayer() {
        // Create the player with default values. The GUI will set the name.
        this.player = new Company("Player Co"); // Default name
        this.player.cash = 1000000;
        this.player.employees = 5;
        // campus => Garage
        this.player.campuses.push(["Garage", 0, 0.0, 10]);
    }

    _categorizeGrowthRate(growthRate) {
        /**
         * Categorizes the growth rate into 'Low', 'Moderate', or 'High'.
         */
        if (growthRate <= 0.083) {
            return "Low";
        } else if (growthRate <= 0.1166) {
            return "Moderate";
        } else {
            return "High";
        }
    }

    _assignInitialMarketShares() {
        const TIER_RATIO = { "Startup": 1, "Medium": 2, "Large": 4, "Big Tech": 8 };

        for (const mk of this.markets) {
            const compsInMkt = {};

            // 1. AI Companies
            for (const c of this.aiCompanies) {
                const prods = Object.values(c.products).filter(p => p.marketName === mk.name);
                if (prods.length > 0) {
                    compsInMkt[c.name] = { company: c, products: prods };
                }
            }

            // Skip if no participants in the market
            if (Object.keys(compsInMkt).length === 0) {
                continue;
            }

            // 3. Distribute initial shares
            const totalRatio = Object.values(compsInMkt).reduce((sum, entry) => {
                return sum + (TIER_RATIO[entry.company.tier] || 1);
            }, 0);
            const firstQ = mk.size / 4.0;

            for (const entry of Object.values(compsInMkt)) {
                const r = TIER_RATIO[entry.company.tier] || 1;
                const share = (r / totalRatio) * firstQ;
                const each = share / entry.products.length;

                for (const p of entry.products) {
                    p.revenue += each;
                }
            }
        }
    }

    _countProductsInMarket(mname) {
        let c = 0;
        for (const ai of this.aiCompanies) {
            for (const p of Object.values(ai.products)) {
                if (p.marketName === mname) {
                    c++;
                }
            }
        }
        for (const p of Object.values(this.player.products)) {
            if (p.marketName === mname) {
                c++;
            }
        }
        return c;
    }

    // ===========================
    //      TURN STEPS
    // ===========================
    _distributeRevenueAllMarkets() {
        const isInitialTurn = (this.turnIndex === 0);
        
        for (const mk of this.markets) {
            // Apply recession effects if applicable.
            mk.applyRecession();
            const participants = this._findProductsInMarket(mk.name);
            if (participants.length === 0) {
                mk.lastQuarterTotalRevenue = 0;
                continue;
            }

            // Initialize last_quarter_total_revenue if needed.
            if (mk.lastQuarterTotalRevenue <= 0) {
                mk.lastQuarterTotalRevenue = participants.reduce((sum, p) => sum + p.revenue, 0);
            }

            const growthRev = mk.isInGlobalRecession ? 0 : (mk.size * mk.growthRate) / 4.0;
            const churnAmount = 0.08 * mk.lastQuarterTotalRevenue;

            // Store previous revenue for each product to calculate growth
            const previousRevenues = new Map();
            participants.forEach(p => previousRevenues.set(p, p.revenue));

            // Update effectiveness for all products except player on initial turn
            for (const p of participants) {
                if (isInitialTurn && p.ownerName === this.player.name) {
                    continue;
                } else {
                    p.updateEffectiveSpendEachQuarter();
                    p.updateEffectiveness();
                }
            }

            // Calculate total effectiveness
            let totalEff;
            if (isInitialTurn) {
                totalEff = participants
                    .filter(p => p.ownerName !== this.player.name)
                    .reduce((sum, p) => sum + p.effectiveness, 0);
            } else {
                totalEff = participants.reduce((sum, p) => sum + p.effectiveness, 0);
            }
            if (totalEff <= 0) {
                totalEff = 1.0;
            }

            // Apply churn (8% revenue loss)
            for (const p of participants) {
                if (isInitialTurn && p.ownerName === this.player.name) {
                    continue;
                }
                const lost = p.revenue * 0.08;
                p.revenue -= lost;
            }

            // Redistribute churned revenue based on effectiveness
            for (const p of participants) {
                if (isInitialTurn && p.ownerName === this.player.name) {
                    continue;
                }
                const share = p.effectiveness / totalEff;
                p.revenue += share * churnAmount;
            }

            // Add growth revenue
            for (const p of participants) {
                if (isInitialTurn && p.ownerName === this.player.name) {
                    continue;
                }
                const share = p.effectiveness / totalEff;
                p.revenue += share * growthRev;
                
                // Calculate and store growth percentage
                const prevRev = previousRevenues.get(p);
                if (prevRev > 0 && !(isInitialTurn && p.ownerName === this.player.name)) {
                    const growthPct = ((p.revenue - prevRev) / prevRev) * 100;
                    p.recentGrowth.push(growthPct);
                    // Limit the list to 4 quarters
                    if (p.recentGrowth.length > 4) {
                        p.recentGrowth.shift();
                    }
                }
            }

            mk.lastQuarterTotalRevenue = participants.reduce((sum, p) => sum + p.revenue, 0);

            // Update the market size each turn if not in recession
            if (!mk.isInGlobalRecession) {
                mk.size = mk.lastQuarterTotalRevenue;
            }
        }
    }

    _handleEvents() {
        /**
         * Defer to event_manager.
         */
        // This is handled in processTurn
    }

    _resolvePendingAcquisitions() {
        const toRemove = [];
        for (const [buyer, targetName, price, turnSubmitted] of this.pendingAcquisitions) {
            if (this.turnIndex >= turnSubmitted + 1) {
                // time to resolve
                let target = null;
                for (const ai of this.aiCompanies) {
                    if (ai.name === targetName) {
                        target = ai;
                        break;
                    }
                }
                
                if (!target) {
                    this._pushCompetitorNews(`Acquisition of ${targetName} failed; no longer exists.`);
                    toRemove.push([buyer, targetName, price, turnSubmitted]);
                    continue;
                }
                
                if (buyer.cash < price) {
                    this._pushCompetitorNews(`Acquisition of ${targetName} failed; insufficient funds.`);
                    toRemove.push([buyer, targetName, price, turnSubmitted]);
                    continue;
                }
                
                // top2 growth check
                if (this._isTargetInTop2Growth(target)) {
                    this._pushCompetitorNews(`Acquisition of ${targetName} failed; top-2 growth.`);
                    toRemove.push([buyer, targetName, price, turnSubmitted]);
                    continue;
                }
                
                // success
                buyer.cash -= price;
                this._mergeCompanies(buyer, target);
                this._pushNews(`${buyer.name} acquired ${targetName} for ${formatMoney(price)}!`);
                const index = this.aiCompanies.indexOf(target);
                if (index > -1) {
                    this.aiCompanies.splice(index, 1);
                }
                toRemove.push([buyer, targetName, price, turnSubmitted]);
            }
        }

        this.pendingAcquisitions = this.pendingAcquisitions.filter(acq => 
            !toRemove.some(rem => 
                rem[0] === acq[0] && rem[1] === acq[1] && rem[2] === acq[2] && rem[3] === acq[3]
            )
        );
    }

    _isTargetInTop2Growth(comp) {
        // if any product's last growth > 30 => top2
        for (const p of Object.values(comp.products)) {
            if (p.recentGrowth.length > 0 && p.recentGrowth[p.recentGrowth.length - 1] > 30) {
                return true;
            }
        }
        return false;
    }

    _mergeCompanies(buyer, target) {
        /**
         * Merge target company into buyer:
         * - Cash, employees, and campuses are transferred.
         * - Employee capacity and overhead are adjusted.
         * - Products and bonds are absorbed.
         */
        if (target.cash < 0) {
            target.cash = 0;
        }

        buyer.cash += target.cash;
        buyer.employees += target.employees;
        buyer.campuses.push(...target.campuses);
        buyer.loans.push(...target.loans);
        buyer.bonds.push(...target.bonds);

        // Transfer and rename products if necessary
        for (const [prodName, prod] of Object.entries(target.products)) {
            prod.ownerName = buyer.name;
            if (prodName in buyer.products) {
                buyer.products[`${prodName}_acq`] = prod;
            } else {
                buyer.products[prodName] = prod;
            }
        }

        // Clean up target after acquisition
        target.cash = 0;
        target.employees = 0;
        target.campuses = [];
        target.products = {};
        target.loans = [];
        target.bonds = [];
    }

    _updateFinances() {
        /**
         * Calls finances.updateFinances
         */
        updateFinances([this.player, ...this.aiCompanies]);
    }

    _checkEndgame() {
        // player losing
        if (this.player.isBankrupt()) {
            this._pushNews("\nYou lost! Your investors shut you down because your cash was negative 4 consecutive quarters.");
            this._endGame();
            return;
        }
        
        // if no ai or if player MC > 70%
        const total = this.player.marketCap + this.aiCompanies.reduce((sum, c) => sum + c.marketCap, 0);
        
        if (this.aiCompanies.length === 0) {
            this._pushNews("You acquired all of your competitors. Technopoly!");
            this._endGame();
            return;
        }
        
        const share = total > 0 ? this.player.marketCap / total : 0;
        if (share >= 0.7) {
            this._pushNews("You got 70 percent of the market's total market capitalization. Technopoly!");
            this._endGame();
        }
    }

    _endGame() {
        this.gameOver = true;
    }

    _pushNews(msg) {
        /**
         * Add to news feed.
         */
        this.newsFeed.push(msg);
        // Limit size to prevent memory issues
        if (this.newsFeed.length > 100) {
            this.newsFeed = this.newsFeed.slice(-100);
        }
    }

    _findProductsInMarket(mname) {
        const results = [];

        if (this.player !== null) {
            for (const p of Object.values(this.player.products)) {
                if (p.marketName === mname) {
                    results.push(p);
                }
            }
        }

        for (const c of this.aiCompanies) {
            for (const p of Object.values(c.products)) {
                if (p.marketName === mname) {
                    results.push(p);
                }
            }
        }

        // Include the imaginary product if the market has one
        for (const m of this.markets) {
            if (m.name === mname && m.imaginaryProduct) {
                results.push(m.imaginaryProduct);
            }
        }

        return results;
    }

    _pushCompetitorNews(msg) {
        /**
         * Add to competitor news, which is displayed separately.
         */
        this.competitorNewsFeed.push(msg);
        // Limit size to prevent memory issues
        if (this.competitorNewsFeed.length > 100) {
            this.competitorNewsFeed = this.competitorNewsFeed.slice(-100);
        }
    }

    _companyHasProductInMarket(comp, mname) {
        for (const p of Object.values(comp.products)) {
            if (p.marketName === mname) {
                return true;
            }
        }
        return false;
    }

    _calculateAcquisitionPrice(targetCompany) {
        /**
         * Minimum = (annualizedRevenue + max(netAssets, 0)) * 1.3
         * Compare that to target's market_cap. Use whichever is higher.
         */
        // annualized revenue from last 3 quarters
        let avgRev;
        if (targetCompany.pastQuarterRevenues.length > 0) {
            avgRev = targetCompany.pastQuarterRevenues.reduce((sum, rev) => sum + rev, 0) / targetCompany.pastQuarterRevenues.length;
        } else {
            avgRev = targetCompany.totalRevenueThisQuarter();
        }
        const annualRev = avgRev * 4;

        let netAssets = targetCompany.cash + 
            targetCompany.bonds.reduce((sum, b) => sum + b.principal, 0) - 
            targetCompany.loans.reduce((sum, ln) => sum + ln.principal, 0);
        if (netAssets < 0) {
            netAssets = 0;
        }

        const minCost = (annualRev + netAssets) * 1.3;
        // pick whichever is bigger: min_cost or the current market_cap
        const basePrice = Math.max(minCost, targetCompany.marketCap);
        return basePrice;
    }

    // ===========================
    //      MAIN TURN PROCESSING
    // ===========================
    async processTurn() {
        /**
         * Main turn processing method that handles all turn logic.
         * This replaces the old player menu system.
         */
        if (this.gameOver) return;

        // 1) AI actions
        for (const comp of this.aiCompanies) {
            this.aiController.aiTakeActions(comp);
        }

        // 2) Handle events
        const event = this.eventManager.pickRandomEvent();
        if (event) {
            event.turnHappened = this.turnIndex;
        }
        this.eventManager.applyEvent(event);
        this.eventManager.updateRecession();

        // 3) Distribute revenue
        this._distributeRevenueAllMarkets();

        // 4) Resolve acquisitions
        this._resolvePendingAcquisitions();

        // 5) Update finances
        this._updateFinances();

        // 6) Store data
        this.dataStore.recordState(this.turnIndex, [this.player, ...this.aiCompanies], this.markets);

        // 7) Check endgame
        this._checkEndgame();

        // 8) Increment turn
        this.turnIndex++;

        // 9) Spawn new companies/markets periodically
        if (this.turnIndex % 8 === 0) { // Every 2 years
            this.spawnNewAiCompanies();
        }
        if (this.turnIndex % 12 === 0) { // Every 3 years
            this.spawnNewProductMarket();
        }
    }

    // ===========================
    //      SPAWNING METHODS
    // ===========================
    spawnNewAiCompanies() {
        /**
         * Spawns 3 new AI companies (unless we already hit the 100-company limit).
         */
        if (this.spawnedAiCount >= 100) {
            return;
        }

        // Only allow new AI companies to select from the first 8 initialized markets
        const availableMarkets = this.markets.slice(0, 8);

        // Weighted tiers
        const tiers = ["Startup", "Medium", "Large", "Big Tech"];
        const weights = [0.50, 0.25, 0.15, 0.05];

        const companiesToSpawn = 3;
        for (let i = 0; i < companiesToSpawn; i++) {
            if (this.spawnedAiCount >= 100) {
                break;
            }

            // Pick a tier based on weighted probabilities
            const tierChoice = this._weightedChoice(tiers, weights);
            const newName = randomCompanyName(
                [
                    "Neuro", "Quantum", "Cyber", "Hyper", "Vertex", "Nexus", "Strato", "Omicron", "Zenith", "Titan",
                    "Echo", "Horizon", "Aether", "Aurora", "Byte", "Nano", "Synth", "Vortex", "Lyric", "Sigma",
                    "Celesti", "Axion", "Velox", "Sentinel", "Echelon", "Inferna", "Nova", "Sky", "Phantom", "Helix"
                ],
                [
                    "Tech", "AI", "Soft", "Dynamics", "Labs", "Innovations", "Industries", "Solutions", "Cloud", "Systems",
                    "Logic", "Cybernetics", "Synapse", "Robotics", "Intelligence", "Analytics", "Works", "Data", "Quantum", "Networks",
                    "Engage", "Synergy", "Enterprises", "Computation", "Core", "Stream", "Matrix", "Node", "Forge", "Frameworks"
                ],
                this.usedCompanyNames
            );

            // Create the new company object
            const newCompany = new Company(newName, tierChoice);

            // Set up based on tier
            let productCount;
            if (tierChoice === "Startup") {
                newCompany.campuses.push(["Garage", 0, 0.0, 10]);
                newCompany.employees = Math.floor(Math.random() * 6) + 5; // 5-10
                newCompany.cash = Math.random() * 1500000 + 500000; // 500k-2M
                productCount = 1;
            } else if (tierChoice === "Medium") {
                newCompany.campuses.push(["Small Office", 400000, 0.02, 50]);
                newCompany.employees = Math.floor(Math.random() * 21) + 15; // 15-35
                newCompany.cash = Math.random() * 2000000 + 3000000; // 3M-5M
                productCount = 2;
            } else if (tierChoice === "Large") {
                newCompany.campuses.push(["Large Office", 1000000, 0.04, 150]);
                newCompany.employees = Math.floor(Math.random() * 41) + 60; // 60-100
                newCompany.cash = Math.random() * 8000000 + 12000000; // 12M-20M
                productCount = 3;
            } else { // Big Tech
                newCompany.campuses.push(["Large Building", 1600000, 0.08, 275]);
                newCompany.employees = Math.floor(Math.random() * 81) + 120; // 120-200
                newCompany.cash = Math.random() * 15000000 + 25000000; // 25M-40M
                productCount = 4;
            }

            // Create products for the new AI company (only from the first 8 initialized markets)
            const chosenMarkets = this._sampleArray(availableMarkets, Math.min(productCount, availableMarkets.length));

            for (const market of chosenMarkets) {
                const p = new Product(newCompany.name, market.name);

                // **Automatically assign 3 employees to each product (1 per type)**
                p.assignedEmployees["r&d"] = 1;
                p.assignedEmployees["q&a"] = 1;
                p.assignedEmployees["marketing"] = 1;

                // **Ensure these employees are counted in the company's finances**
                newCompany.employees += 3;

                // Start with $1k of revenue
                p.revenue = 1000.0;

                // Deduct $1k from whichever competitor in that market has the highest revenue
                let biggestProduct = null;
                let biggestRevenue = 0.0;
                for (const competitor of [...this.aiCompanies, this.player]) {
                    for (const [prodName, prodObj] of Object.entries(competitor.products)) {
                        if (prodObj.marketName === market.name && prodObj.revenue > biggestRevenue) {
                            biggestRevenue = prodObj.revenue;
                            biggestProduct = prodObj;
                        }
                    }
                }

                if (biggestProduct && biggestProduct.revenue >= 1000.0) {
                    biggestProduct.revenue -= 1000.0;
                } else if (biggestProduct) {
                    const amountToDeduct = Math.min(biggestProduct.revenue, 1000.0);
                    biggestProduct.revenue -= amountToDeduct;
                }

                // Store product in the new company under a unique product name
                const productName = randomProductName(this.usedProductNames);
                newCompany.products[productName] = p;
            }

            // Add the new AI to our main list
            this.aiCompanies.push(newCompany);
            this.spawnedAiCount++;

            // Push a competitor news announcement
            this._pushNews(`NEW COMPETITOR ALERT! ${newName} COMPANY SIZE: ${tierChoice}`);
        }
    }

    spawnNewProductMarket() {
        /**
         * Spawns 1 new product market (unless 12 have already been spawned).
         * Uses the following list of 12 market names in order.
         * The new market has:
         * - random initial revenue between $500k and $5m
         * - random growth rate between 10% and 15%
         * A news message is pushed with a rating of that growth rate.
         */
        if (this.spawnedMarketCount >= this.spawnMarketNames.length) {
            return;
        }

        // Use the next name in the list, based on how many we've spawned so far
        const marketName = this.spawnMarketNames[this.spawnedMarketCount];

        const initialRevenue = Math.random() * (5000000 - 500000) + 500000; // 500k-5M
        const growthRate = Math.random() * (0.15 - 0.10) + 0.10; // 10%-15%

        const newMarket = new Market(marketName);
        newMarket.size = initialRevenue;
        newMarket.baseGrowthRate = growthRate;
        newMarket.growthRate = growthRate;

        // Create imaginary product for proper revenue distribution
        const imaginaryProduct = new Product("Initial Market Revenue", marketName);
        imaginaryProduct.effectiveness = 0.0;
        imaginaryProduct.assignedEmployees = { "r&d": 0, "q&a": 0, "marketing": 0 };
        imaginaryProduct.revenue = initialRevenue; // Entire first quarter's revenue
        newMarket.imaginaryProduct = imaginaryProduct; // Attach to market

        this.markets.push(newMarket);
        this.spawnedMarketCount++;

        // Map the exact growth % to a descriptive label
        let rating;
        if (growthRate <= 0.11) {
            rating = "Moderate";
        } else if (growthRate <= 0.13) {
            rating = "Good";
        } else {
            rating = "Very Good";
        }

        this._pushNews(`NEW PRODUCT MARKET! ${marketName} SIZE: ~$${Math.floor(initialRevenue).toLocaleString()} GROWTH: ${rating}`);
    }

    // ===========================
    //      UTILITY METHODS
    // ===========================
    _sampleArray(array, count) {
        /**
         * Randomly sample 'count' items from array without replacement.
         */
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, array.length));
    }

    _weightedChoice(choices, weights) {
        /**
         * Choose an item from choices based on weights.
         */
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < choices.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return choices[i];
            }
        }
        return choices[choices.length - 1]; // fallback
    }

    // ===========================
    //      SAVE/LOAD FUNCTIONALITY
    // ===========================
    toJSON() {
        /**
         * Serialize the entire game state to a plain JavaScript object.
         * This can be stored in localStorage or sent to a server.
         */
        return {
            // Core game state
            turnIndex: this.turnIndex,
            startYear: this.startYear,
            gameOver: this.gameOver,
            
            // Player data
            player: this.player ? this.player.toJSON() : null,
            
            // AI companies
            aiCompanies: this.aiCompanies.map(company => company.toJSON()),
            
            // Markets
            markets: this.markets.map(market => market.toJSON()),
            
            // Spawn tracking
            spawnedAiCount: this.spawnedAiCount,
            spawnedMarketCount: this.spawnedMarketCount,
            
            // Used names (convert Sets to Arrays)
            usedCompanyNames: Array.from(this.usedCompanyNames),
            usedProductNames: Array.from(this.usedProductNames),
            
            // Pending acquisitions
            pendingAcquisitions: this.pendingAcquisitions.map(acq => ({
                buyerName: acq[0].name,
                targetName: acq[1],
                price: acq[2],
                turnSubmitted: acq[3]
            })),
            
            // News feeds
            newsFeed: this.newsFeed,
            competitorNewsFeed: this.competitorNewsFeed,
            
            // Market names for spawning
            spawnMarketNames: this.spawnMarketNames,
            
            // Save metadata
            saveVersion: '1.0',
            saveDate: new Date().toISOString()
        };
    }

    static fromJSON(jsonData, eventManager = null, aiController = null) {
        /**
         * Recreate a BusinessGameEngine instance from serialized data.
         * This restores the complete game state from a save file.
         */
        const engine = new BusinessGameEngine();
        
        // Restore core game state
        engine.turnIndex = jsonData.turnIndex || 0;
        engine.startYear = jsonData.startYear || 2000;
        engine.gameOver = jsonData.gameOver || false;
        
        // Restore spawn tracking
        engine.spawnedAiCount = jsonData.spawnedAiCount || 0;
        engine.spawnedMarketCount = jsonData.spawnedMarketCount || 0;
        
        // Restore used names (convert Arrays back to Sets)
        engine.usedCompanyNames = new Set(jsonData.usedCompanyNames || []);
        engine.usedProductNames = new Set(jsonData.usedProductNames || []);
        
        // Restore news feeds
        engine.newsFeed = jsonData.newsFeed || [];
        engine.competitorNewsFeed = jsonData.competitorNewsFeed || [];
        
        // Restore spawn market names
        engine.spawnMarketNames = jsonData.spawnMarketNames || [
            "Semiconductors", "Autonomous Vehicles", "Blockchain", "Telecommunications",
            "VR Software", "Cloud Gaming", "Quantum Computing", "Smart Home",
            "Streaming Platforms", "GreenTech", "Wearables", "Video Games"
        ];
        
        // Restore markets
        engine.markets = jsonData.markets.map(marketData => Market.fromJSON(marketData));
        
        // Restore AI companies
        engine.aiCompanies = jsonData.aiCompanies.map(companyData => Company.fromJSON(companyData));
        
        // Restore player
        engine.player = jsonData.player ? Company.fromJSON(jsonData.player) : null;
        
        // Restore pending acquisitions (need to find company references)
        engine.pendingAcquisitions = jsonData.pendingAcquisitions.map(acqData => {
            const buyer = engine.player?.name === acqData.buyerName ? 
                engine.player : 
                engine.aiCompanies.find(c => c.name === acqData.buyerName);
            
            return [buyer, acqData.targetName, acqData.price, acqData.turnSubmitted];
        }).filter(acq => acq[0]); // Remove any acquisitions where buyer wasn't found
        
        // Re-initialize managers (use provided ones or create new)
        engine.eventManager = eventManager || new EventManager(engine.markets);
        engine.aiController = aiController || new AIController(engine);
        
        return engine;
    }

    // ===========================
    //      PLAYER ACTIONS
    // ===========================
    playerSetupCompany(companyName, marketName, productName) {
        /**
         * Set up the player's company with chosen name and initial market.
         */
        this.player.name = companyName;
        
        // Create initial product
        const initialProduct = new Product(this.player.name, marketName);
        initialProduct.assignedEmployees = { "r&d": 2, "q&a": 1, "marketing": 2 };
        this.player.products[productName] = initialProduct;
        
        // Add to used names
        this.usedCompanyNames.add(companyName);
        this.usedProductNames.add(productName);
        
        // Now assign initial market shares including the player
        this._assignInitialMarketSharesWithPlayer();
        
        // Record initial state
        this.dataStore.recordState(this.turnIndex, [this.player, ...this.aiCompanies], this.markets);
    }

    _assignInitialMarketSharesWithPlayer() {
        /**
         * Assign initial market shares including the player.
         */
        const TIER_RATIO = { "Startup": 1, "Medium": 2, "Large": 4, "Big Tech": 8 };

        for (const mk of this.markets) {
            const compsInMkt = {};

            // Add player if they have products in this market
            const playerProds = Object.values(this.player.products).filter(p => p.marketName === mk.name);
            if (playerProds.length > 0) {
                compsInMkt[this.player.name] = { company: this.player, products: playerProds };
            }

            // Add AI companies
            for (const c of this.aiCompanies) {
                const prods = Object.values(c.products).filter(p => p.marketName === mk.name);
                if (prods.length > 0) {
                    compsInMkt[c.name] = { company: c, products: prods };
                }
            }

            // Skip if no participants in the market
            if (Object.keys(compsInMkt).length === 0) {
                continue;
            }

            // Distribute initial shares
            const totalRatio = Object.values(compsInMkt).reduce((sum, entry) => {
                const tier = entry.company.tier || "Startup"; // Player defaults to Startup tier
                return sum + (TIER_RATIO[tier] || 1);
            }, 0);
            const firstQ = mk.size / 4.0;

            for (const entry of Object.values(compsInMkt)) {
                const tier = entry.company.tier || "Startup";
                const r = TIER_RATIO[tier] || 1;
                const share = (r / totalRatio) * firstQ;
                const each = share / entry.products.length;

                for (const p of entry.products) {
                    p.revenue += each;
                }
            }
        }
    }

    playerLaunchProduct(marketName, productName) {
        /**
         * Launch a new product in the specified market.
         * Returns true if successful, false if failed.
         */
        const launchCost = 50000;
        
        // Validate inputs
        if (!marketName || !productName) {
            return { success: false, error: "Market name and product name are required" };
        }
        
        // Check if product name already exists
        if (this.player.products[productName]) {
            return { success: false, error: "Product name already exists" };
        }
        
        // Check if player already has a product in this market
        const existingProduct = Object.values(this.player.products).find(p => p.marketName === marketName);
        if (existingProduct) {
            return { success: false, error: "You already have a product in this market" };
        }
        
        // Check if market exists
        const market = this.markets.find(m => m.name === marketName);
        if (!market) {
            return { success: false, error: "Market does not exist" };
        }
        
        // Check if player can afford it
        if (this.player.cash < launchCost) {
            return { success: false, error: "Insufficient funds" };
        }
        
        // Deduct cost
        this.player.cash -= launchCost;
        
        // Create new product
        const newProduct = new Product(this.player.name, marketName);
        newProduct.assignedEmployees = { "r&d": 0, "q&a": 0, "marketing": 0 };
        newProduct.revenue = 0;
        
        // Add to player's products
        this.player.products[productName] = newProduct;
        this.usedProductNames.add(productName);
        
        // Add news
        this._pushNews(`${this.player.name} launched ${productName} in the ${marketName} market!`);
        
        return { success: true };
    }

    playerUpdateEmployeeAssignments(productName, assignments) {
        /**
         * Update employee assignments for a specific product.
         * Returns true if successful, false if failed.
         */
        // Check if product exists
        if (!this.player.products[productName]) {
            return { success: false, error: "Product does not exist" };
        }
        
        // Validate assignments
        const totalAssigned = assignments['r&d'] + assignments['q&a'] + assignments['marketing'];
        if (totalAssigned > this.player.employees) {
            return { success: false, error: "Not enough employees available" };
        }
        
        // Check for negative values
        if (assignments['r&d'] < 0 || assignments['q&a'] < 0 || assignments['marketing'] < 0) {
            return { success: false, error: "Employee assignments cannot be negative" };
        }
        
        // Update assignments
        this.player.products[productName].assignedEmployees = { ...assignments };
        
        return { success: true };
    }

    playerHireEmployees(count) {
        /**
         * Hire new employees for the player's company.
         * Cost: $10k hiring cost + $15k quarterly salary per employee
         */
        if (count <= 0) {
            return { success: false, error: "Must hire at least 1 employee" };
        }
        
        const hiringCost = count * 10000; // $10k per employee
        
        // Check if player can afford it
        if (this.player.cash < hiringCost) {
            return { success: false, error: "Insufficient funds for hiring cost" };
        }
        
        // Check capacity
        if (this.player.employees + count > this.player.employeeCapacity()) {
            return { success: false, error: "Not enough capacity for new employees" };
        }
        
        // Deduct cost and hire employees
        this.player.cash -= hiringCost;
        this.player.employees += count;
        
        // Add news
        this._pushNews(`${this.player.name} hired ${count} new employee${count === 1 ? '' : 's'}!`);
        
        return { success: true };
    }

    playerFireEmployees(count) {
        /**
         * Fire employees from the player's company.
         * Cost: $7.5k severance pay per employee
         */
        if (count <= 0) {
            return { success: false, error: "Must fire at least 1 employee" };
        }
        
        if (count > this.player.employees) {
            return { success: false, error: "Cannot fire more employees than you have" };
        }
        
        const severanceCost = count * 7500; // $7.5k per employee
        
        // Check if player can afford severance
        if (this.player.cash < severanceCost) {
            return { success: false, error: "Insufficient funds for severance pay" };
        }
        
        // Deduct severance and fire employees
        this.player.cash -= severanceCost;
        this.player.employees -= count;
        
        // Add news
        this._pushNews(`${this.player.name} laid off ${count} employee${count === 1 ? '' : 's'}.`);
        
        return { success: true, severancePaid: severanceCost };
    }

    playerBuyCampus(campusType) {
        /**
         * Buy a new campus for the player's company.
         */
        if (!campusType) {
            return { success: false, error: "Campus type is required" };
        }
        
        // Check if campus type exists
        if (!this.CAMPUS_TYPES[campusType]) {
            return { success: false, error: "Invalid campus type" };
        }
        
        // Check if player already owns this campus type
        const alreadyOwned = this.player.campuses.some(campus => campus[0] === campusType);
        if (alreadyOwned) {
            return { success: false, error: "You already own this campus type" };
        }
        
        const campusData = this.CAMPUS_TYPES[campusType];
        
        // Check if player can afford it
        if (this.player.cash < campusData.cost) {
            return { success: false, error: "Insufficient funds to purchase this campus" };
        }
        
        // Deduct cost and add campus
        this.player.cash -= campusData.cost;
        this.player.campuses.push([
            campusType,
            campusData.cost,
            campusData.overhead,
            campusData.capacity
        ]);
        
        // Add news
        this._pushNews(`${this.player.name} purchased a ${campusType} campus!`);
        
        return { success: true };
    }

    playerTakeLoan(amount, termMonths, rate) {
        /**
         * Take out a loan for the player's company.
         */
        if (amount <= 0 || termMonths <= 0 || rate <= 0) {
            return { success: false, error: "Invalid loan parameters" };
        }
        
        if (amount < 10000) {
            return { success: false, error: "Minimum loan amount is $10,000" };
        }
        
        if (amount > 10000000) {
            return { success: false, error: "Maximum loan amount is $10,000,000" };
        }
        
        // Calculate monthly payment
        const monthlyRate = rate / 12;
        const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                              (Math.pow(1 + monthlyRate, termMonths) - 1);
        
        // Risk check - monthly payment shouldn't exceed 10% of current cash
        if (monthlyPayment > this.player.cash * 0.1) {
            return { success: false, error: "Monthly payment too high relative to cash reserves" };
        }
        
        // Create loan
        const loan = new this.Loan(amount, rate, termMonths);
        
        // Add cash and loan
        this.player.cash += amount;
        this.player.loans.push(loan);
        
        // Add news
        this._pushNews(`${this.player.name} secured a ${formatMoney(amount)} loan at ${(rate * 100).toFixed(1)}% APR.`);
        
        return { success: true };
    }

    playerBuyBond(amount, termQuarters, rate) {
        /**
         * Buy a bond for the player's company.
         */
        if (amount <= 0 || termQuarters <= 0 || rate <= 0) {
            return { success: false, error: "Invalid bond parameters" };
        }
        
        if (amount < 5000) {
            return { success: false, error: "Minimum bond investment is $5,000" };
        }
        
        if (amount > 5000000) {
            return { success: false, error: "Maximum bond investment is $5,000,000" };
        }
        
        // Check if player can afford it
        if (this.player.cash < amount) {
            return { success: false, error: "Insufficient funds to purchase this bond" };
        }
        
        // Create bond
        const bond = new this.Bond(amount, rate, termQuarters);
        
        // Deduct cash and add bond
        this.player.cash -= amount;
        this.player.bonds.push(bond);
        
        // Add news
        this._pushNews(`${this.player.name} invested ${formatMoney(amount)} in bonds yielding ${(rate * 100).toFixed(1)}% annually.`);
        
        return { success: true };
    }

    playerInitiateAcquisition(targetName, price) {
        /**
         * Initiate an acquisition of an AI company.
         */
        if (!targetName || price <= 0) {
            return { success: false, error: "Invalid acquisition parameters" };
        }
        
        // Find the target company
        const target = this.aiCompanies.find(company => company.name === targetName);
        if (!target) {
            return { success: false, error: "Target company not found" };
        }
        
        // Check if already pending
        const alreadyPending = this.pendingAcquisitions.some(acq => acq[1] === targetName);
        if (alreadyPending) {
            return { success: false, error: "Acquisition already pending for this company" };
        }
        
        // Check if player can afford it
        if (this.player.cash < price) {
            return { success: false, error: "Insufficient funds for this acquisition" };
        }
        
        // Check if target is protected by high growth
        if (this._isTargetInTop2Growth(target)) {
            return { success: false, error: "Target company is protected by high growth (>30% last quarter)" };
        }
        
        // Add to pending acquisitions
        this.pendingAcquisitions.push([this.player, targetName, price, this.turnIndex]);
        
        // Add news
        this._pushNews(`${this.player.name} submitted acquisition offer for ${targetName} at ${formatMoney(price)}.`);
        
        return { success: true };
    }
} 