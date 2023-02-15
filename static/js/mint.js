//Moralis server
const serverUrl = "https://test-mor-server.onrender.com/server";
const appId = "001";

const contractAddress = "0x5220Ec5E14bfE5C77fA515b56E165C6C716F4be0";

//web3
async function handleAuth(provider) {

    await Moralis.enableWeb3({
        throwOnError: true,
        provider,
    });
    
    const { account, chainId } = Moralis;

    if (!account) {
        throw new Error("Connecting to chain failed, as no connected account was found");
    }
    if (!chainId) {
        throw new Error("Connecting to chain failed, as no connected chain was found");
    }

    const { message } = await Moralis.Cloud.run("requestMessage", {
        address: account,
        chain: parseInt(chainId, 16),
        network: "Goerli",
    });

    await Moralis.authenticate({
        signingMessage: message,
        throwOnError: true,
    }).then(() => {

    });
}


async function assignPlot() {
    const plotID = document.getElementById("plotID").value;
    const assigned = await isPlotAssigned(plotID);
    if (!assigned) {
        const metadata = {
            "PlotID":plotID,
            "PlotX":document.getElementById("plotX").value,
            "PlotY":document.getElementById("plotY").value,
            "LocationX":document.getElementById("locationX").value,
            "LocationY":document.getElementById("locationX").value,
            "image":"https://moralis.io/wp-content/uploads/2021/06/Moralis-Glass-Favicon.svg",
        }
        const metadataFile = new Moralis.File("metadata.json", {base64 : btoa(JSON.stringify(metadata))});
        try {
            
            const upload = {
                abi: [
                  {
                    path: "https://moralis.io/wp-content/uploads/2021/06/Moralis-Glass-Favicon.svg",
                    content: metadataFile,
                  },
                ],
            };
            const path = await Moralis.Web3API.storage.uploadFolder(upload);
            await mint(path[0].path);
            

        } catch (e) {
            console.error(e);
        }
        
    }
    else{
        displayMessage("01","Plot is already assigned");
    }
}

async function isPlotAssigned(plotID) {
    const contractOptions = {
        contractAddress: contractAddress,
        abi: contractABI,
        functionName: "exist",
        params: {
            bytesId:plotID
        }
    }
    return await Moralis.executeFunction(contractOptions);
}

async function mint(_tokenURI) {
    const contractOptions = {
        contractAddress: contractAddress,
        abi: contractABI,
        functionName: "assign",
        params: {
            tokenURI:_tokenURI,
            bytesId:document.getElementById("plotID").value
        }
    }
    try{
        const transaction = await Moralis.executeFunction(contractOptions);
        await transaction.wait();
        displayMessage("00","Transaction confirmed with hash "+transaction.hash);
    }
    catch(error){
        displayMessage("01","Transaction reverted see console for details");
        console.log(error)
    }
}    

Moralis.start({ serverUrl, appId }); 
handleAuth('metamask');