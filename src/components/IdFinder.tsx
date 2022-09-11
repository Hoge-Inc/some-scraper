import React, { useState } from 'react';

type Props = {
    contractAddress: string;
    holderAddress: string;
    loaded: boolean;
    setLoaded: (val: boolean) => void;
    valid: boolean;
    tokenIds: Map<number, []> | undefined;
    setTokenIds: (val: Map<number, []>  | undefined ) => void;
    setImages: (val: Map<number, string> | undefined) => void;
}

export const GetNFTs: React.FC<Props> = ({
    contractAddress,
    holderAddress,
    loaded,
    setLoaded,
    valid,
    tokenIds,
    setTokenIds,
    setImages

}) => {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    
    React.useEffect(() => {
        if (!isLoading && !tokenIds) {
            const API_KEY = process.env.REACT_APP_MORALIS_API_KEY
            if (!API_KEY) { alert('moralis api key not set in env') } else {
                const options = {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        'X-API-Key': API_KEY
                    }
                }
                if (!holderAddress || !valid || loaded) {} else {
                    setIsLoading(true)
                    setTokenIds(new Map<number, []>())
                    const fetchUrl = 'https://deep-index.moralis.io/api/v2/' + 
                    holderAddress + '/nft/' + contractAddress + '?chain=eth&format=decimal'
                    fetch(fetchUrl, options)
                    .then(response => response.json())
                    .then(response => { 
                        let idMap = new Map<number, []>()
                        let imageMap = new Map<number, string>()
                        const r = response.result
                        if (!r || r.length === 0) {} 
                        else {
                            r.forEach((someValue: any) => {
                                if (someValue.token_id !== undefined){
                                    idMap.set(someValue.token_id, JSON.parse(someValue.metadata).attributes)
                                    imageMap.set(someValue.token_id, JSON.parse(someValue.metadata).image)
                                }
                            })
                        }
                        setTokenIds(idMap)
                        setImages(imageMap)
                        setLoaded(true)
                    })
                    .catch(err => console.error(err))
                    .finally(() => setIsLoading(false) );
                }      
            }
        }
    },[contractAddress, isLoading, loaded, setImages, setLoaded, setTokenIds, tokenIds, holderAddress, valid])
    return <></>
}

export default GetNFTs
