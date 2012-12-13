<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>X-editable PHP backend sample</title>
        <!-- jquery -->
        <script src="http://code.jquery.com/jquery-1.8.2.min.js"></script>

        <!-- x-editable -->
        <link href="http://vitalets.github.com/x-editable/assets/x-editable/jquery-editable/css/jquery-editable.css" rel="stylesheet">
        <script src="http://vitalets.github.com/x-editable/assets/x-editable/jquery-editable/js/jquery-editable-inline.js"></script>
    </head>
    <body style="padding: 100px 100px">
         
      <?php
      /*
      Let's assume we have loaded record from database 
      */
      $user = array(
      'user_id' => 1,
      'user_name' => 'Awesome',
      'group_id' => 3
      );
      
      /*
      Render user_name and group as editable links
      */
      echo '<div id="user">';
      echo 'Username: <a href="#" id="user_name" data-type="text" data-pk="'.$user['user_id'].'" title="Enter username">'.$user['user_name'].'</a><br>';
      echo 'Group: <a href="#" id="group_id" data-type="select" data-pk="'.$user['user_id'].'" data-value="'.$user['group_id'].'" data-source="groups.php" title="Select group"></a><br>';
      echo '</div>';
      ?>
                         
     <?
      /*
       In javascript apply $().editable() to both links on DOM ready
      */
     ?>
     <script>   
       $(function(){
          $('#user a').editable({
             url: 'post.php' 
          });
       });
     </script>
        
    </body>
</html>