const NUVOTokenABI = [
  // ERC20 Standard functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function transferFrom(address, address, uint256) returns (bool)",
  
  // Custom NUVO Token functions
  "function mint(address to, uint256 amount) external",
  "function burn(uint256 amount) external",
  "function burnFrom(address account, uint256 amount) external",
  "function remainingMintableSupply() view returns (uint256)",
  "function remainingToBurn() view returns (uint256)",
  "function burnProgress() view returns (uint256)",
  "function targetSupply() view returns (uint256)",
  "function getBurnTarget() view returns (uint256)",
  "function totalBurnedTokens() view returns (uint256)",
  "function cap() view returns (uint256)",
  "function getTokenStats() view returns (uint256, uint256, uint256, uint256, uint256, uint256, uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount)",
  "event TokensBurned(address indexed from, uint256 amount)"
];

export default NUVOTokenABI;
