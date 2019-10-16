let remote  = require('electron').remote;
let dialog  = remote.dialog;

//open all link to default browser, marked the link by "a" tag
/*let shell = require('electron').shell
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A' && event.target.href.startsWith('http')) {
        event.preventDefault()
        shell.openExternal(event.target.href)
    }
})*/
//initiate electron filesystem
fs = require('fs');

$("#browse-directory").click(function(){
    //show open directory window
    dialog.showOpenDialog({
        properties: ['openDirectory']
    },
    //display folder position result in absolute path
    (folderposition) => {
        if(folderposition !== undefined)
        {
						//var textareaVal = document.getElementById('location').value;
						//$("textarea[name=location]").html(folderposition +"\n" + textareaVal);
						
						//var textareaVal = document.getElementById('myDiv').innerHTML ;
						//$("#myDiv").html(folderposition +"\n" + textareaVal);

						add_info(folderposition);


        }
        else
        {
            /* when user cancel submit folder name
             * set input field with attributes id location with null. So, in application
             * will only display the placeholder value of this element
             */
            document.getElementById('location').value = null;
        }
    });
});



function add_info(x) {
    var pre_set = document.getElementById('pre_set');
    var fieldid = pre_set.getAttribute('last-id');
    pre_set.setAttribute('last-id',Number(fieldid) + 1 );

    // 복사할 div 엘리먼트 생성
    var div = document.createElement('div');
    div.innerHTML = pre_set.innerHTML;
    div.id = 'field-data-' + fieldid;
    var temp = div.getElementsByClassName('selection_content')[0];
    temp.innerText = x ;
    var deleteBox = div.getElementsByClassName('delete_box')[0];
    deleteBox.setAttribute('target',div.id);
    document.getElementById('field').appendChild(div);
}

