import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import InputForm from './components/InputForm';
import GetNFTs from './components/IdFinder'
import { ethers } from 'ethers'
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";




const App: React.FC = () => {
  const inputText = '0x...<SomeNftAddress>'
//  const deadAddress = '0x000000000000000000000000000000000000dEaD'

  const [userAddress, setUserAddress] = useState<string>('')
  const [someMsg, setSomeMsg] = useState<string>('')
  const [inputContract, setInputState] = useState("")
  const [loaded, setLoaded] = React.useState<boolean>(false)
  const [valid, setValid] = useState<boolean>(false)
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>()
  const [library, setLibrary] = useState<ethers.providers.Web3Provider>();
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [network, setNetwork] = useState<ethers.providers.Network>();
  const [account, setAccount] = useState<string>();

  const handleOnSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    getProvider()
    if (!ethers.utils.isAddress(inputContract) ) { setValid(false); setSomeMsg('Need Valid Address') } 
    else { setValid(true); setSomeMsg('') }
    setSomeMsg('') //hides message block
    setLoaded(false) //resets loaded before new fetch
    console.log(inputContract);
    
  };

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
      if (provider?.on) {
        const handleAccountsChanged = (accounts: React.SetStateAction<string | undefined>) => {
          setAccount(accounts);
        };
    
        const handleChainChanged = (network: React.SetStateAction<ethers.providers.Network | undefined>) => {
          setNetwork(network);
        };
    
        const handleDisconnect = () => {
          disconnect();
        };
    
        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);
        provider.on("disconnect", handleDisconnect);
    
        return () => {
          if (provider.removeListener) {
            provider.removeListener("accountsChanged", handleAccountsChanged);
            provider.removeListener("chainChanged", handleChainChanged);
            provider.removeListener("disconnect", handleDisconnect);
          }
        };
      }

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [provider]);
  
  const refreshState = () => {
    setUserAddress('')
    setAccount(undefined);
    setNetwork(undefined);
  };

  const disconnect = async () => {
    if(web3Modal){ web3Modal.clearCachedProvider() }
    refreshState();
  };

  const getProvider = async () => {
    if(!web3Modal){return}
    try {
      const instance = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(instance);
      const signer = web3Provider.getSigner();
      setProvider(instance);
      setLibrary(web3Provider);
      setUserAddress(await signer.getAddress())
      if(!library){return}
      const network = await library.getNetwork();
      const accounts = await library.listAccounts();
      if (accounts) setAccount(accounts[0]);
      setNetwork(network)
    } catch (error) {
      console.error(error);
    }
  }

  return (
  <div className="App">
    <header className="App-header">
      <>
        <h1>Zem's NFT Scraper</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <h6>
          <button onClick={disconnect}>Disconnect</button>
          <div>Chain Name: {network?.name} <br></br>Chain ID: {network?.chainId}</div>
          <br></br>
          <div>Wallet Address: <br></br> {account}</div>
        </h6>
        <div hidden={!someMsg}>{someMsg}</div>
        <InputForm
          setValid = {setValid}
          setSomeMsg={setSomeMsg}
          setUserAddress = {setUserAddress}
          contractAddress={inputContract}
          setContractAddress={setInputState}
          handleOnSubmit={handleOnSubmit}
          placeholder={inputText}
        />
        <h5 hidden={!valid}>
          <GetNFTs 
            userAddress={userAddress}
            contractAddress={inputContract}
            loaded={loaded}
            setLoaded={setLoaded}
            valid={valid}
          />
        </h5>
      </>
    </header>

  </div>
  );
}

export default App;
