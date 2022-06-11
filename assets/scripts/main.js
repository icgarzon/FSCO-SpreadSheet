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
                
                var cellNumber = celli+1, cellId = colId+cellNumber, moreClass=``;

                if(fsco?.cells[ cellId ]?.style){
                    /*fsco?.cells[ cellId ]?.style.forEach((el)=>{
                        console.log(el);
                    });*/
                    for(let [style, value] of Object.entries(fsco?.cells[ cellId ]?.style)){
                        if(value) moreClass += ` ${style}`;
                    }
                }
                
                html_box += `   <div class="cell ${moreClass}" rel="${ cellId }" id="cell-${ cellId }">
                                    <div class="label">${ fsco?.cells[ cellId ]?.val ? fsco?.cells[ cellId ].val : '' }</div>
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
                    new_input.value = fsco?.cells[ cellId ]?.val ? fsco?.cells[ cellId ]?.val : '';
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

            }

        }));


        // Buttons Styling Events
        const cell_styles = document.querySelectorAll('.header-menu nav > ul > li');

        cell_styles.forEach(el => el.addEventListener('click', event => {

            var butonType = event.target.getAttribute('rel'),
                id = fsco.active.cell;

            if(!butonType){ return false; }
            if(!fsco.cells[ id ]){ fsco.cells[ id ] = { style:{} }; }
            fsco.cells[ id ].style[ butonType ] = fsco.cells[ id ].style[ butonType ] ? false : true;

            if(fsco.cells[ id ][ butonType ]){
                document.getElementById(`cell-${ id }`).classList.remove(butonType);
            }else{
                document.getElementById(`cell-${ id }`).classList.add(butonType);
            }

        }));
            
        // All ready for work
        document.getElementsByTagName(`body`)[0].classList.add('ready');


    }

    function inputBlur(id){
        if(!id) return false;
        var val = document.getElementById(`input-${ id }`).value;
        if(!fsco.cells[ id ]){ fsco.cells[ id ] = { style:{} }; }
        fsco.cells[ id ].val = val;
        document.getElementById(`input-${ id }`).remove();
        fsco.active.cell = null;
        cellLabel(id);
    }

    function cellLabel(id){
        if(!id || !fsco?.cells[ id ]?.val) return false;
        document.getElementById(`cell-${ id }`).getElementsByClassName(`label`)[0].innerHTML = fsco?.cells[ id ]?.val;
    }

    const fsco = FSCO_Data;

    window.onload = () => {
        initApp();
    }

})(window);