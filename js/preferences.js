

$(document).ready(function () {
  $('.cocher').on('click', function() {
        var numParent = $(this).prop("id").charAt(8); // Pour récupérer le numéro de la catégorie
        cocherAssosGenerique(numParent);
  });

  $(".fa").on('click', function() {
        var numId = $(this).prop("id").charAt(7);
        console.log(numId);
        changerSensChevronGenerique(numId);
        ajouterAssosGenerique(numId);
  });


});

function cocherFavoris() {
  var fav1 = "#caseTest2"; // favoris centre d'interet
  var fav2 = "#bde5"; // Favoris assos
  var favCheck = '#favoris:not(:checked)';
  if ($(fav2).length == 0 && $(favCheck).length == 0) {
    changerSensChevronGenerique(5);
    ajouterAssosGenerique(5);
    $(fav2).prop('checked',($(favCheck).length == 0));
  } else if ($(fav2).length !== 0){
      $(fav2).prop('checked',($(favCheck).length == 0));
  }
  $(fav1).prop('checked',($(favCheck).length == 0));
}

function changerSensChevronGenerique(numId) {
  var chevron = '#chevron' + numId;
  if ($(chevron).attr("class") === "fa fa-chevron-up") {
    $(chevron).toggleClass('fa-chevron-up', false).toggleClass('fa-chevron-down', true);
  } else {
    $(chevron).toggleClass('fa-chevron-down', false).toggleClass('fa-chevron-up', true);
  }
}

function cocherAssosGenerique(num) {
    var radioAsso = '.radioAsso';
    var balise = radioAsso + num;
    var check = '#caseTest' + num + ':not(:checked)';
    if ($(balise).length !== 0) {
      $(balise).prop('checked',($(check).length == 0));
    }
}

function ajouterAssosGenerique (numId) {
  var asso = ".assos" + numId;
  var classAsso = "assos" + numId;
  var radioAsso = "radioAsso" + numId;
  var parentTest = "#parentTest" + numId;
  if ($(asso).length == 0) {
      $(parentTest).after('<li id="assoArgil' + numId + '" class="list-group-item ' + classAsso + '">ARGIL'
        + '<span class="badge">'
        +  '<div class="checkbox gros">'
        +  '<input class="' + radioAsso + '" id="argil' +numId + '" type="checkbox" checked="false"/>'
        + '<label for="argil' + numId + '"></label>'
        + '</div></span></li>'
        + '<li class="list-group-item '+ classAsso +'">BDE'
        + '<span class="badge">'
        +  '<div class="checkbox gros">'
        +  '<input class="' + radioAsso + '" id="bde'+ numId + '" type="checkbox" checked="false" />'
        + '<label for="bde' + numId + '"></label>'
        + '</div></span></li>'
        + '<li id="assoKleson' + numId + '" class="list-group-item '+ classAsso +'">K-le Son'
        + '<span class="badge">'
        +  '<div class="checkbox gros">'
        +  '<input class="' + radioAsso +'" id="kleson' + numId +'" type="checkbox" checked="false" />'
        + '<label for="kleson' + numId + '"></label>'
        + '</div></span></li>');
        activerCssGenerique(numId);
        var casetest = "#caseTest" + numId + ":not(:checked)";
        $('.' + radioAsso).attr('checked',($(casetest).length == 0));
        $('.' + radioAsso).on('click', function() {
              cocherCentreInteretGenerique(numId);
        });
    } else {
        $(asso).remove();
        $('#parentTest' + numId).css('margin-bottom', '7px');
    }
}

function cocherCentreInteretGenerique(numId) {
    var radioAsso = ".radioAsso" + numId;
    var caseTest = "#caseTest" + numId;
    $(radioAsso).click(function() {
      $(caseTest).prop('checked',($(radioAsso + ':not(:checked)').length == 0));

    });
}

function activerCssGenerique(numId) {
  var asso = ".assos" + numId;
  $(asso).css('text-align', 'left');
  $(asso).css('height', '40px');
  $(asso).css('padding-left', '2.375rem');
  $(asso).css('padding-bottom', '1rem');
  $(asso).css('padding-top', '0.5rem');
  $(asso).css('margin-top', '0.175rem');
  $(asso).css('margin-bottom', '0.175rem');
  $(asso).css('background-color','#F7F7F7');
  $('#assoArgil' + numId).css('margin-top', '0rem');
  $('#parentTest' + numId).css('margin-bottom', '0rem');
  $('#assoKleson' + numId).css('margin-bottom', '0.450rem');
}
