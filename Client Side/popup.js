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

                    //Jquery ADD Click handler to add WORD-MEANING set in storage
                    $('#add').click(function() {
                        chrome.storage.sync.get({
                            userKeyIds: "<b>The list of Words</b>"
                        }, function(result) {
                            // the input argument is ALWAYS an object containing the queried keys
                            // so we select the key we need

                            if (!localStorage.getItem("count")) {
                                localStorage.setItem("count", "0");
                            }
                            var i = localStorage.getItem("count");
                            var ticker = parseInt(i);
                            ticker++;

                            var userKeyIds = result.userKeyIds + "<br><br>";
                            var arr = $.makeArray(userKeyIds);
                            arr.push(ticker, ".", " ", str, ":-", msg);
                            arr = arr.join(" ");
                            chrome.storage.sync.set({
                                userKeyIds: arr
                            }, function() {
                                // you can use strings instead of objects
                                // if you don't  want to define default values
                                // chrome.storage.sync.get('userKeyIds', function () {
                                //document.getElementById('meaning').innerHTML =  result.userKeyIds;
                                //	});
                            });
                            localStorage.setItem("count", ticker.toString());
                        });
                    }); //add

                    $('#site').click(function() {
                        chrome.tabs.create({
                            'url': "http://yourdictionary.com/" + str.toLowerCase()
                        }, function(tab) {
                            // Tab opened.
                        });
                    });

                });
        } else {
            document.getElementById('revert').innerHTML = "It is not a Google Search Page, Search will not work but you can see the list by clicking 'Show all' button";
        }

        $('#show').click(function() {
            chrome.storage.sync.get('userKeyIds', function(result) {
                if (!result.userKeyIds) {
                    document.getElementById('meaning').innerHTML = "No Item in the list";
                } else document.getElementById('meaning').innerHTML = result.userKeyIds;

            });
        });
    });


    $('#clear').click(function() {
        chrome.storage.sync.clear();
        localStorage.setItem("count", "0");
    });

    // Helper method to parse the title tag from the response.
    function getTitle(text) {
        return text.match('<title>(.*)?</title>')[1];
    }


}, false);
