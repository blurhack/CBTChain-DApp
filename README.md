# CBTChain — Blockchain-Based CBT Audit Log DApp

**Network:** Ethereum Sepolia (chain ID `11155111`)  
**Deployed contract:** `0x51E077E60Ea2f3d8f6da7086a0b3c0364f4f86cF`  
**Deployment transaction:** `0x434eb0680617089e0e8e2784b01eeced00bb33a123ecbb22760cb1367ad8b280`  
**Explorer:** https://sepolia.etherscan.io/address/0x51E077E60Ea2f3d8f6da7086a0b3c0364f4f86cF

## Overview
CBTChain is an academic DApp prototype for recording and checking cryptographic file hashes associated with Computer-Based Test (CBT) audit events. The Solidity smart contract is the blockchain backend; HTML/CSS/JavaScript, MetaMask and Ethers.js form the frontend.

## Features
- Administrator-only audit registration.
- Stores SHA-256 file hashes and limited event metadata on Sepolia.
- Links each record to the previous record's record hash.
- Retrieves audit records from the contract.
- Verifies whether a selected file matches the stored hash.
- MetaMask wallet connection and transaction approval.
- GitHub Actions workflow to publish the frontend to GitHub Pages.

## Structure
- `contracts/CBTChain.sol` — Solidity smart contract / blockchain backend.
- `frontend/index.html` — UI.
- `frontend/style.css` — styles.
- `frontend/app.js` — MetaMask and contract calls; configured for the deployed Sepolia address.
- `frontend/contract-abi.json` — ABI reference.
- `tests/TEST_PLAN.md` — manual test plan.
- `.github/workflows/deploy-pages.yml` — Pages deployment workflow.

## Run locally
1. Install/unlock MetaMask and select Ethereum Sepolia.
2. Open a terminal in `frontend`.
3. Run `python -m http.server 8000` (or `py -m http.server 8000` on Windows).
4. Open http://localhost:8000.
5. Click Connect MetaMask and approve the connection.
6. The connected wallet must be the contract administrator to register audit entries. Other wallets can read/verify but registration should revert.

## Publish on GitHub Pages
1. Create a GitHub repository named `CBTChain-DApp`.
2. Push/upload all files to the `main` branch.
3. Open repository **Settings → Pages** and select **GitHub Actions** as the build/deployment source if prompted.
4. Open **Actions** and wait for “Deploy CBTChain frontend to GitHub Pages” to complete successfully.
5. Open the published URL shown by the workflow; typically `https://YOUR-USERNAME.github.io/CBTChain-DApp/`.

The frontend is static and uses Ethers.js from a CDN. The deployed contract remains on Sepolia; users need MetaMask, Sepolia selected, and test ETH to submit transactions.

## Test plan
Record observed results; do not mark tests passed before running them:
1. Valid registration succeeds and audit count increases.
2. Empty session reference reverts.
3. Zero file hash reverts.
4. A second wallet attempting registration reverts with `Only administrator`.
5. The original file returns MATCH.
6. A changed file returns NO MATCH.
7. Reading ID 0 or a nonexistent ID reverts.
8. A valid audit ID displays the stored record.

## Security and limitations
- Never put exam papers, candidate answers, passwords, private keys, recovery phrases or personal data on-chain.
- A blockchain timestamp is not a trusted CBT system clock.
- Hash matching does not prove the original file/event was truthful.
- This is a student prototype, not a production examination platform.
- Never commit wallet seed phrases, private keys, credentials or `.env` secrets.

## Submission
Add actual test outcomes, screenshots, the GitHub repository URL, deployed contract address and transaction hash to your final assignment document.
