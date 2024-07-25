/**
 * This function creates a cache array given a memory size in
 * block or word.
 * 
 * @param {*} cms 
 * @param {*} bs 
 * @param {*} type 
 * @returns cache array
 */
function createCache(cms, bs, type) {
    const cache = [];
    if(type == 'word') {
        cms = cms/bs;
    }
    for(let i = 0; i < cms; i++) {
        cache[i] = {age:0,block:undefined,word:undefined};
    }
    return cache;
}

/**
 * This function translate the string sequence into an integer array.
 * 
 * @param {*} seq 
 * @returns array of integer
 */
function translateSeq(seq) {
    const array = [];
    while(seq.length > 0) {
        if(seq.includes(",")) {
            index = seq.slice(0,seq.indexOf(","));
            seq = seq.slice(seq.indexOf(",") + 1);
            array.push(Number.parseInt(index));
        } else {
            array.push(Number.parseInt(seq));
            seq = "";
        }
    }
    return array;
}

/**
 * This function searches the oldest untouched cache block in cache
 * and returns its index.
 * 
 * @param {*} cache 
 * @returns index with highest age value
 */
function maxIndex(cache) {
    let maxIndex = 0;
    for(let i = 1; i < cache.length; i++) {
        if(cache[maxIndex].age < cache[i].age) {
            maxIndex = i;
        }
    }
    return maxIndex;
}

/**
 * This function searches the cache and checks if it
 * contains the specified block.
 * 
 * @param {*} cache 
 * @param {*} block 
 * @returns index of the cache block if it exist and -1 if it does not
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
 * This function maps an address to a block in the main memory.
 * 
 * @param {*} address 
 * @param {*} bs 
 * @returns index of the block the address is mapped to.
 */
function mapAddressToBlock(address, bs) {
    let index = Number.parseInt(address/bs);
    return index;
}

function updateAgeMiss(cache, maxIndex) {
    for(let i = 0; i < cache.length; i++) {
        if(maxIndex != i) {
            cache[i].age++;
        }
    }
    cache[maxIndex].age = 0;
}

function updateAgeHit(cache, hitIndex) {
    for(let i = 0; i < cache.length; i++) {
        if((hitIndex != i) && (cache[i].age < cache[hitIndex].age)) {
            cache[i].age++;
        }
    }
    cache[hitIndex].age = 0;
}

function simulateCache() {
    const bs = document.forms['main-form']['bs'].value;
    const mms = document.forms['main-form']['mms'].value;
    const mms_type = document.forms['main-form']['mms-type'].value;
    const cms = document.forms['main-form']['cms'].value;
    const cms_type = document.forms['main-form']['cms-type'].value;
    const seq = document.forms['main-form']['seq'].value;
    const seq_type = document.forms['main-form']['seq-type'].value;
    const cat = document.forms['main-form']['cat'].value;
    const mat = document.forms['main-form']['mat'].value;
    
    const cache = createCache(cms, bs, cms_type);
    let hit = 0;
    let miss = 0;

    flow = translateSeq(seq);

    // Full Associative Mapping with (LRU)
    for(let i = 0; i < flow.length; i++) {
        let hitIndex = contains(cache,flow[i]);
        console.log('hit' + hitIndex);
        if(hitIndex != -1) {
            hit++;
            updateAgeHit(cache, hitIndex);
        } else {
            miss++
            let max = maxIndex(cache);
            updateAgeMiss(cache, max);
            cache[max].block = flow[i];
        }
    }

    document.getElementById('res-cache-hits').innerHTML = cache[0].block;
    document.getElementById('res-cache-miss').innerHTML = cache[1].block;
    document.getElementById('res-miss-pen').innerHTML = cache[2].block;
    document.getElementById('res-ave-mat').innerHTML = cache[3].block;


    return false;
}