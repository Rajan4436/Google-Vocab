<?php
//'http://testing-ground.scraping.pro/textlist';

$value = $_POST['link'];
$text  = strtolower($value);
//$path = 'http://www.yourdictionary.com/'.$text;
$path  = 'https://en.wiktionary.org/wiki/' . $text;

$curl = curl_init();
//curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $path
));
$page = curl_exec($curl);

if (curl_errno($curl)) // check for execution errors
    {
    echo 'Scraper error: ' . curl_error($curl);
    exit;
}
//echo $page;
$dom = new DOMDocument('1.0');
@$dom->loadHTML($page);
$xpath     = new DomXPath($dom);
//$data = $xpath->query("//div[contains(@class,'NavHead')]");
$ul        = $xpath->query("//ol/li/ul");
$ul_length = $ul->length;
if ($ul_length >= 0) {
    for ($j = 0; $j < $ul_length; $j++)
        $ul->item($j)->parentNode->removeChild($ul->item($j));
}
$data     = $xpath->query("//ol/li");
//if($data->parentNode==null)
$elements = $data->length;
if ($elements > 0) {
    $data_array = array();
    $content    = "";
    for ($i = 0; $i < $elements; $i++) {
        echo nl2br(($i + 1) . ". " . $data->item($i)->nodeValue . "\r\n");
        if ($i > 4)
            exit;
    }
}
// elseif($elements==0){
//     $data = $xpath->query("//ol/li/text()[not(normalize-space()='')]");
//     $elements = $data->length;
//     if($elements>0){
//         for ($i=0; $i < $elements; $i++) { 	
// 		echo  nl2br(($i+1).". ".$data->item($i)->nodeValue."\r\n");
//                  if($i>3)
//                 exit;
//          }
//      }
//     else{
//         echo "Word Not Found, Possible Cause - Spelling Mistake";
//     }
// }
else {
    echo "Word Not Found, Possible Cause - Spelling Mistake or you have searched for plural, past, past participle of verb etc.";
}
curl_close($curl);
?>
