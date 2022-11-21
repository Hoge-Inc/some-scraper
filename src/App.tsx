import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import InputForm from './components/InputForm';
import GetNFTs from './components/IdFinder'
import { ethers } from 'ethers'
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Container, FormGroup, Input, InputGroup, InputGroupText, Label } from 'reactstrap';

const App: React.FC = () => {
  const inputPlaceholder = '0x...<SomeNftAddress>'
  const [userAddress, setUserAddress] = useState<string>('')
  const [someMsg, setSomeMsg] = useState<string>('')
  const [contractAddress, setContractAddress] = useState("")
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [loaded, setLoaded] = React.useState<boolean>(false)
  const [valid, setValid] = useState<boolean>(false)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [network, setNetwork] = useState<ethers.providers.Network>();
  const [tokenIds, setTokenIds] = React.useState<Map<number, []>>()
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
      const API_KEY = process.env.REACT_APP_INFRA_API_KEY
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider, 
          options: {
            infuraId: API_KEY 
          }
        }
      };
      const newWeb3Modal = new Web3Modal({
        network: "mainnet", 
        cacheProvider: true,
        providerOptions 
      });
      setWeb3Modal(newWeb3Modal)

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [provider]);
  
  const refreshState = () => {
    setUserAddress('')
    setProvider(undefined)
    setNetwork(undefined);
    setTokenIds(undefined)
  };

  const disconnect = async () => {
    if(!web3Modal){} else { web3Modal.clearCachedProvider() }
    refreshState();
  };

  const getProvider = async () => {
    if(!web3Modal){return}
    try {
      const instance = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(instance);
      const signer = web3Provider.getSigner();
      const network = await web3Provider.getNetwork();
      setProvider(web3Provider);
      setUserAddress(await signer.getAddress())
      setNetwork(network)
    } catch (error) {
      console.error(error);
    }
  }

  const handleOnSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setTokenIds(undefined)
    getProvider()
    if (!ethers.utils.isAddress(contractAddress) ) { setValid(false); setSomeMsg('Need Valid Address') } 
    else { setValid(true); setSomeMsg('') }
    setSomeMsg('') //hides message block
    setLoaded(false) //resets loaded before new fetch
    console.log(contractAddress);
  };

  const inputOptions = {
    setValid: setValid,
    setSomeMsg: setSomeMsg,
    contractAddress: contractAddress,
    setContractAddress: setContractAddress,
    handleOnSubmit: handleOnSubmit,
    placeholder: inputPlaceholder,
  }

  const nftOptions = {
    userAddress: userAddress,
    contractAddress: contractAddress,
    isLoading: isLoading,
    setIsLoading: setIsLoading,
    loaded: loaded,
    setLoaded: setLoaded,
    valid: valid,
    tokenIds: tokenIds,
    setTokenIds: setTokenIds,
  }

  return (
  <div className="App">
    <header className="App-header">
      <h1>Zem's NFT Scraper</h1>
      <img src={logo} className="App-logo" alt="logo" />
      <h6 className="text-muted"><small>This versoin is only working with ETH network currenting</small></h6>
      <h6>
        <button hidden={!network} onClick={disconnect}>Disconnect</button>
        <div>
          Chain Status: 
          <small> {network?.name}</small> 
          <br></br>
          Chain ID: 
          <small> {network?.chainId}</small>
        </div>
        <div>
          Wallet Address: 
          <br></br>
          <small>{userAddress}</small>
        </div>
      </h6>
      <div hidden={!someMsg}>{someMsg}</div>
    </header>
    <br/>
    <InputForm {...inputOptions} />
    <Container fluid>
      <h5 hidden={!valid}>
        <GetNFTs {...nftOptions} />
      </h5>
    </Container>
  </div>
  );
}

export default App;
