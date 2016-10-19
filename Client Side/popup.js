// "use strict";
window.addEventListener("load", function() {

  //UpdateCheck
  chrome.runtime.onUpdateAvailable.addListener(function(){
    var c = chrome.app.getDetails();
    console.log(c.version);
    chrome.runtime.reload();
  });

  //Reminder
  var i = 0;
  if(localStorage.getItem("alreadydone") == "1")
  {
    // localStorage.removeItem("alreadydone");
  }
  else
  {
    localStorage.setItem("alreadydone","0");
    if(localStorage.getItem("count") == "15"){
      $(".reminder").show();
      localStorage.setItem("count",i);    
    }
    else{
      i = localStorage.getItem("count")?localStorage.getItem("count"):0;
      i = parseInt(i);
      i=i+1;
      console.log(i);    
      localStorage.setItem("count",i);    
    }

    $(".ratepage").click(function(e){
      e.preventDefault();
      chrome.tabs.create({
          'url': "https://chrome.google.com/webstore/detail/word-o-save/amjldpjobjpiflbdejcidlkmhllhnnnm/reviews"
        }, function(tab) {
          // Tab opened.
        });

    });

    $(".enclose h1, .reminder").click(function(n){
      n.stopPropagation();
      $(".reminder").hide();
    });
  }    
 
  $(".alreadyrated").click(function(e){
    e.preventDefault();
    localStorage.setItem("alreadydone","1");
  });

  function ajaxcall(word) {
    $.ajax({
        type: "POST",
        url: "http://sarcnitj.com/Server%20Side/index.php",
        // url: "http://localhost/Server%20Side/bytehostphp.php", 	
        data: {
          link: word
        }
      })
      .done(function(msg) {
        word = word.toUpperCase();
        var def = "<strong>" + "Meaning of " + word + " :<br>" + "</strong>" + msg;
        $('#load').css("display", "none");
        $('#revert').css("display", "block");
        $('#hiddenDef').html(msg);
        $('#hiddenWord').html(word);

        //Display result in Blue box
        $("#revert").html(def).addClass('animated bounceIn');
        var height = $("#revert").innerHeight();
        var bodyHeight = $("body").innerHeight();
        $("body").css("height",bodyHeight + height - 40);
      });
  }
  //Jquery ADD Click handler to add WORD-MEANING set in storage
  function save(key, value) {
    chrome.storage.sync.getBytesInUse(null, function(current_value){
      var max_value = chrome.storage.sync.QUOTA_BYTES;
      if(current_value > max_value){
        $('#alert').html("Storage Exceeds! Please delete some items. ");
        return;
      }
      else{
          var obj = {};
          var y;
          obj[key] =  value;
          value = value.toString();
          chrome.storage.sync.get(null, function(all) {
            for(y in all){
              if(key == y)
              { 
                alert(key + " is already in the list.");
                return;
              }
            }
            chrome.storage.sync.set(obj, function(){
                $('#alert').html("Word saved successfully");
            });
          });
      }
    });  
  } 


  function site(str) {

    if (!str) {
      $('#alert').html("No word Selected, select a word first");
    } else {
      chrome.tabs.create({
        'url': "https://en.wiktionary.org/wiki/" + str.toLowerCase()
      }, function(tab) {
        // Tab opened.
      });
    }
  }

  $('#clear').click(function() {
    var r = confirm("Are you sure, whole list will be deleted permanently");
    if (r == true) {
    		chrome.storage.sync.clear();
		    $('#mylist').html(null);
    } else {
        return;
    }
    // localStorage.setItem("count","0");		
  });

  function searchVocab(word) {
    $('#revert').css("display", "none");
    $('#load').css("display", "block");
    ajaxcall(word);
  };

  chrome.tabs.query({
    'active': true,
    currentWindow: true
  }, function(tabs) {

    var link = tabs[0].url;
    if (link.includes('www.google')) {

      var bodyHeight = $("body").innerHeight();
      $("body").css("height",bodyHeight + 128);
      // $('body').css("min-height","300px");
      $('#revert').css("display", "none");
      $('#load').css("display", "block");

      //########### The set of links tested  ###################//

      // 1. https://www.google.co.in/search?q=grab&oq=grab&aqs=chrome..69i57j0l5.1107j0j9&sourceid=chrome&ie=UTF-8#q=grab+meaning
      // 2. https://www.google.co.in/search?q=grab&oq=grab&aqs=chrome.0.69i59j69i60j69i59j69i65l2j0.1516j0j9&sourceid=chrome&ie=UTF-8#q=grab%20meaning%20in%20hindi
      // 3. https://www.google.co.in/search?espv=2&biw=1366&bih=643&q=define+infuriate&sa=X&ved=0ahUKEwjj5dSF8o7OAhUDQo8KHSWnDBYQ_SoIHzAA#q=enrage
      $('#google-welcome-message').firstVisitPopup({
        cookieName: 'google',
        showAgainSelector: '#show-message'
      });
      //Splitting link on the position of '?', '&' or '#'
      
      if(window.getSelection() == null || window.getSelection() == "")
      {
      	var results = (link.includes('#') ? link.substr(1).split('#') : link.substr(1).split('?'));
	      if (link.includes('&q=')) {
	        var results = link.split('&');
	      }
	      if (link.includes('#q=' && '&q=')) {
	        var results = link.split('#');
	      }

	      //Decoding function for extracting the WORD
	      var qs = (function(a) {

	        if (a == "") return {};
	        var b = {};
	        for (var i = 0; i < a.length; ++i) {
	          var p = a[i].split('=', 2);
	          if (p.length == 1)
	            b[p[0]] = "";
	          else
	            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	        }
	        return b;

	      })(results);

	      //Further filter of extracted word If it contain '&' or '+' or " "
	      if (qs["q"].includes('&')) {
	        qs["q"] = qs["q"].substr(0, qs["q"].indexOf('&'));
	      }
	      if (qs["q"].includes(' ')) {
	        qs["q"] = qs["q"].substr(0, qs["q"].indexOf(' '));
	      }
	      if (qs["q"].includes('+')) {
	        qs["q"] = qs["q"].substr(0, qs["q"].indexOf('+'));
	      }

	      //Final WORD stored in variable str
	      var str = qs["q"];
	      str = str.toLowerCase();


	      //Making post request to PHP file to reach the site http://yourdictionary.com
	      ajaxcall(str);
      }

      if(window.getSelection() != null || window.getSelection() != "")
      {
		  	//To get selected value from the webpage
			  chrome.tabs.executeScript({
			    code: "window.getSelection().toString();"
			  }, function(selection) {
			    if (selection[0] != '') {
			      $('#revert').css("display", "none");
			      $('#load').css("display", "block");
			      var word = selection[0];
			      word = word.trim();
			      ajaxcall(word);
			    }
			  });    
		  }
    } 
    else {
      
      var bodyHeight = $("body").innerHeight();
      $("body").css("height",bodyHeight + 250);
      $('#nongoogle-welcome-message').firstVisitPopup({
        cookieName: 'nongoogle',
        showAgainSelector: '#show-message'
      });
      $('#revert').html("It is not a Google Search Page, Automatic search will not work but you can see the list by clicking 'Show all' button, or can try manual search");
      $('#p').css("display", "none");
      $("form").css("display", "block");

      $('#reg-form').submit(function() {
        $('#revert').css("display", "none");
        var str = $('#link').val();
        str = str.replace(/\s+/g, '');
        if (str.search(/^[A-z]+$/) == -1) {
          $('#alert').html("Enter Valid Text");
          return;
        }
        $('#load').css("display", "block");
        $('#alert').html(null);
        str = str.toLowerCase();

        // $("#reg-form").submit(function() {
          ajaxcall(str);
          return false;
        // });

      });

       //To get selected value from the webpage
		  chrome.tabs.executeScript({
		    code: "window.getSelection().toString();"
		  }, function(selection) {
		    if (selection[0] != '') {
		      $('#revert').css("display", "none");
		      $('#load').css("display", "block");
		      var word = selection[0];
		      word = word.trim();
		      ajaxcall(word);
		    }
		  });
    }

    $('#add').click(function() {
      var word = $('#hiddenWord').text();
      var msg = $('#hiddenDef').text();
      save(word, msg);
    });

    $('#site').click(function() {
      var word = $('#hiddenWord').text();
      site(word);
    });

    $('#show').click(function() {
     chrome.storage.sync.get(null, function(result) {
        if (result == null || result == "" || !result ) {
          $('#alert').html("No Item in the list");
          $('#mylist').toggle("linear");
        } else {
          $('#alert').html(null);
          $('#mylist').html(null);
          // console.log($(result));
          var set = [];
          var x;
          for(x in result){
            set.push(x + " :-  " + result[x]);
          }
          var cList = $('#mylist');
          $('#mylist').css({"padding":"15px", "padding-bottom":"200px"});

          $.each(set, function(i) {
            var li = $('<li/>')
              .addClass('ui-menu-item')
              .text(set[i])
              .appendTo(cList);

            var check = $('<input/>')
              .addClass('chkbox')
              .attr('type', 'checkbox')
              .appendTo(li);
          });

          $('#mylist').toggle("linear");

          $('#del').click(function() {
            var key;
            var arr= [];
            var c = $('#mylist li').has('input:checked').remove();
            for (var i = 0; i < c.length; i++) {
              var d = c[i].innerText;
              key  = d.substr(0,d.indexOf(" :"));
              arr.push(key);
            }
            console.log(arr);
            chrome.storage.sync.remove(arr);            
          });

        } //else
      }); //get
    }); //show
  }); //Tabs Query

  //About
  $('#about').click(function() {
    $('#aboutslide').slideToggle();
    $('#aboutslide').css("display", "block");
  });

  //Help 
  $('#help').click(function() {
    $('#helpslide').slideToggle();
    $('#helpslide').css("display", "block");
  });

  $("#revert").click(function(e) {
    $('#alert').html(null);
    s = window.getSelection();
    s.modify('extend','backward','word');        
    var b = s.toString();

    s.modify('extend','forward','word');
    var a = s.toString();
    s.modify('move','forward','character');
    var word =  b+a;
    // if(/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(word) == true){
    if(/[^A-z]/.test(word) == true){
      word =  word.replace(/[^A-z]/,'');
    }
    word =  word.replace(/\r?\n|\r/,"");
    // alert(word);
    searchVocab(word);
  });

  // chrome.contextMenus.removeAll(function() {
  // 	chrome.contextMenus.create({
  // 	 title: "Search in Vocab",
  // 	 contexts:["selection"],  // ContextType
  // 	 onclick: searchVocab // A callback function
  // 	});
  // });

}, false);


