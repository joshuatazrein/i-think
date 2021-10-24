<?php
$dir = $_GET['dir'];

// Open a directory, and read its contents
echo json_encode(scandir($dir));
?>