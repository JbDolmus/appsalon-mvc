<?php
foreach ($alertas as $key => $mensajes) :
    foreach ($mensajes as $mensaje) :
        echo '<div class="alerta ' . $key . '">' . $mensaje . '</div>';
    endforeach;
endforeach;
