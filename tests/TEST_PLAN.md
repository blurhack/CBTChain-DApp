# CBTChain test record sheet

Network: Ethereum Sepolia (chain ID 11155111)  
Contract: `0x51E077E60Ea2f3d8f6da7086a0b3c0364f4f86cF`

| ID | Test | Expected result | Observed result / transaction |
|---|---|---|---|
| T1 | Compile contract | No compiler errors | |
| T2 | Deploy on Sepolia | Contract address returned | |
| T3 | Register valid record | Transaction succeeds; count increases | |
| T4 | Empty session reference | Reverts: Session reference required | |
| T5 | Zero hash | Reverts: File hash cannot be empty | |
| T6 | Registration from second wallet | Reverts: Only administrator | |
| T7 | Verify original file | Returns true / MATCH | |
| T8 | Verify changed file | Returns false / NO MATCH | |
| T9 | Read valid record ID | Stored record displayed | |
| T10 | Read ID 0/nonexistent ID | Reverts: Audit record does not exist | |

Attach screenshots or transaction links as evidence. Fill in observed results only after running each test.
