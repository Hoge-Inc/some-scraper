import React, { useState } from 'react';
import { GiAbdominalArmor, GiSamusHelmet } from 'react-icons/gi'
import { Col, Row, } from "reactstrap";
import './Kards.css'

type Props = {
    loaded: boolean;
    holderAddress: string;
    contractAddress: string;
    tokenIds: Map<number, []> | undefined;
    images: Map<number, string> | undefined;
    cardRendered: boolean;
    setCardRendered: (val: boolean) => void;
}

export const Kards: React.FC<Props> = ({
    loaded,
    holderAddress,
    contractAddress,
    tokenIds,
    images,

}) => {
    
    const rendered: React.ReactElement[]= [];
    if (!holderAddress || !loaded) {} else {

        if (tokenIds === undefined ){return <>None Found</>}
        
        let itemKey = Math.random()
        for(let [key, value] of tokenIds) {
            const openseaLink = "https://opensea.io/assets/ethereum/" + contractAddress + "/" + key
            let traits: any[] = []
            let jsonItemList = []
            let aType
            let hType
            for(let item of value) {
                const jsonItem = JSON.parse(JSON.stringify(item))
                if (jsonItem.trait_type !== undefined && jsonItem.value !== 'None' && jsonItem.value !== 0) { 
                    traits.push(React.createElement("div", {key: itemKey++}, jsonItem.trait_type, ' : ', jsonItem.value))
                    jsonItemList.push(jsonItem) 
                    if (jsonItem.trait_type === 'ARMOUR' && !aType){ aType =jsonItem.value } 
                    if (jsonItem.trait_type === 'HELMET' && !hType){ hType = jsonItem.value } 
                }
            
            }
            console.log(key, jsonItemList)
            let keyImage = images?.get(key)
            if (keyImage?.substring(0,7) === 'ipfs://') { 
                keyImage = 'https://ipfs.io/ipfs/' + keyImage?.slice(7, keyImage.length)
            }
            const component = React.createElement("div", {key: key},
                <Col><div className='Card container'>
                    <div className='icons'>
                        <GiSamusHelmet /> {hType}
                        <br/>
                        <GiAbdominalArmor/> {aType}  
                    </div>
                    <div className='CardImageFrame'>
                        <img className='CardImage img-fluid'src={keyImage} alt={keyImage} />
                    </div>
                    <div className='CardBody'>
                        <div className='CardTitle'>
                            #{key}
                        </div>
                        <div className='CardSubtitle'>
                            {traits}
                        </div>
                        
                        <button className='inspect' onClick={(e: { preventDefault: () => void; }) => 
                            { e.preventDefault(); window.location.href=openseaLink; }}>
                            Inspect</button>
                    </div>
                    <p/>
                    <div className='CardText'>
                            0x63d85ec7b1561818ec03e158ec125a4113038a00
                    </div>
                </div></Col>
            )
            rendered.push(component);
        }

    } 
    return <Row xl="5" lg="4"sm="3" xs="2">{rendered}</Row>
}

export default Kards
