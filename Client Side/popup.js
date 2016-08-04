// "use strict";
window.addEventListener("load", function()
{

	// Checking Internet Connection
	// function checkNetConnection(){
	// 	jQuery.ajaxSetup({async:false});
	// 	re="";
	// 	r=Math.round(Math.random() * 10000);
	// 	$.get("https://www.google.co.in/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=testing",{subins:r},function(d){
	// 	  re=true;
	// 	}).error(function(){
	// 	  re=false;
	// 	});
	// 	return re;
	// }

	//Jquery ADD Click handler to add WORD-MEANING set in storage
	function save(str,msg){		
	  chrome.storage.sync.get({userKeyIds: null}, function (result) {
	    // the input argument is ALWAYS an object containing the queried keys
	    // so we select the key we need

	    			// ### CODE FOR INDEXES

		  // if( !localStorage.getItem("count")){
		  //		localStorage.setItem("count","0");
		  // } 
			// var i = localStorage.getItem("count");
			// var ticker = parseInt(i);
			// ticker++;
						// ####

	    var userKeyIds = result.userKeyIds ;
	    var arr = $.makeArray(userKeyIds);
	    arr.push( str + " :-  " + msg);
	    
	    chrome.storage.sync.set({userKeyIds: arr}, function () {
	        // you can use strings instead of objects
	        // if you don't  want to define default values
	     // chrome.storage.sync.get('userKeyIds', function () {
	  	//	});
			});
			// localStorage.setItem("count",ticker.toString());
		});
	} //add


	function site(str){

		if(!str){
			$('#alert').html("No word Selected, select a word first");
		}
		else{
			chrome.tabs.create({'url': "http://yourdictionary.com/"+str.toLowerCase() }, function(tab) {
					        // Tab opened.
		  });
		}
	}

	$('#clear').click(function(){
		alert("Are you sure, whole list will be deleted permanently")
		chrome.storage.sync.clear();
		$('#mylist').html(null);	
		// localStorage.setItem("count","0");		
	});

	// Helper method to parse the title tag from the response.
	function getTitle(text) {
	  return text.match('<title>(.*)?</title>')[1];
	}

	function searchVocab(word){
    $('#revert').css("display","none");
    $('#load').css("display","block");
	  if(word.includes('.')){
	  	word =  word.substr(0,word.indexOf('.'));
	  }
	  if(word.includes(',')){
	  	word =  word.substr(0,word.indexOf(','));
	  }  
	  if(word.includes(';')){
	  	word =  word.substr(0,word.indexOf(';'));
	  }  
	  if(word.includes('--')){
	  	word =  word.substr(word.indexOf('--'));
	  }
		$.ajax({
        type: "POST",
        url: "http://sarcnitj.com/Server%20Side/index.php", //http://lexicon.byethost18.com/bytehostphp.phpp	
        data: {
            link: word
        }
    })
    .done(function (msg) {
		    word =  word.toUpperCase();
		    var def =	"<strong>"+"Meaning of "+word+" :<br>" +  "</strong>" +msg;
				$('#load').css("display","none");
				$('#revert').css("display","block");
			  $('#hiddenDef').html(msg);
	  	  $('#hiddenWord').html(word);
		    $("#revert").html(def).addClass('animated bounceIn');
		});
			
	};
	// checkNetConnection();
	chrome.tabs.query({'active': true, currentWindow:true}, function (tabs) {

	  var link =  tabs[0].url;
	  if(link.includes('www.google')){
	  		
	  		$('#revert').css("display","none");
				$('#load').css("display","block");

	    	//########### The set of links tested  ###################//

		    // 1. https://www.google.co.in/search?q=grab&oq=grab&aqs=chrome..69i57j0l5.1107j0j9&sourceid=chrome&ie=UTF-8#q=grab+meaning
				// 2. https://www.google.co.in/search?q=grab&oq=grab&aqs=chrome.0.69i59j69i60j69i59j69i65l2j0.1516j0j9&sourceid=chrome&ie=UTF-8#q=grab%20meaning%20in%20hindi
				// 3. https://www.google.co.in/search?espv=2&biw=1366&bih=643&q=define+infuriate&sa=X&ved=0ahUKEwjj5dSF8o7OAhUDQo8KHSWnDBYQ_SoIHzAA#q=enrage
				$('#google-welcome-message').firstVisitPopup({
				  cookieName : 'google',
				  showAgainSelector: '#show-message'
				});
				
				//Splitting link on the position of '?', '&' or '#'
				var results = (link.includes('#')?link.substr(1).split('#'):link.substr(1).split('?'));
				if(link.includes('&q=')){ var results = link.split('&');}
				if(link.includes('#q=' && '&q=')){ var results = link.split('#');}			
				
				//Decoding function for extracting the WORD
				var qs = (function(a) {
			    
			    if (a == "") return {};
			    var b = {};
			    for (var i = 0; i < a.length; ++i)
			    {
			        var p=a[i].split('=', 2);
			        if (p.length == 1)
			            b[p[0]] = "";
			        else
			            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
			    }
			    return b;

				})(results);

				//Further filter of extracted word If it contain '&' or '+' or " "
				if(qs["q"].includes('&')) {qs["q"] = qs["q"].substr(0,qs["q"].indexOf('&'));}
				if(qs["q"].includes(' ')) {qs["q"] = qs["q"].substr(0,qs["q"].indexOf(' '));}
				if(qs["q"].includes('+')) {qs["q"] = qs["q"].substr(0,qs["q"].indexOf('+'));}
				
				//Final WORD stored in variable str
				var str = qs["q"];
				str = str.toLowerCase();
				

				//Making post request to PHP file to reach the site http://yourdictionary.com
				$.ajax({
		        type: "POST",
		        url: "http://sarcnitj.com/Server%20Side/index.php", //http://lexicon.byethost18.cp	m/bytehostphp.php
		        data: {
		            link: str
		        }
		    })
		    .done(function (msg) {
	  			str = str.toUpperCase();
	  			//got meaning of WORD in msg variable
		  		$('#revert').css("display","block");
		  		set = "<strong>"+"Meaning of "+str+" :<br>" +  "</strong>" +msg;  
					$('#hiddenDef').html(msg);
					$('#hiddenWord').html(str);
					$('#load').css("display","none");
					$('#revert').html(set).addClass('animated bounceIn');
				});
		}

		else{

			$('#nongoogle-welcome-message').firstVisitPopup({
			  cookieName : 'nongoogle',
			  showAgainSelector: '#show-message'
			});
			document.getElementById('revert').innerHTML = "It is not a Google Search Page, Automatic search will not work but you can see the list by clicking 'Show all' button, or can try manual search";
			$('#p').css("display","none");
			$("form").css("display","block");
		
			$('#btn').click(function(){
	  			$('#revert').css("display","none");
					var str = $('#link').val();
					str = str.replace(/\s+/g, '');
					if(str.search(/^[A-z]+$/) == -1 ){ $('#alert').html("Enter Valid Text"); return ;}
					$('#load').css("display","block");
					$('#alert').html(null);
					str = str.toLowerCase();
					  
					$("#reg-form").submit(function(){  
						$.ajax({
		        type: "POST",
		        url: "http://sarcnitj.com/Server%20Side/index.php", //http://lexicon.byethost18.com/bytehostphp.php	
		        data: {
		            link: str
		        }
			    })
			    .done(function (msg){
							str = str.toUpperCase();
				  	  var def =	"<strong>"+"Meaning of "+str+" :<br>" +  "</strong>" +msg; 
				  	  $('#hiddenDef').html(msg);
				  	  $('#hiddenWord').html(str);
					    $('#load').css("display","none");
				  		$('#revert').css("display","block");
					    $("#revert").html(def).addClass('animated bounceIn');
					  });
					  return false;
				 	});
					
			});
		}
		
		$('#add').click(function(){
			var word = $('#hiddenWord').text();
			var msg = $('#hiddenDef').text();
			save(word,msg);
		}); 

		$('#site').click(function(){
			var word = $('#hiddenWord').text();
			site(word);
		});

		$('#show').click(function(){
	    chrome.storage.sync.get('userKeyIds', function (result) {
	    	if(!result.userKeyIds || result.userKeyIds == ""){
	        document.getElementById('alert').innerHTML = "No Item in the list";
	        $('#mylist').toggle("linear");
	    	}
	    	else  {
	    		$('#alert').html(null);
	    		$('#mylist').html(null);
	    		var set = result.userKeyIds;
	    		// console.log($(set));
	    		// set = set.toString();
	    		// set = set.replace(/,/g, "#");
	    		// document.getElementById('meaning').innerHTML =  set;
	    		//var set = set.split(",");
	    		var cList = $('#mylist');
	    		$('#mylist').css("padding","15px");
					
					$.each(set, function(i)
					{
							var li = $('<li/>')
					        .addClass('ui-menu-item')
					        .text(set[i])
					        .appendTo(cList);
	 						
	 						var check =  $('<input/>') 
									.addClass('chkbox')
									.attr('type','checkbox')
									.appendTo(li);
					});

	    		$('#mylist').toggle("linear");

					$('#del').click(function(){
							$('#mylist li').has('input:checked').remove();
							var data = [];
							
							$('#mylist').each(function(){
								$(this).find('li').each(function(){
									// cache jquery var
			            var current = $(this);
			            // check if our current li has children (sub elements)
			            // if it does, skip it
			            data.push(current.text());
			          });
							});
	            
	            chrome.storage.sync.set({userKeyIds: data}, function () {
					    });
					});
	    	} //else
	  	}); //get
	  }); //show
	}); //Tabs Query

	//About
	$('#about').click(function(){
		$('#aboutslide').slideToggle();
		$('#aboutslide').css("display","block");
	});

	//Help 
	$('#help').click(function(){
		$('#helpslide').slideToggle();
		$('#helpslide').css("display","block");
	});

	$("#revert").click(function(e){
    s = window.getSelection();
    var range = s.getRangeAt(0);
    var node = s.anchorNode;
    while(range.toString().indexOf(' ') != 0) {                 
      range.setStart(node,(range.startOffset -1));
    }
    range.setStart(node, range.startOffset +1);
    do{
      range.setEnd(node,range.endOffset + 1);

    }while(range.toString().indexOf(' ') == -1 && range.toString().trim() != '');
    var str = range.toString().trim();
    searchVocab(str);
  });

	// chrome.contextMenus.removeAll(function() {
	// 	chrome.contextMenus.create({
	// 	 title: "Search in Vocab",
	// 	 contexts:["selection"],  // ContextType
	// 	 onclick: searchVocab // A callback function
	// 	});
	// });

}, false);
 	

