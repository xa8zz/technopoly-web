// utils.js - JavaScript version of Python utility functions

export function clamp(value, minVal, maxVal) {
    return Math.max(minVal, Math.min(value, maxVal));
}

export function formatMoney(val) {
    if (val >= 1000000000) {
        return `$${(val / 1000000000).toFixed(2)}B`;
    } else if (val >= 1000000) {
        return `$${(val / 1000000).toFixed(2)}M`;
    } else if (val >= 1000) {
        return `$${(val / 1000).toFixed(2)}K`;
    } else {
        return `$${val.toFixed(2)}`;
    }
}

export function randomCompanyName(prefixes, suffixes, usedNames) {
    while (true) {
        const pre = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
        const name = `${pre}${suf}`;
        if (!usedNames.has(name)) {
            usedNames.add(name);
            return name;
        }
    }
}

export function randomProductName(usedNames) {
    const prefixSamples = [
        "Sky", "Neo", "Prime", "Nova", "Aero", "Delta", "Zeta", "Omega", "Quantum", "Hyper",
        "Green", "Cyber", "Mono", "Alpha", "Aqua"
    ];
    const suffixSamples = [
        "Flow", "Boost", "Hub", "Core", "Link", "Edge", "Sphere", "Guard", "Gate", "Layer",
        "Matrix", "Flash", "Pulse", "Logic", "Sense"
    ];
    
    while (true) {
        const pr = prefixSamples[Math.floor(Math.random() * prefixSamples.length)];
        const sf = suffixSamples[Math.floor(Math.random() * suffixSamples.length)];
        const n = pr + sf;
        if (!usedNames.has(n)) {
            usedNames.add(n);
            return n;
        }
    }
} 