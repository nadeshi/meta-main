// initial element
const tiles = 12; 
const plots = tiles * 9;
const roads = tiles * 2;
const initialOffsets = plots +roads;
const plotViewOffsets = plots + (2 * roads);

//web3 constants
const ethers = Moralis.web3Library;

// canvas and context
const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext('2d');
const plotCanvas = document.getElementById("plotCanvas");
const plotCtx = plotCanvas.getContext('2d');
const worldImage = new Image();

// canvas State
const mapView = {mapOffsetX:-1*initialOffsets,mapOffsetY:-1*initialOffsets};
const plotView = {plotX:0, plotY:0, locationX:0,locationY:0};

// drawing the canvas
function drawCanvas(){
    mainCanvas.width = 5 * plots + 4 * roads;
    mainCanvas.height = 4 * plots + 4 * roads;
    plotCanvas.width = plots
    plotCanvas.height = plots
    worldImage.src = 'static/img/map.png';
    worldImage.onload = () => {
        initializeMap()
    }
}

function initializeMap() {
    updatePlotLocation()
    setPlotData();
    drawMapSection(mainCtx,mapView.mapOffsetX,mapView.mapOffsetY);
    drawCursor(plotViewOffsets,plotViewOffsets);
    drawMapSection(plotCtx,(-1 * plotView.locationX),(-1 *plotView.locationY));
}

function drawMapSection(ctx,x,y){
    ctx.drawImage(worldImage,x,y);
}

function drawCursor(x,y) {
    mainCtx.strokeRect(x,y,plots,plots)
}

function updatePlotLocation() {
    plotView.locationX = -1 * mapView.mapOffsetX + plotViewOffsets;
    plotView.locationY = -1 * mapView.mapOffsetY + plotViewOffsets;
}

// move to other plots
function move(direction) {
    const validMove = validateMove(direction);
    if (validMove) {
        updateView(direction);
        updatePlotLocation();
        drawMapSection(mainCtx,mapView.mapOffsetX,mapView.mapOffsetY);
        drawCursor(plotViewOffsets,plotViewOffsets);
        drawMapSection(plotCtx,-1 * plotView.locationX,-1 *plotView.locationY);
        setPlotData();
    }
}

function validateMove(direction) {
    switch(direction){
        case 'ArrowRight': return !(plotView.plotX == 15);
        case 'ArrowUp': return   !(plotView.plotY == 0);
        case 'ArrowLeft': return !(plotView.plotX == 0);
        case 'ArrowDown': return !(plotView.plotY == 15);
    }
}

function updateView(direction) {
    switch(direction){
        case 'ArrowRight': 
            plotView.plotX += 1;
            mapView.mapOffsetX -= plots + roads;
            break
        case 'ArrowDown': 
            plotView.plotY += 1;
            mapView.mapOffsetY -= plots + roads;
            break
        case 'ArrowLeft': 
            plotView.plotX -= 1;
            mapView.mapOffsetX += plots + roads;
            break
        case 'ArrowUp': 
            plotView.plotY -= 1;
            mapView.mapOffsetY += plots + roads;
            break
    }
}

function setPlotData() {
    const plotID = ethers.utils.id(JSON.stringify(plotView));
    document.getElementById("plotX").value = plotView.plotX
    document.getElementById("plotY").value = plotView.plotY
    document.getElementById("locationX").value = plotView.locationX
    document.getElementById("locationY").value = plotView.locationY
    document.getElementById("plotID").value = plotID;

}

function displayMessage(messageType, message){
    const messages = {
                "00":`<div class= "alert alert-success"> ${message} </div>`,
                "01":`<div class= "alert alert-danger"> ${message} </div>`
            }
    document.getElementById("notifications").innerHTML = messages[messageType];
}

drawCanvas();
window.addEventListener('keydown' , (e) => {
    move(e.key)
});