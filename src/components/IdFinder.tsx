import React from 'react';
import {
    Card,
    CardBody,
    CardSubtitle,
    CardText,
    CardTitle,
    Col,
    Row,
  } from "reactstrap";

type Props = {
    contractAddress: string;
    userAddress: string;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
    loaded: boolean;
    setLoaded: (val: boolean) => void;
    valid: boolean;
    tokenIds: Map<number, []> | undefined;
    setTokenIds: (val: Map<number, []>  | undefined ) => void;
}

export const GetNFTs: React.FC<Props> = ({
    contractAddress,
    userAddress,
    isLoading,
    setIsLoading,
    loaded,
    setLoaded,
    valid,
    tokenIds,
    setTokenIds
}) => {
    
    const [images, setImages] = React.useState<Map<number, string>>()

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
                if (!userAddress || !valid || loaded) {} else {
                    setIsLoading(true)
                    setTokenIds(new Map<number, []>())
                    const fetchUrl = 'https://deep-index.moralis.io/api/v2/' + 
                    userAddress + '/nft/' + contractAddress + '?chain=eth&format=decimal'
                    fetch(fetchUrl, options)
                    .then(response => response.json())
                    .then(response => { 
                        let idMap = new Map<number, []>()
                        let imageMap = new Map<number, string>()
                        const r = response.result
                        console.log(r)
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
    },[contractAddress, isLoading, loaded, setImages, setIsLoading, setLoaded, setTokenIds, tokenIds, userAddress, valid])
    
    if (tokenIds === undefined){return <>None Found</>}
    const rendered: React.ReactElement[]= [];
    let itemKey = 0
    for(let [key, value] of tokenIds) {
        let traits: any[] = []
        let jsonItemList = []
        try {    
            for(let item of value) {
                const jsonItem = JSON.parse(JSON.stringify(item))
                if (jsonItem.trait_type !== undefined) { 
                    traits.push(React.createElement("div", {key: itemKey++}, jsonItem.trait_type, ' : ', jsonItem.value))
                    jsonItemList.push(jsonItem) 
                }
            }
        } catch (e) {
            if (e instanceof TypeError || e instanceof RangeError || e instanceof EvalError) { 
                console.group("%cError", "color: red")
                console.log(e.name, '\n', e.message) 
            } else { console.error(e) }  
        }
        console.log(key, jsonItemList)
        let keyImage = images?.get(key)
        if (keyImage?.substring(0,7) === 'ipfs://') { 
            keyImage = 'https://ipfs.io/ipfs/' + keyImage?.slice(7, keyImage.length)
        }
        //let someImage = <></>
        //if (!images) { } else { someImage = React.createElement("img", { src: keyImage, width: "100%" }, null) }
        //const component = React.createElement("div", {key: key}, <h2>#{key}</h2>, traits,  <p><br></br></p>)
        const openseaLink = "https://opensea.io/assets/ethereum/" + contractAddress + "/" + key
        const component = React.createElement("div", {key: key},
        <Col>
            <Card 
                body 
                color="dark" 
                className="p-2 mb-3 rounded bg-light border"
            >
            <img
                id={'someImage'}
                alt={keyImage}
                src={keyImage}   
            />
            <CardBody>
                <CardTitle tag="h5" style={{color: 'goldenrod'}}>
                #{key}
                </CardTitle>
                <CardSubtitle
                className="mb-2 text-muted"
                tag="h6"
                >
                    {traits}
                </CardSubtitle>
                <CardText>
                    <a href={openseaLink} target="_blank" rel="noreferrer" className="stretched-link">
                        Opensea.io </a>
                </CardText>
            </CardBody>
            </Card>
        </Col>
        )
        rendered.push(component);
    }

    return <>
        <Row
          xl="4"
          lg="3"
          sm="2"
          xs="1"
        >
            {rendered}
        </Row>
    </>
}

export default GetNFTs
