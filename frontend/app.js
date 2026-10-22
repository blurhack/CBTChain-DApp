// CBTChain frontend. After deployment, paste the contract address below.
const CONTRACT_ADDRESS = "0x51E077E60Ea2f3d8f6da7086a0b3c0364f4f86cF";
const SEPOLIA_CHAIN_ID = 11155111n;
const ABI = [
  "function owner() view returns (address)",
  "function auditCount() view returns (uint256)",
  "function registerAudit(string sessionRef, string eventType, bytes32 fileHash) returns (uint256)",
  "function getAudit(uint256 id) view returns (uint256 recordId, string sessionRef, string eventType, bytes32 fileHash, bytes32 previousRecordHash, address submittedBy, uint256 timestamp, bytes32 recordHash)",
  "function verifyFileHash(uint256 id, bytes32 candidateHash) view returns (bool)"
];

let provider, signer, contract, currentAccount, isOwner = false;
const $ = (id) => document.getElementById(id);
function message(text) { $("message").textContent = text; }
function shortAddress(value) { return value ? `${value.slice(0, 6)}…${value.slice(-4)}` : "—"; }
function validAddressConfigured() {
  return ethers.isAddress(CONTRACT_ADDRESS);
}
function bytesToHex(buffer) {
  return "0x" + Array.from(new Uint8Array(buffer), b => b.toString(16).padStart(2, "0")).join("");
}
async function hashFile(file) {
  if (!file) throw new Error("Please choose a file first.");
  const buffer = await file.arrayBuffer();
  return bytesToHex(await crypto.subtle.digest("SHA-256", buffer));
}
function showHash(target, value) { $(target).textContent = value; }
function setActionButtons() {
  $("registerBtn").disabled = !contract || !isOwner || !$("registerFile").files.length;
  $("verifyBtn").disabled = !contract || !$("verifyFile").files.length || !$("verifyId").value;
  $("lookupBtn").disabled = !contract || !$("lookupId").value;
}
async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("MetaMask was not detected. Open this page in a browser with MetaMask enabled.");
    if (!validAddressConfigured()) throw new Error("Set CONTRACT_ADDRESS in frontend/app.js to the deployed contract address first.");
    provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = await provider.getSigner();
    currentAccount = await signer.getAddress();
    const network = await provider.getNetwork();
    if (network.chainId !== SEPOLIA_CHAIN_ID) {
      throw new Error("Please switch MetaMask to Ethereum Sepolia, then connect again.");
    }
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    const owner = await contract.owner();
    isOwner = owner.toLowerCase() === currentAccount.toLowerCase();
    $("walletStatus").textContent = `Connected: ${shortAddress(currentAccount)} • Sepolia`;
    $("accountShort").textContent = shortAddress(currentAccount);
    $("networkDot").classList.add("good");
    $("contractStatus").textContent = "Connected";
    $("registerBtn").textContent = isOwner ? "Register on blockchain" : "Administrator only";
    await refreshCount();
    setActionButtons();
    message(isOwner ? "Wallet connected. This account is the contract administrator." : "Wallet connected, but this account is not the administrator. You can view and verify records, but registration is restricted.");
  } catch (err) {
    message(err.shortMessage || err.message || String(err));
  }
}
async function refreshCount() {
  if (!contract) return;
  const count = await contract.auditCount();
  $("auditCount").textContent = count.toString();
}
$("connectBtn").addEventListener("click", connectWallet);

$("registerFile").addEventListener("change", async () => {
  try {
    const file = $("registerFile").files[0];
    if (!file) { showHash("registerHash", "Select a file to calculate its hash."); setActionButtons(); return; }
    message("Calculating SHA-256 locally in your browser…");
    const hash = await hashFile(file);
    showHash("registerHash", hash);
    message("File hash calculated. The file itself has not been uploaded by this page.");
  } catch (err) { message(err.message); }
  setActionButtons();
});
$("registerBtn").addEventListener("click", async () => {
  try {
    if (!contract || !isOwner) throw new Error("Connect the administrator wallet first.");
    const sessionRef = $("sessionRef").value.trim();
    const eventType = $("eventType").value;
    const file = $("registerFile").files[0];
    if (!sessionRef) throw new Error("Enter a session reference.");
    const hash = await hashFile(file);
    showHash("registerHash", hash);
    message("Confirm the registration transaction in MetaMask.");
    const tx = await contract.registerAudit(sessionRef, eventType, hash);
    message(`Transaction sent: ${tx.hash}. Waiting for confirmation…`);
    const receipt = await tx.wait();
    await refreshCount();
    message(`Audit record registered successfully in block ${receipt.blockNumber}. Transaction: ${tx.hash}`);
  } catch (err) { message(err.shortMessage || err.reason || err.message || String(err)); }
});
$("verifyFile").addEventListener("change", async () => {
  try {
    const file = $("verifyFile").files[0];
    if (!file) { showHash("verifyHash", "Choose the file you want to verify."); setActionButtons(); return; }
    const hash = await hashFile(file);
    showHash("verifyHash", hash);
  } catch (err) { message(err.message); }
  setActionButtons();
});
$("verifyId").addEventListener("input", setActionButtons);
$("lookupId").addEventListener("input", setActionButtons);
$("verifyBtn").addEventListener("click", async () => {
  const result = $("verifyResult");
  result.classList.remove("hidden", "bad");
  try {
    const id = BigInt($("verifyId").value);
    const hash = await hashFile($("verifyFile").files[0]);
    const ok = await contract.verifyFileHash(id, hash);
    result.classList.toggle("bad", !ok);
    result.textContent = ok
      ? "MATCH: this file's SHA-256 hash matches the hash recorded for this audit ID."
      : "NO MATCH: the file hash does not match the hash recorded for this audit ID.";
  } catch (err) {
    result.classList.add("bad");
    result.textContent = err.shortMessage || err.reason || err.message || String(err);
  }
});
$("lookupBtn").addEventListener("click", async () => {
  try {
    const r = await contract.getAudit(BigInt($("lookupId").value));
    const timestamp = new Date(Number(r.timestamp) * 1000).toLocaleString();
    $("recordOutput").textContent = JSON.stringify({
      id: r.recordId.toString(),
      sessionRef: r.sessionRef,
      eventType: r.eventType,
      fileHash: r.fileHash,
      previousRecordHash: r.previousRecordHash,
      submittedBy: r.submittedBy,
      timestamp: timestamp,
      recordHash: r.recordHash
    }, null, 2);
  } catch (err) {
    $("recordOutput").textContent = err.shortMessage || err.reason || err.message || String(err);
  }
});
if (window.ethereum) {
  window.ethereum.on?.("accountsChanged", () => window.location.reload());
  window.ethereum.on?.("chainChanged", () => window.location.reload());
}
