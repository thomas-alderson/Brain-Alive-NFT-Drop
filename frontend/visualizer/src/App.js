import { ethers } from "ethers";

//import { connect } from "./helpers";

import styled from "styled-components";

import axios from "axios";

import { useState, useEffect } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import Countdown from "react-countdown";

import { NFTCard } from "./components/NFTCard";
import { NFTModal } from "./components/NFTModal";

import contractABI from "./contracts/OpenPunks.sol/OpenPunks.json";
import contractInfo from "./contracts/OpenPunks.sol/OpenPunks-Address.json";
import config from "./config.json";

// Import CSS
import "./App.css";

// Import Images
import twitter from "./images/socials/twitter.svg";
import instagram from "./images/socials/instagram.svg";
import opensea from "./images/socials/opensea.svg";
import showcase from "./images/showcase.png";

// Import Components
import Navbar from "./Navbar";

function App() {
  let initialNfts = [
    {
      name: "Mario",
      symbol: "SMWC",
      copies: 10,
      image: "https://via.placeholder.com/150",
    },
  ];

  const [showModal, setShowModal] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [nfts, setNfts] = useState(null);

  const [contractWithSigner, setContractWithSigner] = useState(null);
  const [contract, setContract] = useState(null);

  const [contractOwner, setContractOwner] = useState([]);
  const [contractAddress, setContractAddress] = useState([]);
  const [contractBalance, setContractBalance] = useState(0);

  const [supplyAvailable, setSupplyAvailable] = useState(0);

  const [account, setAccount] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [ownerOf, setOwnerOf] = useState([]);

  const [explorerURL, setExplorerURL] = useState(
    "https://sepolia.etherscan.io"
  );
  const [openseaURL, setOpenseaURL] = useState("https://testnets.opensea.io");

  const [isMinting, setIsMinting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [message, setMessage] = useState(null);

  const [currentTime, setCurrentTime] = useState(
    Math.round(new Date().getTime())
  ); // ms
  const [revealTime, setRevealTime] = useState(0);

  const [counter, setCounter] = useState(1);
  const [isCycling, setIsCycling] = useState(false);

  const [isWithdraw, setIsWithdraw] = useState(true);

  const loadWeb3 = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      await loadBlockchainData(provider);

      // Handle a change of account
      window.ethereum.on("accountsChanged", function (accounts) {
        setAccount(accounts[0].toLowerCase());
      });

      // // Handle the new chain.
      // window.ethereum.on("chainChanged", (chainId) => {
      //   window.location.reload();
      // });
    }
  };

  const loadBlockchainData = async (provider) => {
    const contract = new ethers.Contract(
      contractInfo.address,
      contractABI,
      provider
    );
    setContract(contract);

    const allowMintingAfter = await contract.allowMintingAfter(); // sec
    const timeDeployed = await contract.timeDeployed(); // sec

    // console.log(
    //   "Deployed date: ",
    //   new Date(timeDeployed * 1000).toLocaleDateString("en-US") // ms
    // ); // Local date
    // console.log(
    //   "Deployed time: ",
    //   new Date(timeDeployed * 1000).toLocaleTimeString("en-US") // ms
    // ); // Local time

    setCurrentTime(Math.round(new Date().getTime())); // ms
    setRevealTime(
      (
        Number(timeDeployed) * 1000 +
        Number(allowMintingAfter) * 1000
      ).toString()
    ); // must be ms

    // The contract is currently connected to the Provider,
    // which is read-only. You need to connect to a Signer, so
    // that you can pay to send state-changing transactions.
    const addr = await contract.currentContractAddress();
    setContractAddress(addr.toLowerCase());
    //console.log("Get contract address (with provider): ", sender);

    let balance = await contract.currentContractBalance();
    balance = ethers.utils.formatUnits(balance, 18);
    //console.log(balance)
    setContractBalance(balance);

    if (account) {
      // Create the signer instance (passing the address as a string produces an error)
      const signerInstance = await provider.getSigner(account);

      const contractWithSigner = contract.connect(signerInstance);
      setContractWithSigner(contractWithSigner);
      //console.log(contractWithSigner)

      const owner = await contractWithSigner.getOwner();
      setContractOwner(owner.toLowerCase());

      const ownerOf = await contractWithSigner.walletOfOwner(account);
      setOwnerOf(ownerOf);
      //console.log(ownerOf)
      //console.log("Get owner of contact (with signer): ", owner);

      // const until = await contractWithSigner.getSecondsUntilMinting(); // Time difference (sec) revealTime minus deploymentTime
      // console.log("until ", until.toNumber());

      //const sender = await contractWithSigner.getMsgSender();
      //console.log("Get msg.sender of contact (with signer): ", sender);
    }
  };

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0].toLowerCase());
  };

  const mintNFTHandler = async () => {
    if (revealTime > new Date().getTime()) {
      window.alert("Minting is not live yet!");
      return;
    }

    if (!contractWithSigner && !account) {
      window.alert("Sign into MetaMask before minting!");
      return;
    }

    if (ownerOf.length > 0 && contractWithSigner) {
      const ownerOf = await contractWithSigner.walletOfOwner(account);
      setOwnerOf(ownerOf);
      window.alert(
        "Congratulations! You own " +
          ownerOf.length +
          " NFTs. Get ready for one more."
      );
    }

    // Mint NFT
    if (contractWithSigner && account) {
      setIsMinting(true);
      setIsError(false);

      const options = { from: account, value: 55000000000000 }; // Gwei to send
      let transaction = await contractWithSigner.mint(1, options);
      let receipt = await transaction.wait();
      //console.log(receipt);

      // Success
      if (receipt.status === 1) {
        const maxSupply = await contractWithSigner.maxSupply(); // Total available
        const totalSupply = await contractWithSigner.totalSupply(); // Taken so far
        //console.log(maxSupply.toNumber());
        //console.log(totalSupply.toNumber());
        setSupplyAvailable(maxSupply - totalSupply);
        const ownerOf = await contractWithSigner.walletOfOwner(account);
        setOwnerOf(ownerOf);
      } else {
        window.alert("Transaction failed!");
      }

      // await openPunks.methods
      //   .mint(1)
      //   .send({ from: account, value: 55000000000000 })
      //   .on("confirmation", async () => {
      //     //const maxSupply = await openPunks.methods.maxSupply().call()
      //     //const totalSupply = await openPunks.methods.totalSupply().call()
      //     //setSupplyAvailable(maxSupply - totalSupply)
      //     //const ownerOf = await openPunks.methods.walletOfOwner(account).call()
      //     //setOwnerOf(ownerOf)
      //   });
      // .on('error', (error) => {
      //   window.alert(error)
      //   setIsError(true)
      //})
    }
    setIsMinting(false);
  };

  const cycleImages = async () => {
    const getRandomNumber = () => {
      const counter = Math.floor(Math.random() * 700) + 1;
      setCounter(counter);
      //console.log(counter);
    };

    if (!isCycling) {
      setInterval(getRandomNumber, 2000);
    }
    setIsCycling(true);
  };

  const contractHandler = async () => {
    console.log("Contract balance: ", contractBalance);
    console.log("Contract owner: ", contractOwner);
    console.log("Metamask account: ", account);
    if (contractBalance > 0 && account == contractOwner) {
      window.alert("Withdrawal initiated by deployer account");
      const result = await contractWithSigner.withdraw();
    }
  };

  async function getNfts(address) {
    // const rpc = "https://rpc-mumbai.maticvigil.com/";
    // const ethersProvider = new ethers.JsonRpcProvider(rpc);
    // //console.log(ethersProvider)
    // let abi = [
    //   "function symbol() public view returns (string memory)",
    //   "function tokenCount() public view returns (uint256)",
    //   "function uri(uint256 _tokenId) public view returns (string memory)",
    //   "function balanceOfBatch(address[] accounts, uint256[] ids) public view returns (uint256[])",
    // ];

    // let nftCollection = new ethers.Contract(
    //   "0x0A47811bc094a2644a81BB53D5f012899EC0bA80",
    //   abi,
    //   ethersProvider
    // );

    const nftCollection = contract;
    let numberOfNfts = Number(await nftCollection.maxSupply()); // Convert from BigInt to number
    //console.log(numberOfNfts);
    let collectionSymbol = await nftCollection.symbol();
    //console.log(collectionSymbol)
    let accounts = Array(numberOfNfts).fill(address); // Fill with address x times
    //console.log(accounts)
    let ids = Array.from({ length: numberOfNfts }, (_, i) => i + 1); // Number range 1 to number of NFTs
    //console.log(ids)
    //let copies = await nftCollection.balanceOfBatch(accounts, ids); // From base class, how many of each NFT
    // //console.log(copies);

    numberOfNfts = ownerOf.length;

    let tempArray = [];
    for (let i = 1; i <= numberOfNfts; i++) {
      //console.log(i);

      let tmp1 = await nftCollection.tokenURI(i);
      tmp1 = tmp1.replace("ipfs://", "https://ipfs.io/ipfs/");

      let metadata = (await axios.get(tmp1)).data;
      console.log(metadata);
      //let img = tmp1.replace("ipfs://", "https://ipfs.io/ipfs/");

      tempArray.push(metadata);
    }

    if (numberOfNfts > 0) {
      setNfts(tempArray);
    } else {
    }
    //console.log(nfts[0]);

    //let tempArray = [];
    //let baseUrl = "";

    // Get the NFT metadata on an array
    //for (let i = 1; i <= numberOfNfts; i++) {
    // if (i === 1) {
    //     // ipfs.com/svsdcscs/1.json
    //     let tokenURI = await nftCollection.uri(i);
    //     //console.log(tokenURI);
    //     baseUrl = tokenURI.replace(/\d+.json/, ""); // remove JSON, folder holding images
    //     //console.log(baseUrl)
    //     let metadata = await getMetadataFromIpfs(tokenURI);
    //     //console.log(metadata)
    //     metadata.symbol = collectionSymbol;
    //     metadata.copies = Number(copies[0]);
    //     //console.log(metadata.copies)
    //     tempArray.push(metadata);
    //     //console.log(tempArray)
    //} else {
    //     let metadata = await getMetadataFromIpfs(baseUrl + `${i}.json`);
    //     metadata.symbol = collectionSymbol;
    //     metadata.copies = Number(copies[i - 1]);
    //     tempArray.push(metadata);
    //}
    //}
    // // Array of NFT metadata
    // setNfts(tempArray);
    // // After this is run nft hold the NFT data for display in a grid below
  }

  // Set all cards to not popping out
  function toggleModal(i) {
    //console.log('modal toggle')
    if (i >= 0) {
      setSelectedNft(nfts[i]);
      //console.log(nfts[i])
    }
    setShowModal(!showModal);
  }

  useEffect(() => {
    loadWeb3();
    cycleImages();
    if (account) {
      //console.log("Account signed in!");
      getNfts(account);
    }
  }, [account, counter]);

  return (
    <div>
      <Navbar
        web3Handler={web3Handler}
        account={account}
        explorerURL={explorerURL}
      />
      <main>
        <section id="welcome" className="welcome">
          <Row className="header my-3 p-3 mb-0 pb-0">
            <Col xs={12} md={12} lg={8} xxl={8}>
              <h1>Brains Alive!</h1>
              <p className="sub-header">Availble on 11 / 03 / 22</p>
            </Col>
            <Col className="flex social-icons">
              <a
                href="https://twitter.com/DappUniversity"
                target="_blank"
                className="circle flex button"
              >
                <img src={twitter} alt="Twitter" />
              </a>

              <a
                href={`${openseaURL}/collection/${config.PROJECT_NAME}`}
                target="_blank"
                className="circle flex button"
              >
                <img src={opensea} alt="Opensea" />
              </a>
            </Col>
          </Row>

          <Row className="flex m-3">
            <Col md={5} lg={4} xl={5} xxl={4} className="text-center">
              <img
                src={`https://ipfs.io/ipfs/QmPgUjTBknMkK6pm3MJYAVzHu55okMSA6u9zxahTFJ1ZHg/${counter}.png`}
                alt="Brains Alive"
                className="showcase"
              />
            </Col>
            <Col md={5} lg={4} xl={5} xxl={4}>
              {revealTime !== 0 && (
                <Countdown
                  date={currentTime + (revealTime - currentTime)}
                  className="countdown"
                />
              )}
              <p className="text">
                The definitive neuroscience NFT collection.
              </p>
              <p className="text">Secure yours when the timer hits zero.</p>
              <a href="#about" className="button">
                Learn More!
              </a>
            </Col>
          </Row>
        </section>
        <section id="about" className="about">
          <Row className="flex m-3">
            <h2 className="text-center p-3">About the Collection</h2>
            <Col md={5} lg={4} xl={5} xxl={4} className="text-center">
              <img
                src={showcase}
                alt="Multiple Crypto Punks"
                className="showcase"
              />
            </Col>
            <Col md={5} lg={4} xl={5} xxl={4}>
              {isError ? (
                <p>{message}</p>
              ) : (
                <div>
                  <h3>NFT drop in:</h3>
                  {revealTime !== 0 && (
                    <Countdown
                      date={currentTime + (revealTime - currentTime)}
                      className="countdown"
                    />
                  )}
                  <ul>
                    <li>
                      1,000 punked out brain images celebrating the neuroscience
                      community
                    </li>
                    <li>Free minting on Polygon network</li>
                    <li>
                      <a
                        target="_blank"
                        href="https://faucet.polygon.technology/"
                      >
                        Add MATIC to your Metamask wallet here
                      </a>
                    </li>
                    <li>
                      Viewable on Opensea testnet shortly after minting (be
                      patient)
                    </li>
                    <li>View entire collection here</li>
                  </ul>

                  {isMinting ? (
                    <Spinner animation="border" className="p-3 m-2" />
                  ) : (
                    <button
                      onClick={mintNFTHandler}
                      className="button mint-button mt-3"
                    >
                      Mint
                    </button>
                  )}

                  {ownerOf.length > 0 && (
                    <p>
                      <small>
                        View your NFT on
                        <a
                          href={`${openseaURL}/assets/mumbai/${contractAddress}/${ownerOf[0]}`}
                          target="_blank"
                          style={{ display: "inline-block", marginLeft: "3px" }}
                        >
                          OpenSea
                        </a>
                      </small>
                    </p>
                  )}
                </div>
              )}
            </Col>
          </Row>

          <Row style={{ marginTop: "100px" }}>
            <Col>
              {contractAddress && (
                <a
                  href={`${explorerURL}/address/${contractAddress}`}
                  target="_blank"
                  className="text-center"
                  onClick={contractHandler}
                >
                  {contractAddress}
                </a>
              )}
            </Col>
          </Row>
        </section>
      </main>
      <footer></footer>

      {nfts && (
        <Container>
          <Title>Your Brains Alive Collection</Title>
          <Subtitle>The rarest and best of neuroscience collectibles</Subtitle>
          <br />
          <br /> 
          <br />
          <br />
          <Grid>
            {nfts.map((nft, i) => (
              <NFTCard nft={nft} key={i} toggleModal={() => toggleModal(i)} />
            ))}
          </Grid>
          <br />
          <br /> 
          <br />
          <br />
        </Container>
      )}

      {showModal && (
        <NFTModal nft={selectedNft} toggleModal={() => toggleModal()} />
      )}
    </div>
  );
}

const Title = styled.h1`
  margin: 0;
  text-align: center;
`;

const Subtitle = styled.h4`
  color: gray;
  margin-top: 0;
  text-align: center;
`;

const Container = styled.div`
  width: 70%;
  max-width: 1200px;
  margin: auto;
  margin-top: 100px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  row-gap: 100px;
`;

export default App;
