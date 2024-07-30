/**
 * This script toggles between light and dark mode based on user preference
 * and system color scheme. It also simulates cache memory operations based
 * on user input and generates relevant outputs.
 */
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".nav-toggle h1"); // toggle button element

    // Add click event listener to the toggle button to switch between dark and light mode
    toggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        document.body.classList.toggle("light-mode");

        // Update the button text based on the current mode
        if (document.body.classList.contains("dark-mode")) {
            toggleButton.textContent = "࣪ ִֶָ☾.";
        } else {
            toggleButton.textContent = "⋆☀︎.";
        }
    });

    // Set initial mode based on user's preference
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDarkScheme) {
        document.body.classList.add("dark-mode");
        toggleButton.textContent = "࣪ ִֶָ☾.";
    } else {
        document.body.classList.add("light-mode");
        toggleButton.textContent = "⋆☀︎.";
    }
});

/**
 * Checks the validity of input values.
 * @param {number} bs - Block size.
 * @param {number} mms - Main memory size.
 * @param {string} mms_type - Main memory size type (block/word).
 * @param {number} cms - Cache memory size.
 * @param {string} cms_type - Cache memory size type (block/word).
 * @param {string} seq - Sequence of memory accesses.
 * @param {string} seq_type - Sequence type (block/word).
 * @param {number} cat - Cache access time.
 * @param {number} mat - Memory access time.
 * @returns {string} Error message if any input is invalid, otherwise an empty string.
 */
function checkInputs(bs,mms,mms_type,cms,cms_type,seq,seq_type,cat,mat) {
    const blockSeq = translateSeq(seq);
    const wordSeq = seq.split(",").map(index => {return Number.parseInt(index)});
    // check for NaN inputs 
    if(isNaN(bs)){return 'Error: Block Size input returns NaN';}
    if(isNaN(mms)){return 'Error: MM Memory Size input returns NaN';}
    if(isNaN(cms)){return 'Error: Cache Memory Size input returns NaN';}
    for(let i = 0; i < blockSeq.length; i++) {
        if(blockSeq[i] != blockSeq[i]) {return 'Error: Sequence elements input returns NaN'}
    }
    if(isNaN(cat)){return 'Error: Cache Access Time input returns NaN';}
    if(isNaN(mat)){return 'Error: Memory Access Time input returns NaN';}

    // check valid blocks in sequence
    switch(mms_type + "-" + seq_type){
        case "block-block":
            if(Math.max.apply(null,blockSeq) > mms){return 'Error: Element/s in Sequence exceeds MM Memory Size'}
            break;
        case "block-word":
            if(Math.max.apply(null,blockSeq) > mms*bs){return 'Error: Element/s in Sequence exceeds MM Memory Size'}
            break;
        case "word-word":
            if(Math.max.apply(null,wordSeq) > mms){return 'Error: Element/s in sequence exceeds MM Memory Size'}
            break;
        case "word-block":
            if(Math.max.apply(null,blockSeq) > mms/bs){return 'Error: Element/s in sequence exceeds MM Memory Size'}
            break;
    }
    // check memory size
    if(mms_type === 'word'){
        if(mms % bs !== 0){return 'Error: MM Memory Size does not match Block Size'}
    }
    if(cms_type === 'word'){
        if(cms % bs !== 0){return 'Error: Cache Memory Size does not match Block Size'}
    }
    return '';
}


/**
 * Translates the sequence based on its type and block size.
 * @param {string} seq - Sequence of memory accesses.
 * @param {string} seq_type - Sequence type (block/word).
 * @param {number} bs - Block size.
 * @returns {number[]} Translated sequence.
 */
function translateSeq(seq, seq_type, bs) {
    return seq.split(",").map(index => {
        return seq_type === 'word' ? Math.floor(index / bs) : Number.parseInt(index);
    });
}

/**
 * Checks if a cache contains a specific block.
 * @param {Array} cache - Cache memory array.
 * @param {number} block - Block to check.
 * @returns {number} Index of the block if found, otherwise -1.
 */
function contains(cache, block) {
    return cache.findIndex(item => item.block === block);
}

/**
 * Checks if the cache is full.
 * @param {Array} cache - Cache memory array.
 * @returns {number} Index of the first empty slot if found, otherwise -1.
 */
function checkFull(cache) {
    return cache.findIndex(item => item.block === undefined);
}

/**
 * Updates the cache with a new block.
 * @param {Array} cache - Cache memory array.
 * @param {number} cacheSize - Cache size.
 * @param {number} block - Block to add.
 * @param {number} index - Current index in the sequence.
 * @param {number} recentIndex - Most recently used cache index.
 * @returns {number} Updated recent index.
 */
function updateCache(cache, cacheSize, block, index, recentIndex) {
    if (cache.length < cacheSize) {
        cache.push({ block: block, age: [index], data: [block] });
        return cache.length - 1;
    } else {
        cache[recentIndex].block = block;
        cache[recentIndex].age.push(index);
        cache[recentIndex].data.push(block);
        return recentIndex;
    }
}

/**
 * Computes the miss penalty based on the cache miss mode.
 * @param {string} cmm - Cache miss mode (no-load, yes-load, no-write, yes-write).
 * @param {number} cat - Cache access time.
 * @param {number} mat - Memory access time.
 * @param {number} bs - Block size.
 * @returns {number} Miss penalty in nanoseconds.
 */
function computeMissPenalty(cmm, cat, mat, bs) {
    switch(cmm) {
        case 'no-load':
            return cat + (bs * mat) + cat;
        case 'yes-load':
            return cat + mat + cat;
        case 'no-write':
            return cat + mat;
        case 'yes-write':
            return cat + (bs * mat) + cat + mat;
    }
    
}

/**
 * Generates a snapshot of the entire cache.
 * @param {Array} cache - Cache memory array.
 * @returns {string} HTML table of the cache snapshot.
 */
function generateCacheSnapshotAll(cache) {
    let snapshot = "<thead><tr><th>Block</th><th>Age</th><th>Data</th></tr></thead><tbody>";
    for (let i = 0; i < cache.length; i++) {
        snapshot += `<tr><td>${i}</td><td>${cache[i].age.join(', ')}</td><td>${cache[i].data.join(', ')}</td></tr>`;
    }
    return snapshot + "</tbody>";
}

/**
 * Generates a snapshot of the final state of the cache.
 * @param {Array} cache - Cache memory array.
 * @returns {string} HTML table of the final cache snapshot.
 */
function generateCacheSnapshotFinal(cache) {
    let snapshot = "<thead><tr><th>Block</th><th>Data</th></tr></thead><tbody>";
    for (let i = 0; i < cache.length; i++) {
        snapshot += `<tr><td>${i}</td><td>${cache[i].data[cache[i].data.length - 1]}</td></tr>`;
    }
    return snapshot + "</tbody>";
}

/**
 * Generates a table of hits and misses for each memory access in the sequence.
 * @param {Array} seq - Sequence of memory accesses.
 * @param {Array} hitMiss - Array of hit/miss objects.
 * @returns {string} HTML table of sequence hit/miss data.
 */
function generateSeqHitMiss(seq, hitMiss) {
    let snapshot = "<thead><tr><th>Sequence</th><th>Hit</th><th>Miss</th><th>Block</th></tr></thead><tbody>";
    for (let i = 0; i < seq.length; i++) {
        snapshot += `<tr><td>${seq[i]}</td><td>${hitMiss[i].hit ? '✔' : ''}</td><td>${hitMiss[i].miss ? '✘' : ''}</td><td>${hitMiss[i].block !== undefined ? hitMiss[i].block : ''}</td></tr>`;
    }
    return snapshot + "</tbody>";
}

/**
 * Simulates the cache memory based on user input and generates relevant outputs.
 * @returns {boolean} Always returns false to prevent form submission of there is an error.
 */
function simulateCache() {
    const bs = Number(document.forms['main-form']['bs'].value);
    const mms = Number(document.forms['main-form']['mms'].value);
    const mms_type = document.forms['main-form']['mms-type'].value;
    const cms = Number(document.forms['main-form']['cms'].value);
    const cms_type = document.forms['main-form']['cms-type'].value;
    const seq = document.forms['main-form']['seq'].value;
    const seq_type = document.forms['main-form']['seq-type'].value;
    const cat = Number(document.forms['main-form']['cat'].value);
    const mat = Number(document.forms['main-form']['mat'].value);
    const cmm = document.forms['main-form']['cmm'].value;

    let error = checkInputs(bs,mms,mms_type,cms,cms_type,seq,seq_type,cat,mat);
    document.getElementById('input-error').innerHTML = error;

    if(!error.includes("Error")){
        const cache = [];
        let cacheSize;
        if (cms_type === 'word') {
            cacheSize = Math.floor(cms / bs);
        } else {
            cacheSize = cms;
        }

        const programFlow = translateSeq(seq, seq_type, bs);
        let hit = 0;
        let miss = 0;
        let recentIndex = 0;

        const hitMiss = [];
        
        // Simulate cache operations
        for (let i = 0; i < programFlow.length; i++) {
            const hitIndex = contains(cache, programFlow[i]);
            if (hitIndex !== -1) {
                hit++;
                recentIndex = hitIndex;
                cache[hitIndex].age.push(i); 
                hitMiss.push({ hit: true, miss: false, block: hitIndex });
            } else {
                miss++;
                recentIndex = updateCache(cache, cacheSize, programFlow[i], i, recentIndex);
                hitMiss.push({ hit: false, miss: true, block: recentIndex });
            }
        }

        const totalAccesses = hit + miss;
        const missPenalty = computeMissPenalty(cmm, cat, mat, bs);
        const aveMAT = (hit / totalAccesses) * cat + (miss / totalAccesses) * missPenalty;
        const totalMAT = hit * bs * cat + miss * (cat + mat * bs + cat * bs);
        const hitRateFrac = `${hit}/${totalAccesses}`;
        const hitRatePercent = ((hit / totalAccesses) * 100).toFixed(2);
        const missRateFrac = `${miss}/${totalAccesses}`;
        const missRatePercent = ((miss / totalAccesses) * 100).toFixed(2);

        // Display results
        document.getElementById('res-cache-hits').innerHTML = hitRateFrac;
        document.getElementById('res-cache-miss').innerHTML = missRateFrac;
        document.getElementById('res-hit-rate-percent').innerHTML = hitRatePercent + '%';
        document.getElementById('res-miss-rate-percent').innerHTML = missRatePercent + '%';
        document.getElementById('res-miss-pen').innerHTML = missPenalty + ' ns';
        document.getElementById('res-ave-mat').innerHTML = aveMAT + ' ns';
        document.getElementById('res-total-mat').innerHTML = totalMAT + ' ns';

        // Display cache snapshots and hit/miss sequence
        document.getElementById('cache-all').innerHTML = generateCacheSnapshotAll(cache);
        document.getElementById('cache-final').innerHTML = generateCacheSnapshotFinal(cache);
        document.getElementById('seq-hit-miss').innerHTML = generateSeqHitMiss(programFlow, hitMiss);

        document.querySelector('.output-parent').classList.add('active');
    } else {
        document.querySelector('.output-parent').classList.remove('active');
    }
    return false;
}

/**
 * Outputs the simulation results to a file.
 * @returns {boolean} - False to prevent form submission.
 */
function outputToFile() {
    const filename = document.forms['out-to-file']['filename'].value;

    let content = `Cache Hits: ${document.getElementById('res-cache-hits').innerHTML}\n`;
    content += `Cache Miss: ${document.getElementById('res-cache-miss').innerHTML}\n`;
    content += `Hit Rate: ${document.getElementById('res-hit-rate-percent').innerHTML}\n`;
    content += `Miss Rate: ${document.getElementById('res-miss-rate-percent').innerHTML}\n`;
    content += `Miss Penalty: ${document.getElementById('res-miss-pen').innerHTML}\n`;
    content += `Average Memory Access Time: ${document.getElementById('res-ave-mat').innerHTML}\n`;
    content += `Total Memory Access Time: ${document.getElementById('res-total-mat').innerHTML}\n`;

    const snapshotAll = document.getElementById('cache-all').innerHTML;
    const snapshotFinal = document.getElementById('cache-final').innerHTML;
    const seqHitMiss = document.getElementById('seq-hit-miss').innerHTML;

    content += `\nCache Snapshot All (CSV):\n${snapshotAll.replace(/<\/tr>/g, "\n").replace(/<\/t(h|d)><t(h|d)>/g, ",").replace(/, /g, "-").replace(/<\/?[^>]+(>|$)/g, "")}\n`;
    content += `Cache Snapshot Final (CSV):\n${snapshotFinal.replace(/<\/tr>/g, "\n").replace(/<\/t(h|d)><t(h|d)>/g, ",").replace(/<\/?[^>]+(>|$)/g, "")}\n`;
    content += `Sequence Hit/Miss (CSV):\n${seqHitMiss.replace(/<\/tr>/g, "\n").replace(/<\/t(h|d)><t(h|d)>/g, ",").replace(/<\/?[^>]+(>|$)/g, "")}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`;
    link.click();

    return false;
}