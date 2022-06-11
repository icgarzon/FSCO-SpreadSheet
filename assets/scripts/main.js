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

        var html_options_buttons = document.createElement('div');
            html_options_buttons.className = 'container_options';
            html_options_buttons.innerHTML = `  <div class="refreshButtonBox">
                                                    <button class="softAnimate" id="refreshButton"></button>
                                                </div>
                                            `;

        document.body.appendChild(html_options_buttons);

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
                
                var cellNumber = celli+1, cellId = colId+cellNumber;
                
                html_box += `   <div class="cell" rel="${ cellId }" id="cell-${ cellId }">
                                    <div class="label">${ fsco?.cells[ cellId ] ? fsco?.cells[ cellId ] : '' }</div>
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

        const divs = document.querySelectorAll('.container .grid .row .cell');

        divs.forEach(el => el.addEventListener('click', event => {

            var cellId = event.target.getAttribute('rel');

            if(cellId){

                el.classList.add('edit-on');

                var new_input = document.createElement('input');
                    new_input.type = 'text'; 
                    new_input.id = `input-${ cellId }`; 
                    new_input.value = fsco?.cells[ cellId ] ? fsco?.cells[ cellId ] : '';
                    new_input.addEventListener('blur', event => {
                        el.classList.remove('edit-on');
                        inputBlur(cellId);
                    });

                document.getElementById(`cell-${ cellId }`).appendChild(new_input);
                document.getElementById(`input-${ cellId }`).focus();
                fsco.active.cell = cellId;

            }

        }));

        document.getElementsByTagName(`body`)[0].classList.add('ready');

    }

    function inputBlur(id){
        if(!id) return false;
        var val = document.getElementById(`input-${ id }`).value;
        fsco.cells[ id ] = val;
        document.getElementById(`input-${ id }`).remove();
        fsco.active.cell = null;
        cellLabel(id);
    }

    function cellLabel(id){
        if(!id || !fsco?.cells[ id ]) return false;
        document.getElementById(`cell-${ id }`).getElementsByClassName(`label`)[0].innerHTML = fsco?.cells[ id ];
    }

    const fsco = FSCO_Data;

    window.onload = () => {
        initApp();
    }

})(window);