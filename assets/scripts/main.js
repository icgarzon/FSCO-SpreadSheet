(function() {

    "use strict";

    const FSCO_Data = {
        total_grid:100,
        active:{ 
            cell:null 
        },
        cells:{}
    };

    function initApp(){
        setUIBase();
        drawGrid();
    }

    function cellModelObject(){
        return { style:{}, referenced:[] }
    }

    function columnId(num) {

        var ordA = 'A'.charCodeAt(0), //Position A
            ordZ = 'Z'.charCodeAt(0), //Position Z
            len = ordZ - ordA + 1,
            letter = '';

        while(num >= 0) {
            letter = String.fromCharCode(num % len + ordA) + letter;
            num = Math.floor(num / len) - 1;
        }

        return letter;
        
    }

    function setUIBase(){

        // Build Foat Button
        var html_options_buttons = document.createElement('div');
            html_options_buttons.className = 'container_options';
            html_options_buttons.innerHTML = `  <div class="refreshButtonBox">
                                                    <button class="softAnimate" id="refreshButton"></button>
                                                </div>
                                            `;
        
        document.body.appendChild(html_options_buttons);

        // Build Header

        var html_header = document.createElement('header');
            html_header.className = 'header-menu';
            html_header.innerHTML = `<div class="logo"></div>
                                    <nav>
                                        <ul>
                                            <li rel="bold" class="bold softAnimate"></li>
                                            <li rel="italic" class="italic softAnimate"></li>
                                            <li rel="underline" class="underline softAnimate"></li>
                                        </ul>
                                    </nav>`;
        
        document.body.appendChild(html_header);

        // Build Loader Spinner

        var html_loader = document.createElement('div');
        html_loader.className = 'fsco-loader softAnimate';

        document.body.appendChild(html_loader);

        // Add Events

        document.getElementById(`refreshButton`).addEventListener('click', event => {
            drawGridClear();
            document.getElementsByTagName(`body`)[0].classList.remove('ready');
            setTimeout(()=>{ // Just for see the action of reload, because it's too fast to see it
                drawGrid();
            }, 500);
        });

    }

    function drawGridClear(){
        if(document.getElementById(`container`)){ document.getElementById(`container`).remove(); }
    }

    function drawGrid(){

        drawGridClear();

        var html_box = ``,
            html_box_div = document.createElement('div'),
            col_labels = ``,
            row_labels = ``;

        html_box_div.id = 'container';
        html_box_div.className = 'container';

        for (let coli = 0; coli < fsco.total_grid; coli++) {

            var colId = columnId( coli );

            html_box += `<div class="row">`;

            for (let celli = 0; celli < fsco.total_grid; celli++) {
                
                var cellNumber = celli+1, cellId = colId+cellNumber, moreClass=``,
                    textLabel = ``;

                if(fsco?.cells[ cellId ]?.style){
                    for(let [style, value] of Object.entries(fsco?.cells[ cellId ]?.style)){
                        if(value) moreClass += ` ${style}`;
                    }
                }

                if(fsco?.cells[ cellId ]?.formula){
                    textLabel = solveFormula( cellId );
                }else if( fsco?.cells[ cellId ]?.val ){
                    textLabel = fsco?.cells[ cellId ].val;
                }
                
                html_box += `   <div class="cell ${moreClass}" rel="${ cellId }" id="cell-${ cellId }">
                                    <div class="label">${ textLabel }</div>
                                </div>`; // Build Every Cell

                if(coli===0){ row_labels += `<div class="row_label">${ cellNumber }</div>` } // Build Only Labels Rows

            }

            html_box += `</div>`;
            col_labels += `<div class="col_label">${ colId }</div>`;

        }

        html_box_div.innerHTML = `  <div class="row_labels">${row_labels}</div>
                                    <div class="row_labels_space"></div>
                                    <div class="grid">
                                        <div class="col_labels">${col_labels}</div>
                                        ${html_box}
                                    </div>
                                `;

        document.body.appendChild(html_box_div);

        activateEvents();

    }

    function activateEvents(){

        // Cells Events
        const cells = document.querySelectorAll('.container .grid .row .cell');

        cells.forEach(el => el.addEventListener('click', event => {

            var cellId = event.target.getAttribute('rel');

            [].forEach.call(cells, function(cell) {
                cell.classList.remove('active-on');
            });

            if(cellId){
                el.classList.add('active-on');
                el.focus();
                fsco.active.cell = cellId;
            }

        }));

        cells.forEach(el => el.addEventListener('dblclick', event => {

            var cellId = event.target.getAttribute('rel');

            if(cellId){

                el.classList.add('edit-on');

                var new_input = document.createElement('input');
                    new_input.type = 'text'; 
                    new_input.id = `input-${ cellId }`; 
                    new_input.value = fsco?.cells[ cellId ]?.formula ? fsco?.cells[ cellId ]?.formula : ( fsco?.cells[ cellId ]?.val ? fsco?.cells[ cellId ]?.val : '' );

                    new_input.addEventListener('blur', event => {
                        el.classList.remove('edit-on');
                        el.classList.remove('active-on');
                        inputBlur(cellId);
                    });

                    new_input.addEventListener('keydown', event => {
                        if(event.keyCode === 13){
                            document.getElementById(`input-${ cellId }`).blur();
                        }
                    });

                document.getElementById(`cell-${ cellId }`).appendChild(new_input);
                document.getElementById(`input-${ cellId }`).focus();
                fsco.active.cell = cellId;
                cellReferencedClear(cellId);

            }

        }));


        // Buttons Styling Events
        const cell_styles = document.querySelectorAll('.header-menu nav > ul > li');

        cell_styles.forEach(el => el.addEventListener('click', event => {

            var buttonType = event.target.getAttribute('rel'),
                id = fsco.active.cell;

            if(!buttonType){ return false; }
            if(!fsco.cells[ id ]){ fsco.cells[ id ] = cellModelObject(); }

            if(fsco.cells[ id ].style[ buttonType ]){
                document.getElementById(`cell-${ id }`).classList.remove(buttonType);
            }else{
                document.getElementById(`cell-${ id }`).classList.add(buttonType);
            }

            fsco.cells[ id ].style[ buttonType ] = fsco.cells[ id ].style[ buttonType ] ? false : true;

        }));
            
        // All ready for work
        document.getElementsByTagName(`body`)[0].classList.add('ready');


    }

    function inputBlur(id){

        if(!id) return false;
        var val = document.getElementById(`input-${ id }`).value.trim();
        if(!fsco.cells[ id ]){ fsco.cells[ id ] = cellModelObject(); }

        // Save data in object 
        if(!val){
            fsco.cells[ id ].formula = null;
            fsco.cells[ id ].val = null;
        }else if(isFormula(val)){
            fsco.cells[ id ].formula = val;
            fsco.cells[ id ].val = null;
        }else{
            fsco.cells[ id ].val = /^\d+$/.test(val) ? parseInt(val) : val;
            fsco.cells[ id ].formula = null;
        }

        document.getElementById(`input-${ id }`).remove();
        fsco.active.cell = null;
        cellLabel(id);

        if(fsco?.cells[ id ]?.referenced){
            //drawGrid();
            for(let referencedCell of fsco?.cells[ id ]?.referenced){
                if(referencedCell){
                    setTimeout(()=>{
                        cellLabel(referencedCell);
                    }, 50);
                }
            }
        }

    }

    function cellLabel(id){
        if(!id) return false;
        var text = ``;
        if(fsco?.cells[ id ]?.formula){ text = solveFormula(id); }
        else{ text=fsco?.cells[ id ]?.val; }
        document.getElementById(`cell-${ id }`).getElementsByClassName(`label`)[0].innerHTML = text;
        return true;
    }

    function isFormula(val){
        var regexp = /(^=).*/;
        return regexp.test(val);
    }
    
    function cellReferencedClear(id){

        if(!id){ return false; }
        if(!fsco.cells[id]){ fsco.cells[id] = cellModelObject(); }

        var formula = fsco?.cells[ id ]?.formula;

        if(formula){

            var formulaGroups = formulaGroupsGet(formula); 

            if(formulaGroups){
                for(let ValorCell of formulaGroups){
                    if(/([A-Z])/g.test(ValorCell) && fsco?.cells[ ValorCell ]?.referenced){
                        var index = fsco?.cells[ ValorCell ]?.referenced.indexOf(id);
                        if (index !== -1) {
                            fsco?.cells[ ValorCell ]?.referenced.splice(index, 1);
                        }
                    }
                }
            }

        }

    }

    function cellReferencedAdd(id, reference){
        if(!fsco.cells[id]){ fsco.cells[id] = cellModelObject(); }
        fsco.cells[id].referenced.push( reference );
    }

    function formulaGroupsGet(formula){

        if(!formula){ return false; }
        
        var formulaString = /(?:^=)(.*)/g.exec( formula.replace(/\s/g, '') ),
            formulaGroups = [];

        if(/(SUM\(|sum\()(.*)([:])(.*)(\))/g.test(formulaString)){
            
            let formulaText = formulaString[1] ? formulaString[1] : '',
                partsBlock = /(?:SUM\(|sum\()(.*)(?:[:])(.*)(?:\))/g.exec(formulaText).filter((val,index)=>{ if(index > 0){ return val; } });
            
            if(partsBlock){
                let letterCol = /[A-Z]/g.exec( partsBlock[0] ),
                    nStart = parseInt( /\d/g.exec( partsBlock[0] ) ),
                    nEnd = parseInt( /\d/g.exec( partsBlock[1] ) );
                    
                for(let cellIndex of partsBlock){
                    let cellLetter = /[A-Z]/g.exec( cellIndex );
                    if( cellLetter && cellLetter[0] !== letterCol[0]){ return false; }
                }

                for (let i=nStart; i<=nEnd; i++) {
                    formulaGroups.push( letterCol[0]+i );
                    if(i != nEnd){ formulaGroups.push('+'); }
                }

            }

        }else{
            
            formulaGroups = formulaString[1] ? formulaString[1].match(/([a-zA-Z0-9]+)|([+-\/*]+)/g) : ``;

        }

        return formulaGroups;
        
    }


    function solveFormula(id){

        var operator = null,
            formula = fsco?.cells[ id ]?.formula,
            totalNumber = 0,
            textReturn = `#NA`,
            prevValue,
            formulaGroups = formulaGroupsGet(formula);

        if(formulaGroups && formulaGroups.length > 0){

            for(let ValorCell of formulaGroups){

                var getRealValue = ValorCell;

                if(/([A-Z])/g.test(ValorCell)){

                    if(fsco?.cells[ ValorCell ]?.formula){
                        getRealValue = solveFormula( ValorCell );
                    }else if(fsco?.cells[ ValorCell ]?.val){
                        getRealValue = fsco?.cells[ ValorCell ]?.val;
                    }

                    cellReferencedAdd(ValorCell, id);

                }
                
                if(operator){

                    if(isNaN(getRealValue) || ( prevValue && isNaN(prevValue))){ 
                        textReturn = `#NA`; 
                        break; 
                    } // Just break because not all are numbers

                    if(operator == '+'){
                        totalNumber = parseInt( totalNumber ) + parseInt ( getRealValue );
                    }else if(operator == '-'){
                        totalNumber = parseInt( totalNumber ) - parseInt ( getRealValue );
                    }else if(operator == '*'){
                        totalNumber = parseInt( totalNumber ) * parseInt ( getRealValue );
                    }else if(operator == '/'){
                        totalNumber = parseInt( totalNumber ) / parseInt ( getRealValue );
                    }

                    operator = null;
                    
                }
                
                if(!isNaN(totalNumber) && totalNumber !== 0){ textReturn = totalNumber; } // If calculate returns a number set the value for return
                else if(totalNumber === 0 && !isNaN(getRealValue)){ textReturn = getRealValue; }
                else if(isNaN(getRealValue) && !/([+-\/*])/g.test(getRealValue)){ textReturn = getRealValue; }
                
                if(/([+-\/*])/g.test(ValorCell)){ // If it is a operator just set the var for next iteration
                    operator = ValorCell; 
                }else{ // If it is not a operator set to null and if is the first value of total just set that first value
                    prevValue = getRealValue; totalNumber = totalNumber === 0 ? getRealValue : totalNumber; operator = null; 
                }

            }



        }
        
        return textReturn;

    }


    const fsco = FSCO_Data;

    window.onload = () => {
        initApp();
    }

})(window);