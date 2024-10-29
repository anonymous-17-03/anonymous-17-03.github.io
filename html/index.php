<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maqina Buffered - Dockerlabs</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f9;
            color: #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 0;
            padding: 0;
        }
        .content {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 0;
            margin: 0;
        }
        img {
            width: 100%;
            height: auto;
            max-width: 800px;
        }
    </style>
</head>
<body>

<?php
// Número total de archivos PNG
$total_paginas = 41;

// Bucle para mostrar cada imagen PNG uno debajo del otro
 for ($i = 0; $i < $total_paginas; $i++) {
     echo '<div class="content">';
         echo "<img src='img$i.png' alt='Imagen $i'>";
             echo '</div>';
             }
             ?>

</body>
</html>

