<?php
$dir = "../../z/";

// Open a directory, and read its contents
echo json_encode(scandir($dir));
?>