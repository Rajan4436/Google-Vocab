window.addEventListener("load", function() {

    chrome.tabs.query({
        'active': true,
        currentWindow: true
    }, function(tabs) {

        var link = tabs[0].url;
        if (link.includes('www.google')) {

            //########### The set of links tested  ###################//

            // 1. https://www.google.co.in/search?q=grab&oq=grab&aqs=chrome..69i57j0l5.1107j0j9&sourceid=chrome&ie=UTF-8#q=grab+meaning
            // 2. https://www.google.co.in/search?q=grab&oq=grab&aqs=chrome.0.69i59j69i60j69i59j69i65l2j0.1516j0j9&sourceid=chrome&ie=UTF-8#q=grab%20meaning%20in%20hindi
            // 3. https://www.google.co.in/search?espv=2&biw=1366&bih=643&q=define+infuriate&sa=X&ved=0ahUKEwjj5dSF8o7OAhUDQo8KHSWnDBYQ_SoIHzAA#q=enrage
            $('#p').css("display", "none");

            //Splitting link on the position of '?', '&' or '#'
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
            $.ajax({
                    type: "POST",
                    url: "http://sarcnitj.com/Server%20Side/index.php",
                    data: {
                        link: str
                    }
                })
                .done(function(msg) {
                    str = str.toUpperCase();
                    //got meaning of WORD in msg variable
                    document.getElementById('revert').innerHTML = "<strong>" + "Meaning of " + str + ":<br>" + "</strong>" + msg;

                    $('#add').click(function() {
                        add(str, msg);
                    });

                    $('#site').click(function() {
                        site(str);
                    });

                });
        } else {
            document.getElementById('revert').innerHTML = "It is not a Google Search Page, Search will not work but you can see the list by clicking 'Show all' button";
            $('#p').css("display", "none");
            $("form").css("display", "block");

            $('#btn').click(function() {
                var str = $('#link').val();
                if (str.search(/^[A-z]+$/)) {
                    $('#meaning').html("Enter Valid Text");
                    return;
                }
                $('#revert').html("Working....");
                $('#meaning').html(null);
                str = str.toLowerCase();

                $(document).on('submit', '#reg-form', function() {
                    $.post('http://sarcnitj.com/Server%20Side/index.php', {
                        link: str
                    }, function(msg) {
                        str = str.toUpperCase();
                        var def = "<strong>" + "Meaning of " + str + ":<br>" + "</strong>" + msg;
                        $("#revert").html(def);

                        $('#add').click(function() {
                            add(str, msg);
                        });
                    });
                    return false;
                });

                $('#site').click(function() {
                    site(str);
                });
            });
        }


        $('#show').click(function() {
            chrome.storage.sync.get('userKeyIds', function(result) {
                if (!result.userKeyIds || result.userKeyIds == "") {
                    document.getElementById('meaning').innerHTML = "No Item in the list";
                } else {
                    var set = result.userKeyIds;
                    // console.log($(set));
                    // set = set.toString();
                    // set = set.replace(/,/g, "#");
                    // document.getElementById('meaning').innerHTML =  set;
                    //var set = set.split(",");
                    var cList = $('#mylist')

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


                    $('#del').click(function() {
                        $('#mylist li').has('input:checked').remove();
                        var data = [];

                        $('#mylist').each(function() {
                            $(this).find('li').each(function() {
                                // cache jquery var
                                var current = $(this);
                                // check if our current li has children (sub elements)
                                // if it does, skip it
                                data.push(current.text());
                            });
                        });

                        chrome.storage.sync.set({
                            userKeyIds: data
                        }, function() {});
                    });

                    $('#site').click(function() {
                        site(str);
                    });
                }
            });
        }); //show

    }); //Tabs Query

    //Jquery ADD Click handler to add WORD-MEANING set in storage
    function add(str, msg) {
        chrome.storage.sync.get({
            userKeyIds: null
        }, function(result) {
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

            var userKeyIds = result.userKeyIds;
            var arr = $.makeArray(userKeyIds);
            arr.push(str + " :-  " + msg);

            chrome.storage.sync.set({
                userKeyIds: arr
            }, function() {
                // you can use strings instead of objects
                // if you don't  want to define default values
                // chrome.storage.sync.get('userKeyIds', function () {
                //document.getElementById('meaning').innerHTML =  result.userKeyIds;
                //	});
            });
            // localStorage.setItem("count",ticker.toString());
        });
    } //add


    function site(str) {

        if (!str) {
            $('#meaning').html("No word Selected, select a word first");
        } else {
            chrome.tabs.create({
                'url': "http://yourdictionary.com/" + str.toLowerCase()
            }, function(tab) {
                // Tab opened.
            });
        }
    }

    $('#clear').click(function() {
        chrome.storage.sync.clear();
        localStorage.setItem("count", "0");
    });

    // Helper method to parse the title tag from the response.
    function getTitle(text) {
        return text.match('<title>(.*)?</title>')[1];
    }


    searchVocab = function(word) {
        var query = word.selectionText;

        //   var Notification=(function(){
        //   var notification=null;

        //   return {
        //       display:function(opt){
        //    			      notification=chrome.notifications.create(opt);
        //             notification.show();
        //         },
        //       hide:function(){
        //             notification.close();
        //         }
        //     };
        // })();

        $.ajax({
                type: "POST",
                url: "http://sarcnitj.com/Server%20Side/index.php",
                data: {
                    link: query
                }
            })
            .done(function(msg) {
                // var opt = {
                //     type: "basic",
                //     title: "Meaning of "+ query.toUpperCase(),
                //     message: msg,
                //     iconUrl: "icon.png"
                // };
                // Notification.display(opt);
                query = query.toUpperCase();
                var def = "<strong>" + "Meaning of " + query + ":<br>" + "</strong>" + msg;
                $("#revert").html(def);

                $('#add').click(function() {
                    add(query, msg);
                });
            });

        $('#site').click(function() {
            site(query);
        });
    };

    chrome.contextMenus.removeAll(function() {
        chrome.contextMenus.create({
            title: "Search in Vocab",
            contexts: ["selection"], // ContextType
            onclick: searchVocab // A callback function
        });
    });

}, false);
