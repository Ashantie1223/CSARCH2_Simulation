# CSARCH2_Simulation

This project aims to simulate a cache function using Full Associative Mapping 
with the use of Most Recently Used (MRU) replacement algorithm.

# Inputs
(BS) Block Size           - # of words per block  
(MMS) MM memory size      - # blocks or words  
(CMS) Cache memory size   - # blocks or words  
(SEQ) Program Flow        - Sequence of blocks or words to be accessed in the MM  
(CAT) Cache access time   - # time taken in accessing the cache  
(MAT) Memory access time  - # time taken in accessing the memory  
Cache Miss Memory Read/Write - No Load Through, Load Through, No Write-Allocation, Write Allocation  

# Outputs
(CH) Cache Hits        - # successful hits  
(CM) Cache Miss        - # unsuccessful hits  
(HR) Hit Rate          - % of successful hits
(MR) Miss Rate         - % of unsuccessful hits
(MP) Miss Penalty      - CAT + (MAT * BS) + CAT  
(AVE-MAT) Average MAT  - (CH / (CH + CM)) * CAT + (CM / (CH + CM)) * MP  
(TOT-MAT) Total MAT    - CH * BS * CAT + CM * (CAT + MAT * BS  + CAT * BS)  
Snapshot of cache after simulation  
Option to output result to .txt file  
