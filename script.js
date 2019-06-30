var videoImg = 'https://www.shareicon.net/data/128x128/2015/08/20/87931_video_512x512.png',
    filelist = [],
    steptsMedia = [
        {
            'title' : 'Paso 1: Seleccionar y Ordenar Elementos',
            'visible' :  ['previewGallery','btnNextStep'],
            'hidden' : ['dataFile','selAutor','btnSaveMedia'],
        },
        {
            'title' : 'Paso 2: Cargar Fecha y Descripcion',
            'visible' :  ['dataFile','btnNextStep'],
            'hidden' : ['previewGallery','selAutor','btnSaveMedia']
        }, 
        { 
            'title' : 'Paso 3: Seleccionar Autor',
            'visible' :  ['selAutor','btnSaveMedia'],
            'hidden' : ['previewGallery','dataFile','btnNextStep']
        }
    ];

function ShowHideElements(step) {
	$.each(steptsMedia[step].visible,function(i,elem) {
		$(`#${this}`).removeClass('d-none');
	});
	$.each(steptsMedia[step].hidden,function() {
		$(`#${this}:not(.d-none)`).addClass('d-none');
	});
    $('#currentStep').val(step);
    $('#step h6').text(steptsMedia[step].title);
}

$(document).ready(function() {
    $('.autor').on('click', function(){
        $('.autor-invalid').removeClass('autor-invalid');
        $('.autor-sel').removeClass('autor-sel').addClass('autor');
        $(this).removeClass('autor').addClass('autor-sel');
        $('input[name="autor"]').val($(this).attr('id'));
    })
    $('#btnSaveMedia').on('click', function() {
        AddMedia();
    })

    $('#btnNextStep').on('click', function() {
        StepsMedia('right');
    });

    $('#formMedia').on('click', '.expandItem', function() {
            PreviewFile($(this).parent().parent()[0].id.split('-')[1]);
        });

    $('#formMedia').on('click', '.removeItem', function() {
        let id = $(this).parent().parent()[0].id.split('-')[1];
        filelist[id] = (function () { return; }) ();
        filelist = $.grep(filelist, function(e){return e});
        LoadPreviewGallery($.grep(filelist,function(e){ return e.file}).map(function(value,index){ return value['file'] }),1);
    });

    $('#formMedia').on('click', '#btnPrevFile', function() {
        ButtonDirectionGallery('left');
    });

    $('#formMedia').on('click', '#btnNextFile', function() {
        ButtonDirectionGallery('right');
    });

    $('#formMedia').on('focus','.datepicker', function() {
        $(this).datepicker({
            format: "dd/mm/yyyy",
            language: "es",
            autoclose: true,
            todayHighlight: true,
            clearBtn: true
        });
    });

    $('#btnPrevStep').on('click', function() {
        StepsMedia('left');
    });

    $("#previewGallery").on("drop", function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#custom-fileLabel').removeClass('drop');
        LoadPreviewGallery(e.originalEvent.dataTransfer.files);
    });
});

function AddMedia() {
    if (!ValidateStep($('#currentStep').val())) {
        $(".autor").addClass("autor-invalid");
        return false;
    }
    $('.cover').toggleClass('d-none');
    setTimeout(function() {
        $.when.apply(null,GetPromises()).then(function(){
            $('.cover').toggleClass('d-none');
            ResetForm();
        })
    }, 5000);
}

function allowDrop(e, itemGallery = 0) {
    e.preventDefault();
    e.stopPropagation();
    if (!itemGallery) 
        $('#custom-fileLabel').addClass('drop');
    else 
        $(itemGallery).children('img').addClass('drop');
}

function ButtonDirectionGallery(direction) {
    $(".invalid").removeClass("invalid");
    if (direction == 'left')
        GetDataFile(PrevFile());
    else if (ValidateDataFile())
        GetDataFile(NextFile());
}

function ClosePreviewFile() {
    $('#previewFile').toggleClass('d-none');
    $('#videopreview')[0].pause();
    $('#videopreview').removeAttr('src');
    $('#videopreview')[0].load();
    $('#previewGallery').toggleClass('d-none');
}

function drag(e,div) {
    e.dataTransfer.setData("text", div.id);
}

function dragLeave(e, itemGallery = 0) {
    e.preventDefault();
    e.stopPropagation();
    if (!itemGallery) 
        $('#custom-fileLabel').removeClass('drop');
    else 
        $(itemGallery).children('img').removeClass('drop');
}
    
function drop(e,div) {
    e.preventDefault();
    e.stopPropagation();
    var data = e.dataTransfer.getData("text");
    $(div).children('img').removeClass('drop');
    MoveItemGallery(data,div.id);
}

function GetDataFile(index) {
    if (filelist[index].type == 'image') {
        $('.card img').attr('src', filelist[index].tmpfile);
        $('.card img').show();
        $('.card video').hide();
    } else {
        $('.card video').attr('src', filelist[index].tmpfile);
        $('.card video').show();
        $('.card img').hide();
    }
    $('.card input[name="fecha"]').val(filelist[index].fecha);
    $('.card input[name="titulo"]').val(filelist[index].titulo);
    $('#currentFile').val(index);
    if (index == 0)
        $('#btnPrevFile').attr('disabled','true');
    else 
        $('#btnPrevFile').removeAttr('disabled');
    if (index == filelist.length - 1)
        $('#btnNextFile').attr('disabled','true');
    else
        $('#btnNextFile').removeAttr('disabled');
    $('#current_file').text(`${(index + 1)} / ${filelist.length}`);
}

function GetIndexIncompleteFile() {
    let indexEmpty = -1;
    $.each(filelist, function(i, elem) {
        if (elem.fecha == '' || elem.titulo == '') {
            indexEmpty = i;
            return false;
        }
    });
    return indexEmpty;
}

function GetPromises() {
    var promises = [];
    $.each(filelist, function(i, elem) {
        //Fill with ajax call to post data to server
        promises.push(
            console.log(`Post image ${(i + 1)}`)
        );
    });
    return promises;
}

function LoadFiles(input) {
    LoadPreviewGallery(input.files); 
}

function LoadPreviewGallery(files, refresh = 0) {
    $('.cover').toggleClass('d-none');
    let gallery = '';
    let iStart = !refresh ? filelist.length : 0;
    $('#custom-fileLabel').removeClass('error');
    if (refresh) $('.itemGallery').remove();
    let current_elements = !refresh ? $.grep(filelist,function(e){ return e.file}).map(function(value,index){ return value['file']['name'] }) : '';
    $.each(files, function(i, elem) {
        if (!refresh) if (jQuery.inArray(elem.name, current_elements) !== -1) return;
        let type = elem.type.split("/")[0];
        let tmpfile = window.webkitURL.createObjectURL(elem);
        gallery += `<div class='itemGallery' id='itemGallery-${iStart + i}' 
                ondrop='drop(event,this)' ondragover='allowDrop(event,this)' ondragleave='dragLeave(event,this)' draggable='true'  ondragstart='drag(event,this)'>
            <img src='${(type != 'image' ? videoImg : tmpfile)}' draggable='true'>
            <input type='hidden' value='${(type != 'image' ? tmpfile : '')}'>
            <div><span class='fas fa-search-plus expandItem'></span><span class='fas fa-times removeItem'></span></div></div>`;
         if (!refresh) filelist[iStart + i] = {'file': elem, 'tmpfile': tmpfile, 'type': type, 'fecha': '', 'titulo': ''};
    });
    $('#wrapperGallery').append(gallery);
    $('.cover').toggleClass('d-none');
}

function MoveItemGallery(from,to) {
    let iFrom = from.split('-')[1],
        iTo = to.split('-')[1],
        itemAux = filelist[iFrom];
    filelist[iFrom] = filelist[iTo];
    filelist[iTo] = itemAux;
    if (filelist[iFrom].type == 'image') {
        $(`#${from}`).children('img').attr('src', filelist[iFrom].tmpfile);
        $(`#${from}`).children('input').val('');
    } else {
        $(`#${from}`).children('img').attr('src', videoImg);
        $(`#${from}`).children('input').val(filelist[iFrom].tmpfile);
    }
    if (filelist[iTo].type == 'image') {
        $(`#${to}`).children('img').attr('src', filelist[iTo].tmpfile);
        $(`#${to}`).children('input').val('');
    } else {
        $(`#${to}`).children('img').attr('src', videoImg);
        $(`#${to}`).children('input').val(filelist[iTo].tmpfile);
    }
}

function NextFile() {
    let curIndex = $('#currentFile').val();
    SetDataFile(curIndex);
    return parseInt(curIndex) + 1;
}

function PrevFile() {
    return parseInt($('#currentFile').val()) - 1;
}

function PreviewFile(index) {
    if (filelist[index].type == 'image') {
        $('#videopreview').hide();
        $('#imagepreview').attr('src', filelist[index].tmpfile).show();
    } else {
        $('#imagepreview').hide();
        $('#videopreview').attr('src', filelist[index].tmpfile).show();
    }
    $('#previewGallery').toggleClass('d-none');
    $('#previewFile').toggleClass('d-none');
}

function RemoveFile(input) {
    $(`#${input}`).val("");
    $(`#${input}`).next('label').removeClass("file-ok").css("background-image","none");
    $(`#expand${input}`).removeAttr("href");
    filelist[input] = (function () { return; })();
    let iid = input.split("-")[1];
    if ($(`#fecha-${iid}`).val() == "")
        $(`#fecha-${iid}`).removeClass("invalid");
    if ($(`#titulo-${iid}`).val() == "")
        $(`#titulo-${iid}`).removeClass("invalid");
}

function ResetForm() {
    filelist = [];
    $('.autor-sel').removeClass('autor-sel').addClass('autor');
    $('input[name="autor"]').val('');
    LoadPreviewGallery(filelist, 1);
    ShowHideElements(0);
}

function SetDataFile(index) {
    filelist[index].fecha = $('.card input[name="fecha"]').val();
    filelist[index].titulo = $('.card input[name="titulo"]').val();
}

function SetDataMedia(index = -1) {
    if (index == -1)
        index = 0;
    GetDataFile(index);
}

function StepsMedia(direction) {
    let curStep = $('#currentStep').val();
    let newStep = direction == 'left' ? parseInt(curStep) - 1 : parseInt(curStep) + 1;
    switch (curStep) {
        case '0':
            if (!ValidateStep(curStep)) {
                $('#custom-fileLabel').addClass('error');
                return false;    
            }
            ShowHideElements(newStep);
            SetDataMedia(GetIndexIncompleteFile());
            break;
        case '1':
            if (direction == 'left')
                ShowHideElements(newStep);
            else {
                $(".invalid").removeClass("invalid");
                if (!ValidateDataFile()) return false;
                let indexIncompleteFile = GetIndexIncompleteFile();
                if (indexIncompleteFile != -1) 
                    if (indexIncompleteFile == filelist.length - 1 && indexIncompleteFile == $('#currentFile').val()) {
                        SetDataFile(indexIncompleteFile);
                        ShowHideElements(newStep);
                    } else {
                        SetDataMedia(indexIncompleteFile);
                        return false;
                    }
                ShowHideElements(newStep);
            }
            break;
        case '2':
            if (direction == 'left') {
                ShowHideElements(newStep);
                SetDataMedia();
            }
            break;
    }
    if (newStep == 0)
        $('#btnPrevStep').attr('disabled','true');
    else {
        $('#btnPrevStep').removeAttr('disabled');
    }
}

function ValidateDataFile() {
    if ($('.card input[name="fecha"]').val() == '') $('.card input[name="fecha"]').addClass('invalid');
    if ($('.card input[name="titulo"]').val() == '') $('.card input[name="titulo"]').addClass('invalid');
    if ($(".invalid").length > 0) return false;
    return true;
}

function ValidateStep(step) {
    switch (step) {
        case '0':
            if ($('.itemGallery').length == 0) return false;
            break;
        case '1':
            let indexIncompleteFile = GetIndexIncompleteFile();
            if (indexIncompleteFile != -1) return indexIncompleteFile;
            break;
        case '2':
            if ($(".autor-sel").length == 0) return false;
            break;
    }
    return true;
}