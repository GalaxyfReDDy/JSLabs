/**
 * Created by fReDDy on 17.04.2016.
 */
document.addEventListener("DOMContentLoaded", function(){
    var mode;
    $(document).ready(function(){
        $("#stringError")[0].hidden=true;
        $("#intError")[0].hidden=true;
        $("#boolError")[0].hidden=true;
        $("#emptyError")[0].hidden=true;
    });
    $("#addString").click(function() {
        var tr = '<tr>';
        for (var i = 0; i < 3; i++)
            tr = tr + '<td><input style="width:100%" type="text" value="newString"></td>';
        tr = tr + '<td><select style="width:100%" class="typeSelection">' +
            '<option selected>System.String</option>' +
            '<option>System.Int32</option>' +
            '<option>System.Boolean</option>' +
            '</select></td>' +
            '<td><input class="value_Class" style="width:100%" type="text" name="text" value="text"></td>' +
            '<td><button style="width:100%" class="remove_row">delete</button></td>' +
            '</tr>';
        var trObject = $(tr);

        trObject.find('.typeSelection').bind('change', changeSelectHandler);
        trObject.find('.remove_row').bind('click', removeRow);
        trObject.find('.value_Class').bind('paste',function(event) {
            return PasteHandling(this,event);
        });
        trObject.find('.value_Class').bind('keydown', function(event) {
            return KeyDownHandling(this,event);
        });
        trObject.find('.value_Class').bind('keyup', function(event){
            if (+event.keyCode == 16)
            {
                mode="none";
            }
        });
        $("#main_table").last().append(trObject);

    });
    $(".remove_row").click(function(){
        removeRow();
    });
    $(".value_Class").on('paste',function(event)
    {
        PasteHandling(this,event);
    });
    function PasteHandling(currentEvent,event){
        if (currentEvent.name !="text") {
            var newValue = currentEvent.value.slice(0, currentEvent.selectionStart) +
                event.originalEvent.clipboardData.getData('text/plain') +
                currentEvent.value.slice(currentEvent.selectionEnd);
            if (isNaN(+newValue) || newValue[0] == '-' && newValue[1] == '0'
                || newValue[0] =='0' && newValue.length >1) {
                if (newValue!='-')
                    event.preventDefault();
            }
        }
    }
    $(".value_Class").on('keydown',function(event){
        return KeyDownHandling(this,event);
    });
    function KeyDownHandling(currentEvent,event){
        if (currentEvent.name == "number") {
            if (event.ctrlKey)
            {
                return true;
            }
            if (+event.keyCode == 16) {
                mode = "shift";
                return false;
            }
            if (+event.keyCode == 189) {
                var newValue = currentEvent.value.slice(0, currentEvent.selectionStart) +
                    '-' +
                    currentEvent.value.slice(currentEvent.selectionEnd);
                if (!isNaN(newValue) || currentEvent.value.length == 0)
                {
                    return true;
                }
                else return false;
            }
            if (+event.keyCode == 8) {
                return true;
            }
            if (+event.keyCode >= 48 && +event.keyCode <= 57 || +event.keyCode == 189) {
                if (mode == "shift") {
                    return false;
                }
                else {
                    if (currentEvent.value == '0') {
                        return false;
                    }
                    if (+event.keyCode == 48) {
                        if (+currentEvent.selectionStart == 0 && (currentEvent.value.length !=0)
                            || currentEvent.value.length == 1 && currentEvent.value[0] == '0'
                            || currentEvent.value[0] == '-' && currentEvent.selectionStart == 1) {
                            console.log("-------------------");
                            console.log(currentEvent.value.length);
                            return false;
                        }
                    }
                    if (currentEvent.selectionStart == 0 && currentEvent.value[0] =='-') {
                        return false;
                    }
                    else return true;
                }
            }
            else  return false;
        }
        else return true;
    }
    $(".value_Class").keyup(function(event){
        if (+event.keyCode == 16)
        {
            mode="none";
        }
    });
    $("#saveData").click(function(){
       var result=[],
           rows=$("#main_table tr"),
           bool=true,
           onechecked=false;
        [].forEach.call($("input.value_Class"),function(item){
            if (item.name == "text")
            {
                if (item.value.length > 10)
                {
                    bool=false;
                    item.style.borderColor="red";
                    $("#stringError").show("slow");
                }
            }
            if (item.name == "number")
            {

                if (+item.value<-256 || +item.value >256 || isNaN(+item.value)
                    || item.value[0] == '0' && item.value.length > 1 )
                {
                    bool=false;
                    item.style.borderColor="red";
                    $("#intError").show("slow");
                }

            }
            if (item.value == "")
            {
                item.style.borderColor="red";
                $("#emptyError").show("slow");
                bool=false;
            }

        });
        [].forEach.call($('input[type="checkbox"]'),function(item){
            if (item.checked)
                onechecked=true;
        });
        if (!onechecked)
        {
            $("#boolError").show("slow");

        }
        if (bool && onechecked) {
            clearValueInput();
            [].forEach.call(rows, function (item, index) {
                if (index != 0) {
                    var itemElements = item.children,
                        itemValue = itemElements[4].firstElementChild,
                        selectType = getSelectionValue(itemElements[3].firstElementChild),
                        selectValue = selectType == "System.Boolean" ? itemValue.checked : itemValue.value;
                    result.push({
                        Id: itemElements[0].firstElementChild.value,
                        Name: itemElements[1].firstElementChild.value,
                        Description: itemElements[2].firstElementChild.value,
                        Type: selectType,
                        Value: selectValue
                    });
                }

            });
            console.dir($("savedata"));
            $.ajax({
                    type: "POST",
                    url: "/saveXML",
                    data: JSON.stringify(result),
                    success: function (response) {
                        animateColor("green");
                    }
                }
            )
        }
        else animateColor("red");
    });
    function animateColor(currentColor){
        $("button#savedata")[0].style.backgroundColor=currentColor;
        setTimeout(function(){
            $("button#savedata")[0].style.backgroundColor=null;
        },1000);
    }
    function clearValueInput() {
        [].forEach.call($("input.value_Class"), function (item) {
            item.style.borderColor = "";
        });
        $("#emptyError").hide("slow");
        $("#stringError").hide("slow");
        $("#intError").hide("slow");
        $("#boolError").hide("slow");
    };
    $(".typeSelection").change(changeSelectHandler);
    function changeSelectHandler() {
        if ($("option:selected", this).text() == 'System.Boolean') {
            $(this).parent().next()[0].children[0].type = 'checkbox';
            $(this).parent().next()[0].children[0].name="";
        }
        else {
            if (this.selectedIndex == '0') {
                $(this).parent().next()[0].children[0].name = 'text';
                $(this).parent().next()[0].children[0].defaultValue="text";
                $(this).parent().next()[0].children[0].value="text";
            }
            else if (this.selectedIndex == '1') {
                $(this).parent().next()[0].children[0].name = 'number';
                $(this).parent().next()[0].children[0].defaultValue='0';
                $(this).parent().next()[0].children[0].value='0';
            }
            $(this).parent().next()[0].children[0].type = 'text';
        }
    }
    function getSelectionValue(selectValue)
    {
        var options=selectValue.children;
        for (var i=0;i<options.length;i++)
        {
            if (options[i].selected)
            {
                return options[i].innerHTML;
            }

        }
    }
    function removeRow() {
        $(event.target).parent().parent().remove();
    };
});