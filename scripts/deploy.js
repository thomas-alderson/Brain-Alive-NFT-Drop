async function main() {
  const IPFS_IMAGE_METADATA_URI = `ipfs://${process.env.IPFS_IMAGE_METADATA_CID}/`;
  const IPFS_HIDDEN_IMAGE_METADATA_URI = `ipfs://${process.env.IPFS_HIDDEN_IMAGE_METADATA_CID}/hidden.json`;
  let NFT_MINT_DATE = new Date(process.env.NFT_MINT_DATE).getTime(); // in ms 
  console.log(NFT_MINT_DATE);
fwefwefwf
  console.log(
    "Mint date: ",
    new Date(NFT_MINT_DATE).toLocaleDateString("en-US")
  ); // Local date
  console.log(
    "Mint time: ",
    new Date(NFT_MINT_DATE).toLocaleTimeString("en-US")
  ); // Local time

  NFT_MINT_DATE = (new Date(process.env.NFT_MINT_DATE).getTime()/1000); // in secs

  const accounts = await ethers.getSigners(); // hardhat function

  deployer = accounts[0];
  //user1 = accounts[1];

  console.log(
    "Deploying contracts using the deployer account:",
    deployer.address
  );

  //console.log("User account: ", user1.address);

  console.log(
    "Deployer account balance:",
    (await deployer.getBalance()).toString()
  );

  const Contract = await ethers.getContractFactory("OpenPunks");
  const contract = await Contract.deploy(
    process.env.PROJECT_NAME,
    process.env.PROJECT_SYMBOL,
    process.env.MINT_COST,
    process.env.MAX_SUPPLY,
    NFT_MINT_DATE,
    IPFS_IMAGE_METADATA_URI,
    IPFS_HIDDEN_IMAGE_METADATA_URI
  );

  console.log("Contract address:", contract.address);
  console.log("Put this into the contracts-address.json! (for the frontend to read)")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
