/**
 * This function translate the string sequence into an integer array.
 * 
 * @param {*} seq 
 * @returns array of integer
 */
function translateSeq(seq, seq_type, bs) {
    const array = [];
    while(seq.length > 0) {
        if(seq.includes(",")) {
            index = seq.slice(0,seq.indexOf(","));
            seq = seq.slice(seq.indexOf(",") + 1);
            if(seq_type == 'word') {
                index = index / bs;
            }
            array.push(Number.parseInt(index));
        } else {
            if(seq_type == 'word') {
                seq = seq / bs;
            }
            array.push(Number.parseInt(seq));
            seq = "";
        }
    }
    return array;
}

/**
 * This function searches the cache and checks if it
 * contains the specified block.
 * 
 * @param {*} cache 
 * @param {*} block 
 * @returns index of the cache block if it exist and -1 if it does not.
 */
function contains(cache,block) {
    for(let i = 0; i < cache.length; i++) {
        if(cache[i].block == block) {
            return i;
        }
    }
    return -1;
}

/**
 * This function checks if the cache is full. If not, the function
 * will return the index of the next empty cache line.
 * 
 * @param {*} cache 
 * @returns -1 if full and index of the next empty cache line if not.
 */
function checkFull(cache) {
    for(let i = 0; i < cache.length; i++) {
        if(cache[i].block == undefined) {
            return i;
        }
    }
    return -1;
}

function updateCache(cache,cacheSize,block,recentIndex) {
    if(cache.length < cacheSize) {
        cache.push({block:block});
        return cache.length - 1;
    } else {
        cache[recentIndex].block = block;
        return recentIndex;
    }
}

function computeTotalAT (cat,mat,hit,miss,bs) {
    return hit * (bs * cat) + miss * (cat + (mat + cat) * bs);
}

function computeAverageAT(h, c, m) {
    return h*c + (1-h)*m;
}

function computeMissPenalty(cat, mat, bs, act) {
    const action = act.slice(act.indexOf('-') + 1);
    const confirm = act.slice(0, act.indexOf('-'));
    console.log("action: " + action + "\nconfirm: " + confirm);
    switch(action) {
        case 'load':
            switch(confirm) {
                case 'no':
                    return cat + (bs * mat) + cat;
                case 'yes':
                    return cat + mat + cat;
            }
            break
        case 'write':
            switch(confirm) {
                case 'no':
                    return cat + mat;
                case 'yes':
                    return cat + (bs * mat) + cat + mat;
            }
            break;
    }
}

/**
 * This function maps a block to an address in the main memory.
 * 
 * @param {*} block 
 * @param {*} bs 
 * @returns index of the block the address is mapped to.
 */
function mapBlockToAddress(block,bs) {
    let address = block*bs;
    return address; // Converts decimal number to binary
}

function generateCacheSS(cache,cacheSize,mms,mms_type,bs) {
    let snapshot = "";
    // Determine MM size by block
    let mmSize;
    if(mms_type == 'block') {
        mmSize = mms*bs;
    } else {
        mmSize = mms;
    }
    const addressSize = Math.log2(mmSize);
    const wordSize = Math.log2(bs);
    const tagSize = addressSize - wordSize;

    for(let i = 0; i < cacheSize; i++) {
        let baseAddress = mapBlockToAddress(cache[i].block,bs);
        let tag = baseAddress.toString(2).padStart(addressSize,'0').slice(0,tagSize);
        
        for(let j = 0; j < bs; j++) {
            snapshot += "<tr>";
            if(j == 0) {
                snapshot += "<td rowspan =\"" + bs + "\">" + cache[i].block + "</td>";
                snapshot += "<td rowspan =\"" + bs + "\">" + tag + "</td>";
            }
            snapshot += "<td>" + (baseAddress + j).toString(2).padStart(addressSize,'0') + "</td>" + "</tr>";
        }
    }
    return snapshot + "</tbody>"
}

function simulateCache() {
    const bs = Number.parseInt(document.forms['main-form']['bs'].value);
    const mms = Number.parseInt(document.forms['main-form']['mms'].value);
    const mms_type = document.forms['main-form']['mms-type'].value;
    const cms = Number.parseInt(document.forms['main-form']['cms'].value);
    const cms_type = document.forms['main-form']['cms-type'].value;
    const seq = document.forms['main-form']['seq'].value;
    const seq_type = document.forms['main-form']['seq-type'].value;
    const cat = Number.parseInt(document.forms['main-form']['cat'].value);
    const mat = Number.parseInt(document.forms['main-form']['mat'].value);
    const act = document.forms['main-form']['load'].value;
    
    // Create cache array instance
    const cache = [];

    // Determine cache size by block
    let cacheSize;
    if(cms_type == 'word') {
        cacheSize = cms/bs;
    } else {
        cacheSize = cms;
    }

    // Initiate Program Flow into array
    const programFlow = translateSeq(seq, seq_type, bs);
    
    // Initialize variables
    let hit = 0;
    let miss = 0;
    let recentIndex = 0;

    // Main Algorithm: Full Associative Mapping with (MRU)
    for(let i = 0; i < programFlow.length; i++) {
        let hitIndex = contains(cache,programFlow[i]); // Determine if hit
        if(hitIndex != -1) {
            hit++;
            recentIndex = hitIndex;
        } else {
            miss++;
            recentIndex = updateCache(cache,cacheSize,programFlow[i],recentIndex);
        }
    }
    
    // Computations
    missPenalty = computeMissPenalty(cat,mat,bs,act);
    averageAccessTime = computeAverageAT((hit/programFlow.length),cat,missPenalty);
    totalAccessTime = computeTotalAT(cat,mat,hit,miss,bs);

    document.getElementById('res-cache-hits').innerHTML = hit
    document.getElementById('res-cache-miss').innerHTML = miss;
    document.getElementById('res-miss-pen').innerHTML = missPenalty + "ns";
    document.getElementById('res-ave-mat').innerHTML = averageAccessTime.toFixed(2) + "ns";
    document.getElementById('res-total-mat').innerHTML = totalAccessTime + "ns";

    // Generate Cache Snapshot
    let snapshot = "<thead><tr><th>Block</th><th>Tag</th><th>Address</th></tr></thead><tbody>";
    snapshot += generateCacheSS(cache,cacheSize,mms,mms_type,bs);
    document.getElementById('cache').innerHTML = snapshot;

    return false;
}