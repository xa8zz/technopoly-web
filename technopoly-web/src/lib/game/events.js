// events.js - JavaScript version of Python events module

/**
 * Handles the new event system with:
 * - 16 normal events (8 markets * ±5% growth)
 * - 1 breaking event: Global Recession
 * One event is picked each quarter if not in a recession,
 * or if in a recession, we skip normal events for 3 quarters.
 */

export class GameEvent {
    /**
     * Represents a single event with:
     * - name
     * - description
     * - effect function
     * - is_breaking (True if global recession)
     */
    constructor(name, description, isBreaking = false) {
        this.name = name;
        this.description = description;
        this.isBreaking = isBreaking;
        this.turnHappened = null;
    }
}

export class EventManager {
    /**
     * Orchestrates the random event pick each quarter.
     * - 16 normal events: each for a market (+5% or -5% growth).
     * - 1 breaking event: global recession.
     * If a global recession is in effect, we skip events for 3 quarters.
     */
    constructor(markets) {
        this.markets = markets;
        this.last5Events = [];
        this.recessionActive = false;
        this.recessionQuartersLeft = 0;

        // Pre-generate the normal events for each market ±5%
        this.normalEvents = [];
        for (const m of this.markets) {
            // +5
            const ename = `Strong demand for ${m.name}`;
            const edesc = `+5% growth this quarter in ${m.name}`;
            this.normalEvents.push(new GameEvent(ename, edesc, false));

            // -5
            const ename2 = `Weak demand for ${m.name}`;
            const edesc2 = `-5% growth this quarter in ${m.name}`;
            this.normalEvents.push(new GameEvent(ename2, edesc2, false));
        }

        // Breaking event: global recession
        this.recessionEvent = new GameEvent(
            "Global Recession",
            "ALL markets freeze growth and shrink 5% each quarter for 3 quarters",
            true
        );
    }

    pickRandomEvent() {
        /**
         * If not in a recession, 1/17 chance of the global recession,
         * or pick from the normal events. Return the event chosen.
         */
        // If a global recession is active, we do not pick new events for 3 quarters
        if (this.recessionActive) {
            return null; // means skip
        }

        // 17 total events => 16 normal + 1 global
        // We'll do a 1/17 chance for global. If not chosen, pick from normal.
        const r = Math.floor(Math.random() * 17) + 1;
        if (r === 17) {
            return this.recessionEvent;
        } else {
            return this.normalEvents[Math.floor(Math.random() * this.normalEvents.length)];
        }
    }

    applyEvent(event) {
        /**
         * Actually implement the event's effect. Modify the relevant market or global.
         */
        if (event === null) {
            return; // skip if no event
        }

        // Add to last_5_events
        if (this.last5Events.length >= 5) {
            this.last5Events.shift();
        }
        this.last5Events.push(event);

        if (event.isBreaking) {
            // Global Recession: mark all markets for recession.
            this.recessionActive = true;
            this.recessionQuartersLeft = 3;
            for (const m of this.markets) {
                m.isInGlobalRecession = true;
                m.recessionQuartersLeft = 3;
            }
        } else {
            // Before applying a new non-breaking event, reset each market's current growth rate to its base.
            for (const m of this.markets) {
                m.growthRate = m.baseGrowthRate;
            }

            // Apply the temporary modifier.
            if (event.name.includes("Strong demand for")) {
                const marketName = event.name.replace("Strong demand for ", "").trim();
                for (const mk of this.markets) {
                    if (mk.name === marketName) {
                        // For a positive event, temporarily bump the growth rate.
                        mk.growthRate += 0.05;
                    }
                }
            } else if (event.name.includes("Weak demand for")) {
                const marketName = event.name.replace("Weak demand for ", "").trim();
                for (const mk of this.markets) {
                    if (mk.name === marketName) {
                        // For a negative event, temporarily lower the growth rate but not below zero.
                        mk.growthRate = Math.max(0, mk.growthRate - 0.05);
                    }
                }
            }
        }
    }

    formatNewsFeed(currentYear, currentQ) {
        /**
         * Return a list of lines describing the last 5 events,
         * but show the date they actually happened (from ev.turn_happened).
         */
        function computeYearQFromTurn(turnIndex) {
            const baseYear = 2000; // match your start_year in main
            const yOffset = Math.floor(turnIndex / 4);
            const q = (turnIndex % 4) + 1;
            return [baseYear + yOffset, q];
        }

        const lines = [];
        for (let i = this.last5Events.length - 1; i >= 0; i--) {
            const ev = this.last5Events[i];
            let eyear, eq;
            if (ev.turnHappened !== null) {
                [eyear, eq] = computeYearQFromTurn(ev.turnHappened);
            } else {
                eyear = currentYear;
                eq = currentQ; // fallback if missing
            }

            if (ev.isBreaking) {
                lines.push(`${eyear}, Q${eq} - Global Recession (remaining ${this.recessionQuartersLeft} quarters)`);
            } else {
                lines.push(`${eyear}, Q${eq}: ${ev.name}, ${ev.description}`);
            }
        }
        return lines;
    }

    updateRecession() {
        /**
         * Update the global recession state by decrementing the recession counter.
         * When the recession counter reaches 0, clear the recession flag.
         */
        if (this.recessionActive) {
            this.recessionQuartersLeft -= 1;
            if (this.recessionQuartersLeft <= 0) {
                this.recessionActive = false;
                // Also clear recession state on all markets.
                for (const m of this.markets) {
                    m.isInGlobalRecession = false;
                    m.recessionQuartersLeft = 0;
                }
            }
        }
    }
} 