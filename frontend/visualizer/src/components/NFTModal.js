import styled from "styled-components";
import { NftPhoto } from "./NFTCard";

// This is for pop out
const NFTModal = (props) => {
  let nft = props.nft;
  let tmp1 = nft.image;
  let img = tmp1.replace("ipfs://", "https://ipfs.io/ipfs/");

  return (
    <Modal>
      <ModalContent>
        <ModalGrid>
          <NftPhoto
            style={{
              backgroundImage: `url(${nft && img})`,
              height: 400,
              width: 400,
            }}
          />
          <div>
            <SectionText>Attributes</SectionText>
            {nft.attributes &&
              nft.attributes.map((attribute, i) => (
                <div key={i}>
                  <div style={{ margin: "10px 0px 5px 0px" }}>
                    <AttributeText>{attribute.trait_type}</AttributeText>
                    <AttributeText styled={{ float: "right" }}>
                      {attribute.value}
                    </AttributeText>
                  </div>
                </div>
              ))}
          </div>
        </ModalGrid>
        <CloseButton onClick={() => props.toggleModal()}>&times;</CloseButton>
      </ModalContent>
    </Modal>
  );
};

const AttributeText = styled.h4`
  color: gray;
  margin: 0px;
  display: inline;
`;

const CloseButton = styled.button`
  position: absolute;
  right: 0;
  top: 0px;
  height: 40px;
  width: 40px;
  font-size: 26px;
  font-weight: bold;
  background-color: white;
  border: 1px;
  cursor: pointer;
`;

const ModalTitle = styled.h1`
  margin: 0px;
`;

const Paragraph = styled.p`
  margin: 0 0 15px 0;
`;

const SectionText = styled.h3`
  margin: 5px 0 5px 0;
`;

const ModalGrid = styled.div`
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 40px;
`;

const Modal = styled.div`
  position: fixed;
  display: flex;
  align-items: center;
  z-index: 100px;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  width: 900px;
  margin: auto;
  background-color: black;
  border-radius: 0px;
  padding: 50px;
`;

export { NFTModal };
