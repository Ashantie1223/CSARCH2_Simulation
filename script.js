let hitIndex;
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
        cache[i] = {age:0,block:undefined};
    }
    return cache;
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
 * contains a specified block.
 * 
 * @param {*} block 
 * @returns index of the block if it exist and -1 if it does not
 */
function contains(cache,block) {
    for(let i = 0; i < cache.length; i++) {
        if(cache[i].value == block) {
            return i;
        }
    }
    return -1;
}


function updateAgeMiss(value, index, array) {
    if(maxIndex(array) != index) {
        value.age++;
    } else {
        value.age = 0;
    }
    return value;
}

function updateAgeHit(value, index, array) {
    if(hitIndex != index && value.age < array[hitIndex].age) {
         value.age++;
    } else if(hitIndex == index) {
        value.age = 0;
    }
    return value;
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

    

    return false;
}