<?php

$value =  $_POST['link'];
$text = strtolower($value); 
$path = 'http://www.yourdictionary.com/'.$text;

$curl = curl_init();
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $path
));
$page = curl_exec($curl);

if(curl_errno($curl)) // check for execution errors
{
	echo 'Scraper error: ' . curl_error($curl);
	exit;
}

$dom = new DOMDocument('1.0');
@$dom->loadHTML($page);
$xpath = new DomXPath($dom);
$data = $xpath->query("//div[contains(@class,'custom_entry')]");
$elements = $data->length;
if($elements>0){
    $data_array = array();
    $content = "";
    for ($i=0; $i < $elements; $i++) { 	
		echo  ($i+1).". ".$data->item($i)->nodeValue."\r\n";	
    }
}
elseif($elements==0){
    $data = $xpath->query("//div[contains(@class,'sense')]");
    $elements = $data->length;
    if($elements>0){
         for ($i=0; $i < $elements; $i++) { 	
		echo ($i+1).". ".$data->item($i)->nodeValue."\r\n";	
         }
     }
    else{
        echo "Word Not Found, Possible Cause - Spelling Mistake";
    }
}
else{
   echo "Word Not Found, Possible Cause - Spelling Mistake";
}
curl_close($curl);
?>
