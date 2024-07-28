document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".nav-toggle h1");

    toggleButton.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        document.body.classList.toggle("light-mode");

        if (document.body.classList.contains("dark-mode")) {
            toggleButton.textContent = "࣪ ִֶָ☾.";
        } else {
            toggleButton.textContent = "⋆☀︎.";
        }
    });

    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDarkScheme) {
        document.body.classList.add("dark-mode");
        toggleButton.textContent = "࣪ ִֶָ☾.";
    } else {
        document.body.classList.add("light-mode");
        toggleButton.textContent = "⋆☀︎.";
    }
});


function translateSeq(seq, seq_type, bs) {
    return seq.split(",").map(index => {
        return seq_type === 'word' ? index / bs : Number.parseInt(index);
    });
}

function contains(cache, block) {
    return cache.findIndex(item => item.block === block);
}

function checkFull(cache) {
    return cache.findIndex(item => item.block === undefined);
}

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

function generateCacheSnapshotAll(cache) {
    let snapshot = "<thead><tr><th>Block</th><th>Age</th><th>Data</th></tr></thead><tbody>";
    for (let i = 0; i < cache.length; i++) {
        snapshot += `<tr><td>${i}</td><td>${cache[i].age.join(', ')}</td><td>${cache[i].data.join(', ')}</td></tr>`;
    }
    return snapshot + "</tbody>";
}

function generateCacheSnapshotFinal(cache) {
    let snapshot = "<thead><tr><th>Block</th><th>Data</th></tr></thead><tbody>";
    for (let i = 0; i < cache.length; i++) {
        snapshot += `<tr><td>${i}</td><td>${cache[i].data[cache[i].data.length - 1]}</td></tr>`;
    }
    return snapshot + "</tbody>";
}

function generateSeqHitMiss(seq, hitMiss) {
    let snapshot = "<thead><tr><th>Sequence</th><th>Hit</th><th>Miss</th><th>Block</th></tr></thead><tbody>";
    for (let i = 0; i < seq.length; i++) {
        snapshot += `<tr><td>${seq[i]}</td><td>${hitMiss[i].hit ? '✔' : ''}</td><td>${hitMiss[i].miss ? '✘' : ''}</td><td>${hitMiss[i].block !== undefined ? hitMiss[i].block : ''}</td></tr>`;
    }
    return snapshot + "</tbody>";
}

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
    const missPenalty = cat + (mat * bs) + cat;
    const aveMAT = (hit / totalAccesses) * cat + (miss / totalAccesses) * missPenalty;
    const totalMAT = hit * bs * cat + miss * (cat + mat * bs + cat * bs);
    const hitRateFrac = `${hit}/${totalAccesses}`;
    const hitRatePercent = ((hit / totalAccesses) * 100).toFixed(2);
    const missRateFrac = `${miss}/${totalAccesses}`;
    const missRatePercent = ((miss / totalAccesses) * 100).toFixed(2);

    document.getElementById('res-cache-hits').innerHTML = hitRateFrac;
    document.getElementById('res-cache-miss').innerHTML = missRateFrac;
    document.getElementById('res-hit-rate-percent').innerHTML = hitRatePercent + '%';
    document.getElementById('res-miss-rate-percent').innerHTML = missRatePercent + '%';
    document.getElementById('res-miss-pen').innerHTML = missPenalty + ' ns';
    document.getElementById('res-ave-mat').innerHTML = aveMAT + ' ns';
    document.getElementById('res-total-mat').innerHTML = totalMAT + ' ns';

    document.getElementById('cache-all').innerHTML = generateCacheSnapshotAll(cache);
    document.getElementById('cache-final').innerHTML = generateCacheSnapshotFinal(cache);
    document.getElementById('seq-hit-miss').innerHTML = generateSeqHitMiss(programFlow, hitMiss);

    document.querySelector('.output-parent').classList.add('active');

    return false;
}

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
    content += `Cache Snapshot All:\n${snapshotAll.replace(/<\/?[^>]+(>|$)/g, "")}`;
    content += `Cache Snapshot Final:\n${snapshotFinal.replace(/<\/?[^>]+(>|$)/g, "")}`;
    content += `Sequence Hit/Miss:\n${seqHitMiss.replace(/<\/?[^>]+(>|$)/g, "")}`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.txt`;
    link.click();

    return false;
}

