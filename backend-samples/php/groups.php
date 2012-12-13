<?php
/*
  Script outputs data in json format suitable for 'source' option in X-editable
*/

sleep(1);   

$groups = array(
  array('value' => 0, 'text' => 'Guest'),
  array('value' => 1, 'text' => 'Service'),
  array('value' => 2, 'text' => 'Customer'),
  array('value' => 3, 'text' => 'Operator'),
  array('value' => 4, 'text' => 'Support'),
  array('value' => 5, 'text' => 'Guest'),
);

echo json_encode($groups);  