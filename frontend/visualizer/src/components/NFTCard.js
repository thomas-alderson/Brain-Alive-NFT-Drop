import styled from "styled-components";

const NFTCard = (props) => {
  let nft = props.nft;
  console.log(nft)
  let tmp1 = nft.image;
  let img = tmp1.replace("ipfs://", "https://ipfs.io/ipfs/");

  return (
    <NftCard onClick={() => props.toggleModal()}>
      <NftPhoto style={{ backgroundImage: `url(${img})` }} />
      <NftName>{nft && nft.name}</NftName>
    </NftCard>
  );
};

const NftCard = styled.div`
width: 200px;
height: 200px;
margin: auto;
border-radius: 10px
padding: 0px;
cursor: pointer;
box-shadow: 0px 0px 0px #d9d9d9,
            -10px -10px 8px #ffffff;
`;

const NftPhoto = styled.div`
  display: block;
  width: 200px;
  height: 200px;
  background-position: center center;
  background-size: cover;
  border-radius: 0px;
  margin: auto;
`;

const NftCollectionText = styled.div`
  font-size: 12px;
  color: gray;
`;

const NftName = styled.div`
  font-size: 16px;
  forn-weight: bold;
  display: inline;
`;

export { NFTCard, NftPhoto };
